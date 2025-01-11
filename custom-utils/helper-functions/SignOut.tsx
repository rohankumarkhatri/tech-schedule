import { clear } from "../service-functions/AsyncStorage";
import { router } from "expo-router";
import { updateSignOutInFirestore } from "../service-functions/FirebaseFunctions";
import { GETisUserFaculty, SETisUserSignedIn } from "./GetSetFunctions";

export default async function signOut() {  
    
    SETisUserSignedIn(false)
    
    if(!(await GETisUserFaculty())) {
        await updateSignOutInFirestore();
        clear();
        router.replace('/');
    }
    else {
        await updateSignOutInFirestore()
        clear();
        router.replace('/');
    }
}