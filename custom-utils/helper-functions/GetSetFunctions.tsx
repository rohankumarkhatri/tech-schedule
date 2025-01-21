import { getItem, setItem } from "../service-functions/AsyncStorage";
import { ClubDataType } from "../interfaces/ClubInterfaces";
import { CourseDataType } from "../interfaces/CourseInterfaces";




//USER GET SET FUNCTIONS
export async function GETisUserSignedIn() {

    const isUserSignedIn = await getItem('isUserSignedIn');
    if(isUserSignedIn === null) {
        return false;
    }
    return isUserSignedIn;
}
export async function SETisUserSignedIn(isUserSignedIn: boolean) {

    setItem('isUserSignedIn', isUserSignedIn);
}


export async function GETdoesUserHaveCourses() {

    const userHasCourses = await getItem('userHasCourses');
    if(userHasCourses === null) {
        return false;
    }
    return userHasCourses;
}

export async function GETdoesUserHaveClubs() {

    const userHasClubs = await getItem('userHasClubs');
    if(userHasClubs === null) {
        return false;
    }
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
    if(isFaculty === null) {
        return false;
    }
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

export async function GETisUserCustom() {
    const isUserCustom = await getItem('isUserCustom');
    if (isUserCustom === null) {
        return false;
    }
    return isUserCustom;
}

export async function SETisUserCustom(isUserCustom: boolean) {
    setItem('isUserCustom', isUserCustom);
}

export async function GETUserPassword() {
    const userPassword = await getItem('UserPassword');
    if(userPassword === null) {
        return '';
    }
    return userPassword;
}

export async function SETUserPassword(userPassword: string) {
    setItem('UserPassword', userPassword);
}


// CLUBS GET SET FUNCTIONS
export async function GETreceivedClubsInNotification() {
    const receivedClubsInNotification = await getItem('receivedClubs_inNotification');
    if(receivedClubsInNotification == null) {
        return [];
    }
    return receivedClubsInNotification;
}

export async function SETreceivedClubsInNotification(receivedClubsInNotification: ClubDataType[]) {
    setItem('receivedClubs_inNotification', receivedClubsInNotification);
}

export async function GETmyAcceptedClubs() {
    const myAcceptedClubs = await getItem('myAcceptedClubsArray');
    if(myAcceptedClubs == null) {
        return [];
    }
    return myAcceptedClubs;
}

export async function SETmyAcceptedClubs(myAcceptedClubs: ClubDataType[]) {

    setItem('myAcceptedClubsArray', myAcceptedClubs);
}      

export async function GETrejectedClubsNames() {
    const rejectedClubNames = await getItem('rejectedClubs');
    if(rejectedClubNames === null) {
        return [];
    }   
    return rejectedClubNames;
}

export async function SETrejectedClubsNames(rejectedClubsNames: string[]) {
    setItem('rejectedClubs', rejectedClubsNames);
}


export async function GETallClubs() {
    const allClubs = await getItem('allClubs');
    if(allClubs === null) {
        return [];
    }
    return allClubs;
}

export async function SETallClubs(allClubs: ClubDataType[]) {
    setItem('allClubs', allClubs);
}




// COURSES GET SET FUNCTIONS
export async function GETmyCoursesArray() {
    const x = await getItem('myCoursesArray');
    if(x === null) {
        return [];
    }
    return x;         
}

export async function SETmyCoursesArray(courses: CourseDataType[]) {
    setItem('myCoursesArray', courses);
}




// OTHER GET SET FUNCTIONS
export async function GETturnOffDays() {
    const turnOffDays = await getItem('turnOffDays');
    if(turnOffDays === null) {
        return [];
    }
    return turnOffDays;
}

export async function SETturnOffDays(turnOffDays: any) {
    setItem('turnOffDays', turnOffDays);
}




