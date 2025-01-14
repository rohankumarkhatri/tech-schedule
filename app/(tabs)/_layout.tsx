import { StyleSheet, Pressable, Text, View, Animated, Easing, Image, Linking, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { createMaterialTopTabNavigator, } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

//CUSTOM STUFF
import { ClubDataType } from '@/custom-utils/interfaces/ClubInterfaces';
import { CourseDataType } from '@/custom-utils/interfaces/CourseInterfaces';
import { detachCoursesListeners, detachClubsListeners, detachDaysOffListeners, deleteMyPushTokenFromAllClubs,} from '@/custom-utils/service-functions/FirebaseFunctions';
import { extractPrimaryInstructorFromLongString, parseMeetingTimes } from "@/custom-utils/helper-functions/CoursesHelperFunctions";
import { GETisUserFaculty, GETisUserSignedIn, SETdoesUserHaveCourses, GETallClubs, GETmyAcceptedClubs, GETreceivedClubsInNotification, GETrejectedClubsNames, SETallClubs, SETmyAcceptedClubs, SETreceivedClubsInNotification, SETrejectedClubsNames, SETturnOffDays, GETmyCoursesArray, SETmyCoursesArray, GETdoesUserHaveClubs } from '@/custom-utils/helper-functions/GetSetFunctions';
import signOut from '@/custom-utils/helper-functions/SignOut';
import { hashFunctionPolynomial } from '@/custom-utils/helper-functions/ClubsHelperFunctions';
import ClubOptionsModal from '@/custom-components/club-meeting-share-components/ClubOptionsModal';

//ICONS
import Entypo from '@expo/vector-icons/build/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


//DAYS COMPONENTS
import Day1 from './1';
import Day2 from './2';
import Day3 from './3';
import Day4 from './4';
import Day5 from './5';
import Day6 from './6';
import Day7 from './7';


// REST OF THE IMPORTS
import { Context } from '../_layout';
import { useContext } from 'react';
import { ref, onValue } from "firebase/database";
import { router } from 'expo-router';
import { realTimeDb } from '@/custom-configuration-files/FirebaseConfig';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';


const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
      

    const { globalRerender, setGlobalRerender } = useContext(Context);

    const today = new Date();
    const isFacultyRef = useRef(true);
    const userHasClubs = useRef(false);
    const clubMeetingRequests = useRef(0);


    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [shareClubButtonPressed, setShareClubButtonPressed] = useState(false);

    const rotation = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;



    //SETTINGS BAR FUNCTIONS
    const toggleSettingsBar = () => {
        const toValue = isSettingsVisible ? 0 : 1;
        Animated.parallel([
            Animated.timing(rotation, {
                toValue,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.linear,
            }),
            Animated.timing(slideAnim, {
                toValue,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
        ]).start();

        setIsSettingsVisible(!isSettingsVisible);
    };

    const goToNotificationsPage = () => {
        return router.push('/notifications-page');
    };

    const SelectCourses = async () => {

        if (await GETisUserFaculty()) { //if no course but user is faculty, redirect to SelectCoursesForFaculty
            return router.replace('/faculty-setup');
        }
        else { //if no course and not faculty (student), redirect to SelectCourses
            return router.replace('/student-setup');
        }
    }

    const handleSignOut = async () => {
        await deleteMyPushTokenFromAllClubs();
        await signOut();
    };
    //SETTINGS BAR FUNCTIONS




    //SETTING BAR ANIMATION
    const rotateInterpolate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-90deg'],
    });

    const slideInterpolate = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0], // Adjust this value to control the slide distance
    });

    const animatedButtonStyle = {
        transform: [{ rotate: rotateInterpolate }],
    };

    const animatedBarStyle = {
        transform: [{ translateX: slideInterpolate }],
        opacity: slideAnim,
    };
    //SETTING BAR ANIMATION



    useEffect(() => {
        GETdoesUserHaveClubs().then((hasClubs) => { 
            userHasClubs.current = hasClubs;
        });

        GETisUserFaculty().then((isFaculty) => {

            isFacultyRef.current = isFaculty;
            if (!isFacultyRef.current) {
                Clubs_attachListeners();
            }
            CRN_attachListeners();
            attachListenersToTurnOffDays();
        });

        
  
        return () => {

            detachDaysOffListeners();
            detachCoursesListeners();
            detachClubsListeners();
        };

    }, []);

    useEffect(() => {
        GETreceivedClubsInNotification().then(r => {
            clubMeetingRequests.current = r.length
        })
    }, [globalRerender])


    //this function does two things in one shot. It attaches listeners and also defines what happens when a listener is triggered, both under onValue. Try to understand onValue.
    //so "what happens when a listener is triggered" is also called WHILE attaching listeners.
    async function CRN_attachListeners() {

        let myCoursesArray = await GETmyCoursesArray();

        if (myCoursesArray.length === 0) {
            alert('No courses selected');
            setGlobalRerender(prev => !prev);
            return;
        }

        for (const course of myCoursesArray) {
            onValue(ref(realTimeDb, `CoursesDirectory/${course.CRN}`), async (snapshot) => {

                if (snapshot.exists()) {

                    const courseFromDb = snapshot.val();

                    if (!myCoursesArray) {
                        myCoursesArray = await GETmyCoursesArray();
                    }


                    const indexOfThisCourseInLocalArray = myCoursesArray.findIndex((course: CourseDataType) => {
                        return course.CRN == courseFromDb.CRN &&
                            course.Title == courseFromDb.Title &&
                            course.SubjectDescription == courseFromDb.SubjectDescription &&
                            course.CourseNumber == courseFromDb.CourseNumber;
                    });

                    if (indexOfThisCourseInLocalArray !== -1) {

                        if (!courseFromDb.parsedMeetingTimes) { //if the instructor has made changes, the meeting times are parsed
                            courseFromDb.parsedMeetingTimes = [];
                            parseMeetingTimes(courseFromDb);
                        }

                        setPrimaryInstructor(courseFromDb);

                        myCoursesArray[indexOfThisCourseInLocalArray] = courseFromDb; //updating the course in the myCoursesArray

                        SETmyCoursesArray(myCoursesArray).then(() => {
                            setGlobalRerender(prev => !prev);
                            //probably show a toast saying                         
                        });
                    }
                    else if (indexOfThisCourseInLocalArray === -1) {
                        const faculty = await GETisUserFaculty();
                        if (faculty) {
                            alert("Please sign in again to see new courses")
                            handleSignOut();
                        }
                        SETdoesUserHaveCourses(false)
                        alert("Please enter your courses in the settings")
                        SETmyCoursesArray([]).then(() => {
                            setGlobalRerender(prev => !prev);
                        })
                    }
                }
            });
        }
    }

    function attachListenersToTurnOffDays() {

        const turnOffDaysRef = ref(realTimeDb, 'CancelMeetings');

        onValue(turnOffDaysRef, (snapshot) => {
            if (snapshot.exists()) {
                const turnOffDays = snapshot.val();
                console.log('Number of elements in turnOffDays:', Object.keys(turnOffDays).length);
                const turnOffDaysArray: any[] = [];
                for (let i = 0; i < Object.keys(turnOffDays).length / 4; i++) {
                    const element = {
                        elements: turnOffDays[`${i + 1}elements`],
                        startToEndDate: turnOffDays[`${i + 1}startToEndDate`],
                        note: turnOffDays[`${i + 1}note`]

                    };
                    turnOffDaysArray.push(element);
                }
                SETturnOffDays(turnOffDaysArray).then(() => {
                    setGlobalRerender(prev => !prev);
                });


            } else {
                console.log('No TurnOffDays data available');
            }
        });

    };

    async function Clubs_attachListeners() {

        let allClubs = await GETallClubs();


        if (allClubs.length === 0 || isFacultyRef.current) {
            console.log('No clubs selected OR user is faculty');
            return;
        }

        for (const clubName of allClubs) {

            const index = hashFunctionPolynomial(clubName.name);

            if (index === null) {
                alert(`Club ${clubName.name} not found`);
                return;
            }

            onValue(ref(realTimeDb, `ClubsDirectory/${index}`), async (snapshot) => {

                if (snapshot.exists()) {

                    const clubFromDb = snapshot.val();
                    parseMeetingObjectForClub(clubFromDb);

                    if (!allClubs) {
                        allClubs = await GETallClubs();
                    }
                    // Put the new changed club in the allClubs array
                    const clubIndex = allClubs.findIndex((c: ClubDataType) => c.name === clubFromDb.name);
                    if (clubIndex !== -1) {
                        allClubs[clubIndex] = clubFromDb;
                        SETallClubs(allClubs);
                    }

                    if (!clubFromDb.meeting.exists) {
                        await deleteClubFrom_Accepted_Recieved_Rejected(clubFromDb.name);
                    }
                    else if (clubFromDb.meeting.exists) {
                        const acceptedClubs = await GETmyAcceptedClubs();
                        const receivedClubs = await GETreceivedClubsInNotification();
                    
                        const existsInAccepted = acceptedClubs?.some((club: ClubDataType) => JSON.stringify(club) === JSON.stringify(clubFromDb)); //is it same or any change happened behind the back
                        const existsInReceived = receivedClubs?.some((club: ClubDataType) => JSON.stringify(club) === JSON.stringify(clubFromDb)); //is it same or any change happened behind the back
                        
                        if ((existsInAccepted == undefined && existsInReceived == undefined) || (existsInAccepted === false && existsInReceived === false)) {

                            await deleteClubFrom_Accepted_Recieved_Rejected(clubFromDb.name);

                            const recievedClubsAfterDeletion = await GETreceivedClubsInNotification();
                            const temp = [clubFromDb, ...recievedClubsAfterDeletion];
                            await SETreceivedClubsInNotification(temp);

                            GETreceivedClubsInNotification().then((r) => {
                                clubMeetingRequests.current = r.length
                                setGlobalRerender(prev => !prev);
                            })

                        }

                    }
                    setGlobalRerender(prev => !prev);
                }
            });
        }
    }


    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: '#484848' }}>
            <>
                <Tab.Navigator
                    tabBarPosition='bottom'
                    screenOptions={{
                        tabBarStyle: styles.tabBar,
                        tabBarIndicatorStyle: { height: 0 },
                        tabBarLabelStyle: { fontSize: 25, fontWeight: 'bold', textTransform: 'capitalize' },
                        tabBarActiveTintColor: 'white',
                        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
                        lazy: false,
                        lazyPreloadDistance: 7,
                    }}
                >
                    <Tab.Screen name={DayName(today, 1)} component={Day1} />
                    <Tab.Screen name={DayName(today, 2)} component={Day2} />
                    <Tab.Screen name={DayName(today, 3)} component={Day3} />
                    <Tab.Screen name={DayName(today, 4)} component={Day4} />
                    <Tab.Screen name={DayName(today, 5)} component={Day5} />
                    <Tab.Screen name={DayName(today, 6)} component={Day6} />
                    <Tab.Screen name={DayName(today, 7)} component={Day7} />
                </Tab.Navigator>


                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', position: 'absolute', right: 15, bottom: 100 }}>

                    {/* Settings Bar */}
                    <Animated.View style={[styles.settingsBar, animatedBarStyle]}>

                        <Pressable style={styles.settingsButton} onPress={() => { handleSignOut() }} disabled={!isSettingsVisible}>
                            <MaterialIcons name="logout" size={26} color="white" />
                        </Pressable>

                        {!isFacultyRef.current && (
                            <Pressable style={styles.settingsButton} onPress={() => { SelectCourses() }} disabled={!isSettingsVisible}>
                                <Feather name="settings" size={24} color="white" />
                            </Pressable>
                        )}

                        <Pressable style={[styles.settingsButton]} onPress={() => Linking.openURL('https://buymeacoffee.com/rohankk')} disabled={!isSettingsVisible}>
                            <Feather name="coffee" size={26} color="white" />
                        </Pressable>

                        {!isFacultyRef.current && userHasClubs.current && (
                            <Pressable style={styles.settingsButton} onPress={() => { goToNotificationsPage(); toggleSettingsBar() }} disabled={!isSettingsVisible}>
                                <Ionicons name="notifications-outline" size={28} color="white" />  
                                {clubMeetingRequests.current > 0 &&
                                    <View style={{
                                        position: 'absolute',
                                        right: 5,
                                        top: 0,
                                        backgroundColor: 'red',
                                        borderRadius: 10,
                                        width: 20,
                                        height: 20,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{clubMeetingRequests.current}</Text>
                                    </View>}
                            </Pressable>
                        )}

                         {!isFacultyRef.current && userHasClubs.current && (
                            <Pressable style={styles.settingsButton} onPress={() => { setShareClubButtonPressed(true); toggleSettingsBar(); }} disabled={!isSettingsVisible}>
                                <Entypo name="plus" size={36} color="white" />
                            </Pressable>
                        )}

                    </Animated.View>

                    {/* Circular Button Positioned Above the Tab Navigator */}
                    <Pressable style={[styles.circularButtonTomato]} onPress={() => {
                        toggleSettingsBar();
                    }}>
                        <View style={[styles.imageContainer, { marginTop: -3 }]}>
                            <Animated.View style={[styles.imageContainer, animatedButtonStyle]}>
                                <Image source={require('../../assets/images/DrawerMenuIcon.png')} style={[styles.buttonImage]} />
                            </Animated.View>
                            {!isFacultyRef.current && clubMeetingRequests.current > 0 && !isSettingsVisible &&
                                <View style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    backgroundColor: 'red',
                                    borderRadius: 10,
                                    width: 20,
                                    height: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{clubMeetingRequests.current}</Text>
                                </View>}
                        </View>
                    </Pressable>

                </View>

                {!isFacultyRef.current && (
                    <ClubOptionsModal shareButtonPressed={shareClubButtonPressed} setShareButtonPressed={setShareClubButtonPressed} />
                )}

            </>

        </SafeAreaView>
    );

}


