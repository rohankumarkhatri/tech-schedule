import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import Modal from "react-native-modal";
import Ionicons from '@expo/vector-icons/Ionicons';
import { GETallClubs, GETdoesUserHaveClubs, SETallClubs, SETdoesUserHaveClubs, SETmyAcceptedClubs, SETreceivedClubsInNotification } from '@/custom-utils/helper-functions/GetSetFunctions';
import { fetchStudentDocumentFromFirestore, updateStudentInFirestore } from '@/custom-utils/service-functions/FirebaseFunctions';
import InputFields from '@/custom-components/student-clubs-selection-components/ClubInputFields';
import NextPressable from '@/custom-components/student-clubs-selection-components/ClubNextPressable';


interface props {
    onPressBack: () => void;
}

const SecondClubsSection: React.FC<props> = ({ onPressBack }) => {


    const [selectedClubs, setSelectedClubs] = useState<string[]>([]);


    // This is called with the first section render. 
    useEffect(() => {

        const checkAndFetchClubs = async () => {
            try {
                const hasClubs = await GETdoesUserHaveClubs();
                if (hasClubs) {
                    const clubNames = await GETallClubs();
                    setSelectedClubs(clubNames.map((club: any) => club.name));
                } else {
                    const studentDocument = await fetchStudentDocumentFromFirestore() as any;   

                    if (studentDocument.clubs) {
                        setSelectedClubs(studentDocument.clubs);
                    } else {
                        setSelectedClubs([]);
                    }
                }
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
        setSelectedClubs(temp);

    }

    function handleNextPress() {

        if (!selectedClubs || selectedClubs.length <= 0) {
            GETallClubs().then(() => {
                updateStudentInFirestore(selectedClubs, 'clubs');
                SETdoesUserHaveClubs(true);
                return;
            });
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

        SETallClubs(temp2 as any).then(() => {
            updateStudentInFirestore(temp, 'clubs');
            SETdoesUserHaveClubs(true);
            router.replace('/(tabs)/1');
        });

    };

    return (
        <SafeAreaView style={styles.container}>
            <>
                <Pressable style={{ width: '100%', height: '13%', backgroundColor: 'transparent', position: 'absolute', top: 0 }} onPress={onPressBack} />
                <View style={{ flexDirection: 'row', alignItems: 'center', bottom: 30 }}>
                    <Text style={styles.headerText}>ENTER CLUBS</Text>
                </View>
                <InputFields selectedClubs={selectedClubs} addNewClub={newClubAdded} deleteClub={deleteClub} />
                <NextPressable isNextButtonEnabled={true} handleNextPress={handleNextPress} customStyles={styles.nextButtonPosition} />
            </>

        </SafeAreaView>
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