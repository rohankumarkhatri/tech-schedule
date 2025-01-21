import { StyleSheet, View, Button, Text, TextInput, TouchableOpacity, Keyboard, Linking } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GETUserEmail, SETisUserFaculty, SETisUserSignedIn, SETUserEmail, SETUserFamilyName, SETUserGivenName } from '@/custom-utils/helper-functions/GetSetFunctions';
import SignInPressable from '@/custom-components/signin-page-components/SignInPressable';
import { FACULTY_ARRAY } from '@/constants/ProjectConstants';
import { Ionicons } from '@expo/vector-icons';


const PIN = '5020';

export default function signinpage() {

    const [emailInputVisible, setEmailInputVisible] = useState(false);
    const [manualEmail, setManualEmail] = useState('');
    const [pin, setPin] = useState('');
    const [hiddenButtonPressCount, setHiddenButtonPressCount] = useState(0);
    const hiddenButtonPressTimeout = useRef<NodeJS.Timeout | null>(null);

    const [rNumberComplete, setRNumberComplete] = useState(false);
    const [rNumber, setRNumber] = useState('');

    useEffect(() => {
        if (hiddenButtonPressCount === 5) {
            setEmailInputVisible(true);
            setHiddenButtonPressCount(0);
        }
        
    }, [hiddenButtonPressCount]);


    function handleHiddenButtonPress () {
        if (hiddenButtonPressTimeout.current) {
            clearTimeout(hiddenButtonPressTimeout.current);
        }

        setHiddenButtonPressCount(prevCount => prevCount + 1);

        hiddenButtonPressTimeout.current = setTimeout(() => {
            setHiddenButtonPressCount(0);
        }, 1000); // Reset the counter if 1 second passes without another press
    };

    function handleManualEmailSubmit(email: string, pin: string) { //press hidden button five times to log in as faculty with their email
        if (pin !== PIN) {
            alert('Incorrect PIN');
            return;
        }
        const currentUserIsFaculty = FACULTY_ARRAY.includes(email);
        if (currentUserIsFaculty) {
            SETisUserFaculty(true);
            setEmailInputVisible(false);
            SETisUserSignedIn(true);
            const responseJson = {
                family_name: 'Khatri',
                given_name: 'Rohan',
                email
            }
            saveUserInfoInLocalStorage(responseJson).then(() => {
                router.replace('./faculty-setup');
            });
        }
    }

    /** R NUMBER INPUT FUNCTIONS
    function handleRNumberSubmit(rNumber: string) {
        setRNumber(rNumber);
        setRNumberComplete(false);
        if (rNumber.length === 8) {
            setItem('rNumber', rNumber);
            setRNumberComplete(true);
            Keyboard.dismiss();
        }
    }
    useEffect(()=>{
        getItem('rNumber').then((rNumber)=>{
            if(rNumber){
                setRNumber(rNumber);
                setRNumberComplete(true);
            }
        })
    },[])
    */

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1c1c1c' }}>
            <View style={styles.container}>
                {emailInputVisible ? (
                    <View>
                        <TextInput
                            style={[styles.input, { color: 'black' }]}
                            placeholder="Enter your email"
                            placeholderTextColor="gray"
                            value={manualEmail}
                            onChangeText={setManualEmail}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter PIN"
                            placeholderTextColor="gray"
                            value={pin} 
                            onChangeText={setPin}
                            secureTextEntry
                        />
                        <Button title="Sign in as this instructor [this instructor will be reset in firestore and database i.e any canceled meeting, note, etc will go away]" onPress={() => handleManualEmailSubmit(manualEmail, pin)} />
                    </View>
                ) : null}
                {/* <TextInput
                    style={[styles.rnumberInput, { color: 'black', fontFamily: 'Arial', fontSize: 17 }, rNumberComplete ? { borderColor: '#a6e3b3', borderWidth: 3 } : { borderColor: 'transparent' }]}
                    placeholder="Enter your R# (optional)"
                    keyboardType="numeric"
                    placeholderTextColor="gray" 
                    value={rNumber}
                    onChangeText={handleRNumberSubmit}
                /> */}
                <SignInPressable onTokenReceived={StudentSignIn_handleTokenReceived} buttonText="Texas Tech Student Sign-In" />
                <SignInPressable onTokenReceived={FacultySignIn_handleTokenReceived} buttonText="Instructor" />
                <TouchableOpacity
                    onPress={() => router.push('./non-ttu-student-signin')}
                    style={{ 
                        borderRadius: 6,
                        overflow: 'hidden',
                        position: 'absolute',
                        flexDirection: 'row',
                        bottom: 90,
                    }}
                >

                    <Text style={[{lineHeight: 17, paddingTop: 2.5,  color: 'gray' }]}>Don't have TTU ID</Text>
                    <Ionicons name="arrow-forward" size={18} color="gray" style={{marginLeft: 5}} />
                </TouchableOpacity>
                <Text style={{ color: 'gray', textDecorationLine: 'underline', position: 'absolute', bottom: 50 }} onPress={() => Linking.openURL('mailto:rocinantebattleship@gmail.com')}>
                    Need Help? Contact Us
                </Text>
                <TouchableOpacity style={styles.hiddenButton} onPress={handleHiddenButtonPress} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
        backgroundColor: '#1c1c1c',
        position: 'absolute',
        top: 40,
        bottom: 0,
        left: 0,
        right: 0,
    },
    logo: {
        width: 400,
        height: 400,
        position: 'relative',
        top: -20,
        transform: [{ rotate: '10deg' }],
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        color: 'white',
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: 'white',
    },
    hiddenButton: {
        position: 'absolute',
        width: 30,
        height: 30,
        top: 50,
        right: 0,
        backgroundColor: 'transparent',
    },
    rnumberInput: {
        height: 60,
        color: 'white',
        paddingHorizontal: 15,
        marginBottom: 10,
        backgroundColor: 'white',
        width: '70%',
        borderRadius: 6,
    },
});

