import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Modal } from 'react-native';
import { Context } from '@/app/_layout';
import { ref, set, update } from "firebase/database";
import { GETUserEmail, GETmyAcceptedClubs, SETmyAcceptedClubs, GETreceivedClubsInNotification, SETreceivedClubsInNotification, GETallClubs, SETallClubs, GETrejectedClubsNames, SETrejectedClubsNames } from '../custom-utils/helper-functions/GetSetFunctions';
import AntDesign from '@expo/vector-icons/build/AntDesign';
import { ClubDataType } from '@/custom-utils/interfaces/ClubInterfaces';
import { realTimeDb } from '@/custom-configuration-files/FirebaseConfig';
import { convertToAmPm } from '@/custom-utils/helper-functions/CoursesHelperFunctions';
import NetInfo from "@react-native-community/netinfo";
export default function notificationsPage() {

    const [receivedClubs, setReceivedClubs] = useState<ClubDataType[]>([]);
    const [rejectedClubs, setRejectedClubs] = useState<string[]>([]);
    const [collapsedItems, setCollapsedItems] = useState<Set<number>>(new Set());
    const { setGlobalRerender, globalRerender } = useContext(Context);


    const myEmail = useRef('');

    const cancelStates = Object.freeze({
        NORMAL: 0,
        NO_INTERNET: 3,
    });

    const [cancelState, setCancelStates] = useState<number>(cancelStates.NORMAL);


    useEffect(() => {

        // Check initial internet connection
        NetInfo.fetch().then(state => {
            if (!state.isConnected) {
                setCancelStates(cancelStates.NO_INTERNET);
            }
        });

        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            if (!state.isConnected) {
                setCancelStates(cancelStates.NO_INTERNET);
            } else {
                setCancelStates(cancelStates.NORMAL);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);


    const toggleCollapse = (index: number) => {
        setCollapsedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const acceptMeeting = (index: number) => {
        const temp = [...receivedClubs];
        const postRemovingThisClub_Array = temp.filter((_, i) => i !== index);


        //adding this club to accepted clubs
        GETmyAcceptedClubs().then((clubs) => {
            const clubIndex = clubs.findIndex((club: ClubDataType) => club.name === temp[index].name);
            if (clubIndex !== -1) {
                clubs[clubIndex] = temp[index];
            } else {
                clubs.push(temp[index]);
            }

            SETmyAcceptedClubs(clubs);
        });

        //if this club was in rejected clubs, remove it
        const afterRemovingThisClub_Array = rejectedClubs.filter((club: string) => club !== temp[index].name);
        if (afterRemovingThisClub_Array.length !== rejectedClubs.length) {
            SETrejectedClubsNames(afterRemovingThisClub_Array).then(() => {
                setRejectedClubs(afterRemovingThisClub_Array);
            });
        }

        //updating the received clubs array i.e. removing this club
        setReceivedClubs(postRemovingThisClub_Array);
        SETreceivedClubsInNotification(postRemovingThisClub_Array);
    };

    const rejectMeeting = (index: number) => {
        GETrejectedClubsNames().then((clubs) => {
            const rejectedClubsSet = new Set(clubs || []);
            rejectedClubsSet.add(receivedClubs[index].name);

            SETrejectedClubsNames(Array.from(rejectedClubsSet) as string[]).then(() => {
                setGlobalRerender(prev => !prev);
                setRejectedClubs(Array.from(rejectedClubsSet) as string[]);
            });
        });
    };

    const cancelMeeting = (index: number) => {
        const name = receivedClubs[index].name;
        const temp = [...receivedClubs];
        const updatedReceivedClubs = temp.filter((_, i) => i !== index);

        SETreceivedClubsInNotification(updatedReceivedClubs);

        update(ref(realTimeDb, `ClubsDirectory/${temp[index].index}/meeting/`), { exists: false }).then(() => {
            setReceivedClubs(updatedReceivedClubs);
            alert(`Meeting for the club: ${name} has been cancelled for all members.`);
        });
    };




    useEffect(() => {

        GETUserEmail().then((email) => {
            myEmail.current = email;
        });
        GETreceivedClubsInNotification().then((clubs: ClubDataType[]) => {
            const uniqueClubs = Array.from(new Set(clubs.map((club: ClubDataType) => club.name)))
                .map(name => clubs.find((club: ClubDataType) => club.name === name));
            if (uniqueClubs.length != clubs.length) {
                SETreceivedClubsInNotification(uniqueClubs as ClubDataType[])
            }
            setReceivedClubs(uniqueClubs as ClubDataType[]);
        });
        GETrejectedClubsNames().then((clubs) => {
            const rejectedClubsSet = new Set(clubs);
            const rejectedClubsArray = Array.from(rejectedClubsSet);

            if (rejectedClubsSet.size != rejectedClubsArray.length) {
                //shouldn't happen
                SETrejectedClubsNames(rejectedClubsArray as string[]);
            }
            setRejectedClubs(rejectedClubsArray as string[]);
        });

        return () => {
            setGlobalRerender(prev => !prev);
        };
    }, []);


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#484848' }}>
            <ScrollView style={styles.container}>
                <View style={{ height: 20 }} />

                {receivedClubs.map((item, index) => (
                    <View key={index} style={styles.card}>
                        {!rejectedClubs.includes(item.name) ? (
                            <>
                                <Text style={styles.clubName}>{item.name}</Text>
                                <Text style={styles.meetingDetails}>Building: {item.meeting.building}</Text>
                                <Text style={styles.meetingDetails}>Room: {item.meeting.room}</Text>
                                <Text style={styles.meetingDetails}>Time: {convertToAmPm(item.meeting.startTime.toString())} - {convertToAmPm(item.meeting.endTime.toString())}</Text>
                                <Text style={styles.meetingDetails}>Day: {item.meeting.days.join(', ')}</Text>
                                <Text style={styles.meetingDetails}>
                                    Meeting Date: {item.meeting.startDate ? new Date(item.meeting.startDate).toLocaleDateString() : 'N/A'}
                                </Text>

                                <Text style={styles.meetingDetails}>Organizer: {item.meeting.senderName}</Text>
                                <Text style={styles.meetingDetails}>Contact: {item.meeting.senderEmail}</Text>
                                {item.meeting.note !== '' &&
                                    <View style={{ marginTop: 10, padding: 10, borderRadius: 6, backgroundColor: '#e5e5e5', }}>
                                        <Text style={styles.meetingDetails}>Note: {item.meeting.note}</Text>
                                    </View>
                                }
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.acceptButton} onPress={() => acceptMeeting(index)}>
                                        <Text style={styles.buttonText}>Add to Schedule</Text>
                                    </TouchableOpacity>
                                    {item.meeting.senderEmail !== myEmail.current && ( //make it not equal to for production
                                        <TouchableOpacity style={styles.rejectButton} onPress={() => rejectMeeting(index)}>
                                            <Text style={styles.buttonText}>Ignore</Text>
                                        </TouchableOpacity>
                                    )}
                                    {item.meeting.senderEmail == myEmail.current && cancelState !== cancelStates.NO_INTERNET && ( //makr it equal to for production
                                        <TouchableOpacity
                                            style={{
                                                paddingVertical: 8,
                                                paddingHorizontal: 16,
                                                borderRadius: 5,

                                            }}
                                            onPress={() => { if (cancelState === cancelStates.NORMAL) { cancelMeeting(index); } }}
                                        >
                                            {cancelState === cancelStates.NORMAL && <Text style={{
                                                color: '#rgb(221, 65, 65)',
                                                fontSize: 17,
                                                fontWeight: '500',
                                                textAlign: 'center',
                                            }}>Cancel Meeting</Text>}
                                        </TouchableOpacity>
                                    )}

                                </View>

                            </>
                        ) : (
                            <TouchableOpacity style={{}} onPress={() => toggleCollapse(index)}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                                    <Text style={[styles.clubName, { marginBottom: collapsedItems.has(index) ? 10 : 0 }]}>
                                        {item.name}
                                    </Text>
                                    <AntDesign style={{ marginBottom: collapsedItems.has(index) ? 5 : 0 }} name={collapsedItems.has(index) ? 'caretup' : 'caretdown'} size={18} color="#000" />
                                </View>
                                {collapsedItems.has(index) && (
                                    <View>
                                        <Text style={styles.meetingDetails}>Building: {item.meeting.building}</Text>
                                        <Text style={styles.meetingDetails}>Room: {item.meeting.room}</Text>
                                        <Text style={styles.meetingDetails}>Time: {convertToAmPm(item.meeting.startTime.toString())} - {convertToAmPm(item.meeting.endTime.toString())}</Text>
                                        <Text style={styles.meetingDetails}>Day: {item.meeting.days.join(', ')}</Text>
                                        <Text style={styles.meetingDetails}>
                                            Meeting Date: {item.meeting.startDate ? new Date(item.meeting.startDate).toLocaleDateString() : 'N/A'}
                                        </Text>
                                        <Text style={styles.meetingDetails}>Organizer: {item.meeting.senderName}</Text>
                                        <Text style={styles.meetingDetails}>Contact: {item.meeting.senderEmail}</Text>
                                        {item.meeting.note !== '' &&
                                            <View style={{ marginTop: 10, padding: 10, borderRadius: 6, backgroundColor: '#e5e5e5', }}>
                                                <Text style={styles.meetingDetails}>Note: {item.meeting.note}</Text>
                                            </View>
                                        }
                                        <View style={[styles.buttonContainer, { justifyContent: 'center' }]}>
                                            <TouchableOpacity style={styles.acceptButton} onPress={() => acceptMeeting(index)}>
                                                <Text style={styles.buttonText}>Add to Schedule</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: '#404040',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    clubName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#444',
        fontFamily: 'NotoSans-Regular',
    },
    meetingDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        fontFamily: 'NotoSans-Regular',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    acceptButton: {
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderRadius: 5,
    },
    rejectButton: {
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderRadius: 5,
    },
    buttonText: {
        color: '#636363',
        fontSize: 17,
        fontWeight: '500',
        textAlign: 'center',
    },
});