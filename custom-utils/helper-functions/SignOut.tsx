import { clear } from "../service-functions/AsyncStorage";
import { router } from "expo-router";
import { deleteMyPushTokenFromAllClubs } from "../service-functions/FirebaseFunctions";
import { GETisUserFaculty, SETisUserSignedIn } from "./GetSetFunctions";
import { useNotification } from "@/contexts/NotificationsContext";

export default async function signOut() {  

    if(!(await GETisUserFaculty())) {
    await deleteMyPushTokenFromAllClubs();
}
    clear();
    router.replace('/');
    // if(!(await GETisUserFaculty())) {
    //     // updateSignOutInFirestore();
    //     router.replace('/');
    //     clear();

    // }
    // else {
    //     await deleteMyPushTokenFromAllClubs();
    //     // updateSignOutInFirestore()
    //     router.replace('/');
    //     clear();
    // }
}