// Wrapper function for student sign-in
function StudentSignIn_handleTokenReceived(token: string | null) {
    handleTokenReceived(token, 'student');
}

// Wrapper function for instructor sign-in
function FacultySignIn_handleTokenReceived(token: string | null) {
    handleTokenReceived(token, 'faculty');
}

const handleTokenReceived = async (token: string | null, signInType: string) => {
    
    if (!token) {
        console.log('No token received');
        return;
    }
    if(token === 'bypass'){
        const responseJson = {
            family_name: 'Khatri',
            given_name: 'Rohan',
            email: 'rohkhatr@ttu.edu'
        }
        saveUserInfoInLocalStorage(responseJson).then(() => {
            SETisUserFaculty(false);
            SETisUserSignedIn(true);
            router.replace('./student-setup');
        });
    }
    else{

    /** TESTING GRAPH API
   // Fetch people data
   const peopleInfo = await fetchPeopleInfoFromGraphAPI(token);

   // Format and log each person's information
   peopleInfo.value.forEach((person: any) => {
       console.log(`Name: ${person.displayName}`);
       console.log(`Job Title: ${person.jobTitle || 'N/A'}`);
       console.log(`Department: ${person.department || 'N/A'}`);
       console.log(`Email: ${person.userPrincipalName || 'N/A'}`);
       console.log(`Company: ${person.companyName || 'N/A'}`);
       console.log(`Phone: ${person.phoneNumbers || 'N/A'}`);
       console.log('-----------------------------------'); // Separator for clarity
   });  
    // Fetch calendar events
    const calendarEvents = await fetchCalendarEventsFromGraphAPI(token);
    console.log('Calendar events:', calendarEvents);

    // Fetch organization info
    const organizationInfo = await fetchOrganizationInfoFromGraphAPI(token);
    console.log('Organization info:', organizationInfo);
    */

    const userInfo = await fetchUserInfoFromGraphAPI(token);
    console.log('User info', userInfo);

    
    saveUserInfoInLocalStorage(userInfo);;

    if(userInfo.email == 'rohkhatr@ttu.edu'){
        if(signInType === 'faculty'){
            SETisUserFaculty(true);
            SETisUserSignedIn(true);
            router.replace('./faculty-setup');
        }
        else if (signInType === 'student'){ 
            SETisUserFaculty(false);
            SETisUserSignedIn(true);
            router.replace('./student-setup');
        }
    }
    else {

        const currentUserIsFaculty = FACULTY_ARRAY.includes(userInfo.email);

        if (currentUserIsFaculty) {
            handleFacultySignIn(signInType);
        } else {
            handleStudentSignIn(signInType);
        }
    }
}
};

const handleFacultySignIn = (signInType: string) => {
    if (signInType === 'faculty') {
        SETisUserFaculty(true);
        SETisUserSignedIn(true);
        router.replace('./faculty-setup');
    } else {
        alert('You are a faculty member, please use the instructor sign-in to add see the courses you teach');
    }
}

const handleStudentSignIn = (signInType: string) => {
    if (signInType === 'student') {
        SETisUserFaculty(false);
        SETisUserSignedIn(true);
        router.replace('./student-setup');
    } else {
        alert('You are not Faculty, please use the student sign-in');
    }
}

const saveUserInfoInLocalStorage = async (responseJson: any) => {
    await SETUserFamilyName(responseJson.family_name);
    await SETUserGivenName(responseJson.given_name);
    await SETUserEmail(responseJson.email);
}

const fetchUserInfoFromGraphAPI = async (token: string) => {
    try {
        const response = await fetch(`https://graph.microsoft.com/oidc/userinfo`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching user info: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch user info:', error);
        return null; // Return null or handle the error as needed
    }
}




// For Testing

const fetchPeopleInfoFromGraphAPI = async (token: string) => {
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/people`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Failed to fetch people info:', errorResponse);
        throw new Error(`Error fetching people info: ${errorResponse.error.message}`);
    }

    return await response.json();
}

const fetchOrganizationInfoFromGraphAPI = async (token: string) => {
    const response = await fetch(`https://graph.microsoft.com/v1.0/tenantRelationships/multiTenantOrganization/tenants`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Failed to fetch organization info:', errorResponse);
        console.error('Response status:', response.status); // Log the response status
        console.error('Response status text:', response.statusText); // Log the status text
        throw new Error(`Error fetching organization info: ${errorResponse.error.message}`);
    }

    return await response.json();
}
       
const fetchCalendarEventsFromGraphAPI = async (token: string) => {
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Failed to fetch calendar events:', errorResponse);
        console.error('Response status:', response.status); // Log the response status
        console.error('Response status text:', response.statusText); // Log the status text
        throw new Error(`Error fetching calendar events: ${errorResponse.error.message}`);
    }

    return await response.json();
}