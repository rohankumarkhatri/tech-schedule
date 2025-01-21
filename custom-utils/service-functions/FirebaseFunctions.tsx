import {
  realTimeDb,
  fireStoreDb,
} from "../../custom-configuration-files/FirebaseConfig";
import { ref, get, getDatabase, update, onValue, off } from "firebase/database";
import {
  doc,
  setDoc,
  getDoc,
  getFirestore,
  updateDoc,
  deleteDoc,
  deleteField,
} from "firebase/firestore";
import { ClubDataType } from "../interfaces/ClubInterfaces";
import {
  GETUserEmail,
  GETUserGivenName,
  GETUserFamilyName,
  GETallClubs,
  GETmyCoursesArray,
  GETUserFullName,
  GETisUserCustom,
  GETUserPassword,
} from "../helper-functions/GetSetFunctions";
import NetInfo from "@react-native-community/netinfo";

//*********************************************************************************************************************

//STUDENT ONLY FUNCTIONS START
export function getFirestoreDocument(collection: string, document: string) {
  const docRef = doc(fireStoreDb, collection, document);
  return getDoc(docRef);
}

export function setFirestoreDocument(
  collection: string,
  document: string,
  data: any
) {
  const docRef = doc(fireStoreDb, collection, document);
  return setDoc(docRef, data);
}

export function detachCoursesListeners() {
  GETmyCoursesArray().then((courses) => {
    courses.map((course: any) => {
      off(ref(realTimeDb, `CoursesDirectory/${course.crn}`));
    });
  });
}

export async function fetchStudentDocumentFromFirestore() {

  const studentEmail = await GETUserEmail();
  const dataSnapshot = await getFirestoreDocument("students", studentEmail);


  if (dataSnapshot.exists()) { 
    //student document found i.e. user is not new
    console.log('a',dataSnapshot.data());
    return dataSnapshot.data();
  } else {
    // student document not found i.e. new user

    console.log("No student document found for the student", studentEmail);
    console.log("Adding new student document for the student", studentEmail);
    await addStudentToFirestore();
    return [];
  }
}
 
export async function updateStudentInFirestore(
  data: any[],
  type: "crns" | "clubs" | "work"
) {
  const email = await GETUserEmail();

  if (type === "crns") {
    const crns = data;
    await updateDoc(doc(fireStoreDb, "students", email), { crns: crns });
  }

  if (type === "clubs") {
    const clubs = data;
    await updateDoc(doc(fireStoreDb, "students", email), { clubs: clubs });
  }

  if (type === "work") {
    const work = data;
    await updateDoc(doc(fireStoreDb, "students", email), { work: work });
  }
}

export async function addInstructorToFirestore() {
  const email = await GETUserEmail();
  const given_name = await GETUserGivenName();
  const family_name = await GETUserFamilyName();

  const instructorData: any = {
    email: email,
    given_name: given_name,
    family_name: family_name,
    isSignedIn: true,
  };
  await setFirestoreDocument("instructor", email, instructorData);
}

 

export async function addStudentToFirestore() {
  const email = await GETUserEmail();
  const given_name = await GETUserGivenName();
  const family_name = await GETUserFamilyName();
  const isUserCustom = await GETisUserCustom();
  //   const rNumber = await getItem('rNumber');
  if(isUserCustom){
    const studentData: any = {
      email: email,
      given_name: given_name,
      family_name: family_name,
      isSignedIn: true,
      password: await GETUserPassword()
    };
    await setFirestoreDocument("students", email, studentData);
    return;
  }
  const studentData: any = {
    email: email,
    given_name: given_name,
    family_name: family_name,
    isSignedIn: true,
    // rNumber: rNumber,
  };
  await setFirestoreDocument("students", email, studentData);
}
 
// export async function updateSignOutInFirestore() {
//   try {
//     const email = await GETUserEmail();
//     await updateDoc(doc(fireStoreDb, "students", email), {
//       isSignedIn: false,
//     });
//   } catch (error) {
//     console.error("Error updating sign out status:", error);
//   }
// }

export async function findUserInFirestore(email: string) {
  const userDoc = await getFirestoreDocument("students", email);
  if (userDoc.exists()) {
    return userDoc.data();
  } else {
    console.log("No user found with email:", email);
    return null;
  }
}

