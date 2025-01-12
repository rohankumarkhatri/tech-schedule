import { getItem, setItem } from "../service-functions/AsyncStorage";
import { ClubDataType } from "../interfaces/ClubInterfaces";
import { CourseDataType } from "../interfaces/CourseInterfaces";




//USER GET SET FUNCTIONS
export async function GETisUserSignedIn() {

    const isUserSignedIn = await getItem('isUserSignedIn');
    console.log('isUserSignedIn: ' + isUserSignedIn);
    return isUserSignedIn;
}
export async function SETisUserSignedIn(isUserSignedIn: boolean) {

    setItem('isUserSignedIn', isUserSignedIn);
}


export async function GETdoesUserHaveCourses() {

    const userHasCourses = await getItem('userHasCourses');
    console.log('userHasCourses: ' + userHasCourses);
    return userHasCourses;
}

export async function GETdoesUserHaveClubs() {

    const userHasClubs = await getItem('userHasClubs');
    console.log('userHasClubs: ' + userHasClubs);
    return userHasClubs;
}

export async function SETdoesUserHaveCourses(userHasCourses: boolean) {

    setItem('userHasCourses', userHasCourses);
}

export async function SETdoesUserHaveClubs(userHasClubs: boolean) {

    setItem('userHasClubs', userHasClubs);
}


export async function GETisUserFaculty() {

    const isFaculty = await getItem('isFaculty');
    return isFaculty;
}
export async function SETisUserFaculty(isFaculty: boolean) {

    setItem('isFaculty', isFaculty);
}

export async function GETUserEmail() {

    const userEmail = await getItem('UserEmail');
    return userEmail;
}

export async function SETUserEmail(userEmail: string) {
    setItem('UserEmail', userEmail)
}

export async function GETUserFamilyName() {

    const userFamilyName = await getItem('UserFamilyName');
    return userFamilyName;

}

export async function SETUserFamilyName(userFamilyName: string) {

    setItem('UserFamilyName', userFamilyName);

}

export async function GETUserGivenName() {

    const userGivenName = await getItem('UserGivenName');
    return userGivenName;
}

export async function SETUserGivenName(userGivenName: string) {
    setItem('UserGivenName', userGivenName);
}

export async function GETUserFullName() {
    const userGivenName = await GETUserGivenName();
    const userFamilyName = await GETUserFamilyName();
    return userGivenName + " " + userFamilyName;
}




// CLUBS GET SET FUNCTIONS
export async function GETreceivedClubsInNotification() {
    const receivedClubsInNotification = await getItem('receivedClubs_inNotification');
    return receivedClubsInNotification;
}

export async function SETreceivedClubsInNotification(receivedClubsInNotification: ClubDataType[]) {
    setItem('receivedClubs_inNotification', receivedClubsInNotification);
}

export async function GETmyAcceptedClubs() {
    const myAcceptedClubs = await getItem('myAcceptedClubsArray');
    return myAcceptedClubs;
}

export async function SETmyAcceptedClubs(myAcceptedClubs: ClubDataType[]) {
    setItem('myAcceptedClubsArray', myAcceptedClubs);
}      

export async function GETrejectedClubsNames() {
    const rejectedClubNames = await getItem('rejectedClubs');
    return rejectedClubNames;
}

export async function SETrejectedClubsNames(rejectedClubsNames: string[]) {
    setItem('rejectedClubs', rejectedClubsNames);
}


export async function GETallClubs() {
    const allClubs = await getItem('allClubs');
    return allClubs;
}

export async function SETallClubs(allClubs: ClubDataType[]) {
    setItem('allClubs', allClubs);
}




// COURSES GET SET FUNCTIONS
export async function GETmyCoursesArray() {
    const x = await getItem('myCoursesArray');
    return x;         
}

export async function SETmyCoursesArray(courses: CourseDataType[]) {
    setItem('myCoursesArray', courses);
}