const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: 'rgba(0,0,0,1)', // Set background color to black
        opacity: 0.85,
        borderRadius: 20, // Optional: Add border radius
        marginHorizontal: 10,
        position: 'relative',
        bottom: 120, // Adjust this value to raise it higher
        marginBottom: -100,
    },
    settingsBar: {
        position: 'relative',
        right: -40,
        paddingRight: 48,
        paddingLeft: 20,
        paddingTop: 9,
        flexDirection: 'row', // Arrange items in a row
        justifyContent: 'space-between',
        gap: 6,
        backgroundColor: 'rgba(35,35,35,1)',
        borderRadius: 14,
        padding: 5,
        height: 60,
        shadowColor: "black",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        opacity: 0, // Initially hidden
    },
    settingsButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
    },
    settingsButtonText: {
        marginTop: 2,
        alignSelf: 'center',
        color: 'white',
        fontSize: 10,
    },
    circularButtonTomato: {
        backgroundColor: 'rgba(30,30,30,1)', // Example background color
        opacity: 0.9,
        borderRadius: 100, // Circular shape
        justifyContent: 'center', // Center content
        alignItems: 'center', // Center
        width: 60, // Width of the button
        height: 60, // Height of the button 
        shadowColor: "black",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        marginTop: 3,
    },
    buttonImage: {
        width: 35, // Adjust the size as needed
        height: 35, // Adjust the size as needed
        marginTop: -3,
    },
    centeredModal: {
        justifyContent: 'center',
        margin: 0,
        alignItems: 'center',
        height: '100%',
        width: '100%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        height: '100%',
        width: '100%',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
    },
    closeButton: {
        padding: 10,
        backgroundColor: 'black',
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    notificationButton: {
        backgroundColor: 'rgba(25,25,25,1)',
        opacity: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        shadowColor: "black",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 3,
        borderRadius: 50,
    },
    notificationContent: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    notificationText: {
        color: 'white',
        fontSize: 25,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 30,
    },
});