export async function updateSignOutInInstructorFirestore() {
  try {
    const email = await GETUserEmail();
    await updateDoc(doc(fireStoreDb, "instructors", email), {
      isSignedIn: false,
    });
  } catch (error) {
    console.error("Error updating sign out status:", error);
  }
}

export async function getCourseFromRealTimeDb(crn: number) {
  const courseRef = ref(realTimeDb, `CoursesDirectory/${crn}`);
  const courseSnapshot = await get(courseRef);
  return courseSnapshot.exists() ? courseSnapshot.val() : null;
}
//STUDENT ONLY FUNCTIONS END

//*********************************************************************************************************************

//FACULTY ONLY FUNCTIONS START
/**
 * Updates the course in the realtime database
 * @param {number} crn - The CRN of the course
 * @param {object} dataToChange - The data to update
 * @returns
 */
export function updateCourseInRealtimeDatabase(crn: number, dataToChange: any) {
  return update(ref(realTimeDb, `CoursesDirectory/${crn}`), dataToChange);
}
// export async function getCourseFromRealtimeDatabase(indexInDirectory: number) {
//   const snapshot = await get(ref(realTimeDb, `CoursesDirectory/${indexInDirectory}`));
//   if (snapshot.exists()) {
//     return snapshot.val();
//   } else {
//     console.log(`No course found at index ${indexInDirectory}`);
//     return null;
//   }
// }
//FACULTY ONLY FUNCTIONS END

//*********************************************************************************************************************

export async function updateClubInRealtimeDatabase(club: ClubDataType) {
  try {
    await update(ref(realTimeDb, `ClubsDirectory/${club.index}`), club);
  } catch (error) {
    console.error("Error updating club:", error);
    throw error;
  }
}

export async function getClubFromRealtimeDatabase(indexInDirectory: number) {
  try {

    const clubRef = ref(realTimeDb, `ClubsDirectory/${indexInDirectory}`);
    const clubSnapshot = await get(clubRef);
    return clubSnapshot.exists() ? clubSnapshot.val() : null;

  } catch (error) {
    console.error("Error getting club:", error);
    throw error;
  }
}



export async function addMyPushTokenToClubs(userToken: string | null, clubNames: string[]) {
  
  if(userToken === null){ return; }

  const email = await GETUserEmail();
  const username = email.split("@")[0];
  const expoObject: any = {
    [username.toString()]: {
      token: userToken,
      dateBeingAdded: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  }

  for (const club of clubNames) {
    await updateDoc(doc(fireStoreDb, "tokens", club), expoObject);
  }
}

export async function deleteMyPushTokenFromAllClubs() {

  const clubsAll = await GETallClubs();
  console.log(clubsAll);
  if(!clubsAll || clubsAll.length === 0){ return; }
  
  const clubs = clubsAll.map((club: any)=>club.name);
  console.log(clubs)
  const email = await GETUserEmail();
  const username = email.split("@")[0];
  
  for (const club of clubs) {
    console.log('deleting push token from: ',club)
    updateDoc(doc(fireStoreDb, `tokens/${club}`), { [username]: deleteField() });
  } 

}

export async function getAllTokensForThisClub(clubName: string) {

  const tokens = await getFirestoreDocument('tokens', `${clubName}`);
  if (tokens.exists()) {
    //student document found i.e. user is not new
    const x = tokens.data();
    const tokensArray = Object.values(x).map((item: any) => item.token);
    return tokensArray;
  } else {
    // student document not found i.e. new user
    console.log("No tokens found for the club", clubName);
    return [];
  }

}



export function detachClubsListeners() {
  GETallClubs().then((clubsNames) => {
    for (const club of clubsNames) {
      off(ref(realTimeDb, `ClubsDirectory/${club.index}`));
    }
  });
}
export function detachDaysOffListeners() {
  off(ref(realTimeDb, `CancelMeetings`));
}

//BOTH STUDENT AND FACULTY FUNCTIONS START
export function fetchCoursesDirectoryFromRlDb() {
  const coursesRef = ref(realTimeDb, `CoursesDirectory`);
  return get(coursesRef);
}

// export function fetchCoursesDirectoryFromRlDb() {
//   return require('../../Data/TexasTechCourseDirectory.json');
// }
//BOTH STUDENT AND FACULTY FUNCTIONS END

//*********************************************************************************************************************
