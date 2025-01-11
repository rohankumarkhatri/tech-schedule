import { View, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { GETisUserSignedIn, GETdoesUserHaveCourses, GETisUserFaculty } from "../utils/helper-functions/GetSet_UserStatus";
import { clear } from "../utils/services/asyncStorage";
import { SETisUserSignedIn, SETisUserFaculty, SETdoesUserHaveCourses } from "../utils/helper-functions/GetSet_UserStatus";

//Checks the state of the user and redirects to the appropriate screen
export default function Index() {

    useEffect(() => {
        // clear();
        // router.replace('./SetUpForStudent');
        navigateToAppropriateScreen();
    }, []);

}


const navigateToAppropriateScreen = async () => {

    
    if(!await GETisUserSignedIn()) { //if not signed in, redirect to signin
        return router.replace('./signinpage');
    }
    else if(await GETdoesUserHaveCourses()) { //if user has courses, redirect to the first tab
        return router.replace('./(tabs)/1');
    }
    else if (await GETisUserFaculty()) { //if no course but user is faculty, redirect to SelectCoursesForFaculty
        return router.replace('./SelectCoursesForFaculty');
    }
    else { //if no course and not faculty (student), redirect to SelectCourses
        return router.replace('./SetUpForStudent');
    }
}