const DayName = (date: Date, dayNum: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + dayNum - 1);
    const dayName = nextDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Handle duplicate initials by appending a zero-width space
    const uniqueSuffix: { [key: string]: string } = {
        'Sunday': 'S',
        'Monday': 'M',
        'Tuesday': 'T\u200B', // Append zero-width space
        'Wednesday': 'W',
        'Thursday': 'T', // No zero-width space
        'Friday': 'F',
        'Saturday': 'S\u200B' // Append zero-width space
    };

    return uniqueSuffix[dayName];
};



function parseMeetingObjectForClub(club: ClubDataType) {
    if (!club.meeting) {
        club.meeting = {
            exists: false,
            building: '',
            room: '',
            startDate: new Date(),
            endDate: new Date(),
            days: [],
            startTime: 0,
            endTime: 0,
            note: '',
            senderEmail: '',
            senderName: '',
        };
    }
}

function setPrimaryInstructor(course: CourseDataType) {
    if (course.InstructorsNamesWithPrimary.length > 0) {
        const primaryInstructor = extractPrimaryInstructorFromLongString(course.InstructorsNamesWithPrimary);
        if (primaryInstructor) {
            course.PrimaryInstructor = primaryInstructor;
            for (const instructor of course.Instructors) {
                if (instructor.name === primaryInstructor) {
                    course.PrimaryInstructor_url = instructor.url;
                }
            }
        }
    }
}


const deleteClubFrom_Accepted_Recieved_Rejected = async (clubName: string) => {

    const rejectedClubs = await GETrejectedClubsNames();
    if (rejectedClubs) {
        const updatedRejectedClubs = rejectedClubs.filter((club: string) => club != clubName);
        if (updatedRejectedClubs.length !== rejectedClubs.length) {
            await SETrejectedClubsNames(updatedRejectedClubs);
        }
    }

    const myAcceptedClubsArray = await GETmyAcceptedClubs();
    if (myAcceptedClubsArray) {
        const updatedAcceptedClubs = myAcceptedClubsArray.filter((club: ClubDataType) => club.name != clubName);
        await SETmyAcceptedClubs(updatedAcceptedClubs);
    }

    const receivedClubsInNotification = await GETreceivedClubsInNotification();
    if (receivedClubsInNotification) {
        const updatedReceivedClubs = receivedClubsInNotification.filter((club: ClubDataType) => club.name != clubName);
        await SETreceivedClubsInNotification(updatedReceivedClubs);
    }
};


async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to get push token for push notification!');
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError('Project ID not found');
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError('Must use physical device for push notifications');
    }
  }
  
  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }
  