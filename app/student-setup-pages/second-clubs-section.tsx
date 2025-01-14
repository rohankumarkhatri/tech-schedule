import { router } from 'expo-router';
import React, { act, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Pressable, Platform } from 'react-native';
import Modal from "react-native-modal";
import Ionicons from '@expo/vector-icons/Ionicons';
import { GETallClubs, GETdoesUserHaveClubs, GETmyAcceptedClubs, GETreceivedClubsInNotification, SETallClubs, SETdoesUserHaveClubs, SETmyAcceptedClubs, SETreceivedClubsInNotification } from '@/custom-utils/helper-functions/GetSetFunctions';
import {  addMyPushTokenToClubs, fetchStudentDocumentFromFirestore, setFirestoreDocument, updateStudentInFirestore } from '@/custom-utils/service-functions/FirebaseFunctions';
import InputFields from '@/custom-components/student-clubs-selection-components/ClubInputFields';
import NextPressable from '@/custom-components/student-clubs-selection-components/ClubNextPressable';
import { useNotification } from '@/contexts/NotificationsContext';


interface props {
    onPressBack: () => void;
}

const SecondClubsSection: React.FC<props> = ({ onPressBack }) => {


    const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { expoPushToken } = useNotification();

    // This is called with the first section render. 
    useEffect(() => {
 
        const checkAndFetchClubs = async () => {
            try {
                const hasClubs = await GETdoesUserHaveClubs();
                if (hasClubs) {
                    const clubNames = await GETallClubs();
                    setSelectedClubs(clubNames.map((club: any) => club.name));
                    setIsLoading(false);
                } else {
                    const studentDocument = await fetchStudentDocumentFromFirestore() as any;   

                    if (studentDocument.clubs) {
                        setSelectedClubs(studentDocument.clubs);
                        setIsLoading(false)
                    } else {
                        setSelectedClubs([]);
                        setIsLoading(false)
                    }
                }
                GETmyAcceptedClubs().then((acceptedClubs) => {
                    if (acceptedClubs == undefined || acceptedClubs == null) {
                        SETmyAcceptedClubs([]);
                    }
                });

                GETreceivedClubsInNotification().then((receivedClubs) => {
                    if (receivedClubs == undefined || receivedClubs == null) {
                        SETreceivedClubsInNotification([]);
                    }
                });
          
            } catch (error) {
                console.error('Error fetching clubs or student document:', error);
            }
        };

        checkAndFetchClubs();

    }, []);

   
    
    function newClubAdded(club: string, index: number) {
        //add the crn to the selectedCRNs array
        const temp = [...selectedClubs];
        temp[index] = club;
        setSelectedClubs(temp);

    } 

    function deleteClub(index: number) {
        //remove the crn from the selectedCRNs array
        const temp = [...selectedClubs];
        temp[index] = '';
        const tempx = temp.filter((club) => club !== '');

        setSelectedClubs(tempx);
    }

    async function handleNextPress() {
        
        
        if (!selectedClubs || selectedClubs.length <= 0) {
            SETdoesUserHaveClubs(false);
            SETallClubs([]);
            SETmyAcceptedClubs([]);
            SETreceivedClubsInNotification([]);
            updateStudentInFirestore(selectedClubs, 'clubs');
            console.log(selectedClubs)
            router.replace('/(tabs)/1');
        } 
        const temp = selectedClubs.filter((club) => club !== '');

        const temp2 = temp.map((club) => {
            return {
                name: club,
                index: null,
                members: null,
                meeting: {
                    exists: false,
                    accepted: false,
                    building: null,
                    room: null,
                    startDate: null,
                    endDate: null,
                    days: null,
                    startTime: null,
                    endTime: null,
                    note: null,
                    senderEmail: null,
                    senderName: null,
                }
            }
        });
        
        
        SETallClubs(temp2 as any).then(async () => {

            addMyPushTokenToClubs(expoPushToken, temp);

            const acceptedClubs = await GETmyAcceptedClubs();
            if (acceptedClubs && Array.isArray(acceptedClubs)) {
                const filteredAccepted = acceptedClubs.filter((club) =>
                    temp.some((c) => c === club.name)
                );
                await SETmyAcceptedClubs(filteredAccepted);
            }

            const receivedClubs = await GETreceivedClubsInNotification();
            if (receivedClubs && Array.isArray(receivedClubs)) {
                const filteredReceived = receivedClubs.filter((club) =>
                    temp.some((c) => c === club.name)
                );
                await SETreceivedClubsInNotification(filteredReceived);
            }
            updateStudentInFirestore(temp, 'clubs');
            SETdoesUserHaveClubs(true);
            router.replace('/(tabs)/1');
        });

    };
    if (isLoading) {
        return (
            <View style={styles.container}>
                <>
                    <Pressable style={{ width: '100%', height: '13%', backgroundColor: 'transparent', position: 'absolute', top: 0 }} onPress={onPressBack} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', bottom: 30 }}>
                        <Text style={styles.headerText}>ENTER CLUBS</Text>
                    </View>
                    <InputFields selectedClubs={selectedClubs} addNewClub={newClubAdded} deleteClub={deleteClub} />
                    <NextPressable isNextButtonEnabled={true} handleNextPress={()=>{}} customStyles={styles.nextButtonPosition} />
                </>
    
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <>
                <Pressable style={{ width: '100%', height: '13%', backgroundColor: 'transparent', position: 'absolute', top: 0 }} onPress={onPressBack} />
                <View style={{ flexDirection: 'row', alignItems: 'center', bottom: 30 }}>
                    <Text style={styles.headerText}>ENTER CLUBS</Text>
                </View>
                <InputFields selectedClubs={selectedClubs} addNewClub={newClubAdded} deleteClub={deleteClub} />
                <NextPressable isNextButtonEnabled={true} handleNextPress={handleNextPress} customStyles={styles.nextButtonPosition} />
            </>

        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0,
        backgroundColor: '#1c1c1c',
    },
    headerText: {
        color: 'white',
        fontSize: 35,
        fontWeight: '500',
    },
    nextButtonPosition: {
        position: 'absolute',
        bottom: 100,
    },
    modalContent: {
        width: 300,
        height: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
    }
});

export default SecondClubsSection;






    