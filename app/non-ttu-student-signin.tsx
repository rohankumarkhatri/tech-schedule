import { SETisUserCustom, SETisUserFaculty, SETisUserSignedIn, SETUserEmail, SETUserFamilyName, SETUserGivenName, SETUserPassword } from '@/custom-utils/helper-functions/GetSetFunctions';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { router } from 'expo-router';
import { findUserInFirestore } from '@/custom-utils/service-functions/FirebaseFunctions';

export default function non_ttu_student_signin() {
    
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const userStateInDatabase = useRef("netural")

    // Add form validation
    const isFormValid = isLogin
        ? email.trim() !== '' && password.trim() !== ''
        : firstName.trim() !== '' && lastName.trim() !== '' && email.trim() !== '' && password.trim() !== '';


    const  handleSubmit = async () => {
        if (isLogin) {
            setButtonState(BUTTON_STATES.CHECKING_ACCOUNT);
            const response = await findUserInFirestore(email);
            if(response === null) {
                setButtonState(BUTTON_STATES.NORMAL);
                alert('Account does not exist. Please create an account.');
                return;
            }
            await SETUserEmail(response.email);
            await SETUserFamilyName(response.family_name);
            await SETUserGivenName(response.given_name);
            
            setButtonState(BUTTON_STATES.CONFIRMED);

            await SETisUserCustom(true);
            await SETUserPassword(password);
            SETisUserFaculty(false);
            SETisUserSignedIn(true);
                       
            setTimeout(() => {
                router.replace('/student-setup');
            }, 1000);

        } else {
            setButtonState(BUTTON_STATES.SIGNING_UP);

            const response = await findUserInFirestore(email);
            if(response !== null) {
                setButtonState(BUTTON_STATES.NORMAL);
                alert('Account already exists. Please log in.');
                return;
            }
            await SETUserFamilyName(lastName);
            await SETUserGivenName(firstName);
            await SETUserEmail(email);
            await SETisUserCustom(true);
            await SETUserPassword(password);
            SETisUserFaculty(false);
            SETisUserSignedIn(true);
            setButtonState(BUTTON_STATES.CONFIRMED);
            
            setTimeout(() => {
                router.replace('/student-setup');
            }, 1000);
        }
    };


    const INTERNET_STATES = Object.freeze({
        NORMAL: 0,
        NO_INTERNET: 3,
    });

    const BUTTON_STATES = Object.freeze({
        SIGNING_UP: 'Signing Up...',
        CHECKING_ACCOUNT: 'Finding Account...',
        CONFIRMED: 'Confirmed',
        NORMAL: 'Normal',
    });

    const [buttonState, setButtonState] = useState<string>(BUTTON_STATES.NORMAL);
    const [internet, setInternet] = useState<number>(INTERNET_STATES.NORMAL);


    useEffect(() => {

        // Check initial internet connection
        NetInfo.fetch().then(state => {
            if (!state.isConnected) {
                setInternet(INTERNET_STATES.NO_INTERNET);
            }
        });

        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            if (!state.isConnected) {
                setInternet(INTERNET_STATES.NO_INTERNET);
            } else {
                setInternet(INTERNET_STATES.NORMAL);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <View style={{flex: 1, backgroundColor: '#1a1a1a'}}>
        
            <KeyboardAvoidingView  behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <Text style={styles.title}>{isLogin ? 'Log In' : 'Create Account'}</Text>
                {!isLogin && (
                    <>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={firstName}
                                onChangeText={setFirstName} 
                                placeholder='First Name'
                                placeholderTextColor={'rgb(112, 112, 112)'}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder='Last Name'
                                placeholderTextColor={'rgb(112, 112, 112)'}
                            />
                        </View>
                    </>
                )}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[
                            styles.input,
                            email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && { borderColor: 'red' },
                        ]}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder='Email'
                        placeholderTextColor={'rgb(112, 112, 112)'}
                    />
                    {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                        <Text style={{ color: 'red', marginTop: 5 }}>Invalid email address</Text>
                    )}
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                        autoCapitalize='none'
                        placeholder='Password'
                        placeholderTextColor={'rgb(112, 112, 112)'}
                    />
                </View> 
                <TouchableOpacity
                    style={{
                        backgroundColor:
                                buttonState === BUTTON_STATES.NORMAL && isFormValid && internet === INTERNET_STATES.NORMAL
                                ? '#e86464'
                                : buttonState === BUTTON_STATES.SIGNING_UP && isFormValid && internet === INTERNET_STATES.NORMAL
                                ? '#f1c40f'
                                : buttonState === BUTTON_STATES.CHECKING_ACCOUNT && isFormValid && internet === INTERNET_STATES.NORMAL
                                ? '#3498db'
                                : buttonState === BUTTON_STATES.CONFIRMED && isFormValid && internet === INTERNET_STATES.NORMAL
                                ? '#2ecc71'
                                :
                                'gray',
                        borderRadius: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 20, 
                        marginTop: 30,
                        height: 45,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => {handleSubmit();}}
                    disabled={
                        buttonState !== BUTTON_STATES.NORMAL || !isFormValid || internet !== INTERNET_STATES.NORMAL
                    }
                >
                    <Text style={{ color: 'white' }}>
                        {buttonState === BUTTON_STATES.SIGNING_UP
                            ? 'Signing Up...'
                            : buttonState === BUTTON_STATES.CHECKING_ACCOUNT
                            ? 'Finding Account...'
                            : buttonState === BUTTON_STATES.CONFIRMED
                            ? 'Confirmed'
                            : isLogin 
                            ? 'Log In'
                            : 'Sign Up'}
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.toggleText}>
                    {isLogin ? 'Create an account' : 'Back to Log In'}
                </Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignContent: 'center',
        marginBottom: 100,
    },
    title: {
        fontSize: 24,
        marginBottom: 40,
        textAlign: 'center',
        color: 'white',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgb(104, 104, 104)',
        padding: 10,
        borderRadius: 5,
        color: 'white',
    },
    toggleText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        bottom: 70,
        right: 0,
        left: 0,
    },
});

