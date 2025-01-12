import { router } from "expo-router";
import { useEffect } from "react";
import { GETdoesUserHaveCourses, GETisUserFaculty, GETisUserSignedIn } from "@/custom-utils/helper-functions/GetSetFunctions";


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

