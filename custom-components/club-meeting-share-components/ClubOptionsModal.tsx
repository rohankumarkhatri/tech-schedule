import { StyleSheet, Pressable, Text, View, ScrollView } from 'react-native';
import { useState, useEffect, useRef, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from "react-native-modal";
import { ClubDataType } from '../../custom-utils/interfaces/ClubInterfaces';
import DetailedClubModal from './DetailedClubModal';
import { GETallClubs, GETUserEmail } from '@/custom-utils/helper-functions/GetSetFunctions';
import { ref, update } from 'firebase/database';
import { realTimeDb } from '@/custom-configuration-files/FirebaseConfig';


interface clubOptionsModalProps {
    shareButtonPressed: boolean;
    setShareButtonPressed: (value: boolean) => void;
}

const ClubOptionsModal = ({ shareButtonPressed, setShareButtonPressed }: clubOptionsModalProps) => {

    const [clubsArray, setClubsArray] = useState<ClubDataType[]>([]);

    const [isClubDetailModalVisible, setIsClubDetailModalVisible] = useState(false);
    const [currentClub, setCurrentClub] = useState<string | null>(null);

    useEffect(() => {
        GETallClubs().then((clubs) => {
           
        });
        GETallClubs().then((allClubs) => {
            if (allClubs && Array.isArray(allClubs)) {
                
                setClubsArray(allClubs);
                const currentDate = new Date();

                allClubs.forEach((club: ClubDataType) => {
                    const clubStartDate = stripTime(new Date(club.meeting.startDate));
                    GETUserEmail().then((myEmail) => {
                        
                    if (club.meeting.senderEmail === myEmail && clubStartDate < stripTime(currentDate)) {
                        update(ref(realTimeDb, `ClubsDirectory/${club.index}/meeting/`), { exists: false });
                    }
                });
            });
            } else {
                alert('No clubs found to share meetings with.');
            }
        });
    }, []);

    const handleClubPress = (club: ClubDataType) => {
        setCurrentClub(club.name);
        setIsClubDetailModalVisible(true);
        setShareButtonPressed(false);
    };

    if (isClubDetailModalVisible) {
        return (
            <View>
                <DetailedClubModal clubName={currentClub} setIsClubDetailModalVisible={setIsClubDetailModalVisible} isClubDetailModalVisible={isClubDetailModalVisible} />
            </View>
        )
    }


    return (

        <View>

            < Modal
                isVisible={shareButtonPressed}
                animationIn="fadeIn"
                animationOut="fadeOut"
                onBackdropPress={() => setShareButtonPressed(false)}
                style={{ justifyContent: 'center', alignItems: 'center', margin: 0 }}
                backdropOpacity={0.5}
                useNativeDriver={false}
            >
                <View style={[{ backgroundColor: '#fff', borderRadius: 8, width: '88%', maxHeight: '60%', alignItems: 'center', padding: 16 }]}>
                    <Text style={{ fontSize: 20, fontWeight: '500', textAlign: 'center', color: '#333', marginBottom: 12 }}>Share Club Meetings</Text>
                    <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center', paddingVertical: 8 }}>
                        {clubsArray.map((club, index) => (
                            <Pressable key={index} style={{ padding: 10, backgroundColor: '#f5f5f5', borderRadius: 6, marginVertical: 6, alignItems: 'center', width: '80%' }}
                                onPress={() => { handleClubPress(club) }}>
                                <Text style={{ fontSize: 16, textAlign: 'center', color: '#444' }}>{club.name}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            </Modal>


        </View>
    );


}

const styles = StyleSheet.create({
    confirmationModal: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    confirmationText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    confirmationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginRight: 10,
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#F44336',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ClubOptionsModal;

function convertTo24HourFormat(time: string): number {
    const period = time.slice(-2); // Get the last two characters for the period
    const timePart = time.slice(0, -2).trim(); // Get the rest of the string excluding the last two characters
    let [hours, minutes] = timePart.split(':').map(part => parseInt(part, 10)); //split into hours and minutes
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    return hours * 100 + minutes; // Return time in HHMM format
}

function stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}