import React from 'react';
import { StyleSheet, Pressable, Text, View, Animated, Easing, Image, ScrollView, TextInput, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect, useRef, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from "react-native-modal";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Context } from '@/app/_layout';
import { GETmyAcceptedClubs, GETreceivedClubsInNotification, GETUserEmail, GETUserFullName } from '@/custom-utils/helper-functions/GetSetFunctions';
import { ClubDataType } from '@/custom-utils/interfaces/ClubInterfaces';
import { convertToAmPm } from '@/custom-utils/helper-functions/CoursesHelperFunctions';
import { hashFunctionPolynomial } from '@/custom-utils/helper-functions/ClubsHelperFunctions';
import { getClubFromRealtimeDatabase, updateClubInRealtimeDatabase } from '@/custom-utils/service-functions/FirebaseFunctions';

interface DetailedClubModalProps {
    clubName: string | null;
    setIsClubDetailModalVisible: (value: boolean) => void;
    isClubDetailModalVisible: boolean;
}

const DetailedClubModal = ({ clubName, setIsClubDetailModalVisible, isClubDetailModalVisible }: DetailedClubModalProps) => {

    const meetingStates = Object.freeze({
        NORMAL: 0,
        SENT_ATTEMPTED: 1,
        SENT_SUCCESS: 2,
        NO_INTERNET: 3,
      });

    const [messageState, setMessageState] = useState<number>(meetingStates.NORMAL);

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [startTime, setStartTime] = useState<Date>(new Date());
    const [endTime, setEndTime] = useState<Date>(new Date());


    const [buildingForClub, setBuildingForClub] = useState<string | null>(null);
    const [roomForClub, setRoomForClub] = useState<string | null>(null);
    const [noteForClub, setNoteForClub] = useState<string | null>(null);

    const [daysForClub, setDaysForClub] = useState<string[] | null>(null); //not used yet but potential use is to add start and end dates option and make one time weekly meetings


    const { globalRerender, setGlobalRerender, areCoursesLoaded } = useContext(Context);

    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const [warningText, setWarningText] = useState('');


      useEffect(() => { 
        setSelectedDate(new Date());
        setStartTime(new Date());   
        setEndTime(new Date());     

        // Check initial internet connection
        NetInfo.fetch().then(state => {
            if (!state.isConnected) {
                setMessageState(meetingStates.NO_INTERNET);
            }
        });

        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            if (!state.isConnected) {
                setMessageState(meetingStates.NO_INTERNET);
                alert('No internet connection. Please check your connection and try again.');
            } else {
                setMessageState(meetingStates.NORMAL);
            }
        });

        return () => {
            unsubscribe();
        };
      }, []);
      


    const checkExistingMeeting = async () => {
        if (!clubName || !selectedDate || !startTime || !endTime || !buildingForClub || !roomForClub) {
            alert('Please fill in all fields before sharing the meeting.');
            return;
        }

        if (startTime > endTime) {
            alert('Start time cannot be greater than end time.');
            return;
        }

        const receivedClubs = await GETreceivedClubsInNotification();
        const acceptedClubs = await GETmyAcceptedClubs();

        const existingAcceptedMeeting = acceptedClubs?.find((acceptedClub: ClubDataType) => acceptedClub.name === clubName);
        const existingReceivedMeeting = receivedClubs?.find((receivedClub: ClubDataType) => receivedClub.name === clubName);

        if (existingAcceptedMeeting || existingReceivedMeeting) {
            const existingMeeting = existingAcceptedMeeting || existingReceivedMeeting;
            const details = `Location: ${existingMeeting?.meeting.room} ${existingMeeting?.meeting.building}\nTime: ${convertToAmPm(existingMeeting?.meeting.startTime.toString() || '')} - ${convertToAmPm(existingMeeting?.meeting.endTime.toString() || '')}\nDay: ${existingMeeting?.meeting.days.join(', ')}\nNote: ${existingMeeting?.meeting.note}`;
            setWarningText(`A meeting for this club already exists.\n\n${details}\n\nDo you want to replace?`);
            setConfirmationModalVisible(true);
        } else if (startTime && endTime && (endTime.getTime() - startTime.getTime() > 5 * 60 * 60 * 1000)) {
            setWarningText(`You have set the Meeting to last more than 5 hours. Do you want to share the meeting?`);
            setConfirmationModalVisible(true);
        } else if (startTime === endTime) {
            
            setWarningText('You have set the same time for start and end of meeting. Do you want to share the meeting?');
            setConfirmationModalVisible(true);
        }
        else {
            messageState === meetingStates.NORMAL ? setMessageState(meetingStates.SENT_ATTEMPTED) : null;
            sendMeeting();
        }
    };

    const sendMeeting = async () => {
        
        if (!clubName || !selectedDate || !startTime || !endTime || !buildingForClub || !roomForClub) {
        alert('OH SH*T! IF YOU SEE THIS PLEASE EMAIL ME at rohkhatr@ttu.edu just say you saw sh*t');
        return;
        }

        const index = hashFunctionPolynomial(String(clubName));

        const clubData = await getClubFromRealtimeDatabase(Number(index)) as ClubDataType;

        const selectedDay = selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long' }) : null;
        setDaysForClub([selectedDay || '']);
        const senderEmail = await GETUserEmail();
        const senderName = await GETUserFullName();

        if (clubData) {
            clubData.meeting = {
                exists: true,
                building: buildingForClub || '',
                room: roomForClub || '',
                startTime: convertTo24HourFormat(formatTime(startTime)), // Save start time in 24-hour format
                endTime: convertTo24HourFormat(formatTime(endTime)), // Save end time in 24-hour format
                startDate: selectedDate,
                endDate: selectedDate,
                note: noteForClub || '',
                days: selectedDay ? [selectedDay] : [],
                senderEmail: senderEmail,
                senderName: senderName,
            };
        }

        
        await updateClubInRealtimeDatabase(clubData);
        console.log('Club meeting sent successfully!');

        setMessageState(meetingStates.SENT_SUCCESS);

        setTimeout(() => {
            setIsClubDetailModalVisible(false);
        }, 2000);

    };



    return (

        <SafeAreaView>


            {/* Detailed Club Modal */}
            <Modal
                isVisible={isClubDetailModalVisible}
                onBackdropPress={() => setIsClubDetailModalVisible(false)}
                onSwipeComplete={() => setIsClubDetailModalVisible(false)}
                swipeDirection="down"
                style={{ justifyContent: 'flex-end', marginBottom: 0, marginHorizontal: 0 }}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.5}
                // statusBarTranslucent={true}
                backdropTransitionOutTiming={0}
            >

                <View style={{ backgroundColor: '#434343', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '95%', }}>
                    <View style={{
                        width: 40,
                        height: 5,
                        backgroundColor: '#ccc',
                        borderRadius: 2.5,
                        alignSelf: 'center',

                    }} />
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Text numberOfLines={2} style={{ fontSize: 30, fontWeight: '500', textAlign: 'center', color: '#fff', marginVertical: 20 }}>{clubName}</Text>

                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                            <ScrollView contentContainerStyle={{ height: 550, }}>
                                {Platform.OS === 'ios' ? (
                                    <>
                                        <View style={{ width: '100%', gap: 12 }}>

                                            <View style={[styles.timeDateBarView, { justifyContent: 'space-between', marginRight: 3 }]}>

                                                <Text style={styles.timeDateText}>Select Start Time</Text>
                                                <DateTimePicker
                                                    value={startTime}
                                                    mode="time"
                                                    display="compact"
                                                    onChange={(event, date) => { date ? setStartTime(date) : null; }}
                                                    themeVariant='light'
                                                    accentColor='#e86464'
                                                    style={{ alignSelf: 'center', justifyContent: 'center' }}
                                                />
                                            </View>
                                            <View style={[styles.timeDateBarView, { justifyContent: 'space-between', marginRight: 3 }]}>

                                                <Text style={styles.timeDateText}>Select End Time</Text>

                                                <DateTimePicker
                                                    value={endTime}
                                                    mode="time"
                                                    display="compact"
                                                    onChange={(event, date) => { date ? setEndTime(date) : null }}
                                                    themeVariant='light'
                                                    accentColor='#e86464'
                                                    style={{ alignSelf: 'center', justifyContent: 'center' }}
                                                />
                                            </View>
                                            <View style={[styles.timeDateBarView, { justifyContent: 'space-between', marginRight: 3 }]}>

                                                <Text style={styles.timeDateText}>Select Date</Text>
                                                <DateTimePicker
                                                    value={selectedDate}
                                                    mode="date"
                                                    display="compact"
                                                    minimumDate={new Date()}
                                                    onChange={(event, date) => { date ? setSelectedDate(date) : null; }}
                                                    themeVariant='light'
                                                    accentColor='#e86464'
                                                    style={{ alignSelf: 'center', justifyContent: 'center' }}
                                                />
                                            </View>
                                        </View>
                                    </>
                                ) : (
                                    <View style={{ width: '100%', gap: 12 }}>

                                        <View style={styles.timeDateBarView}>

                                            <Text style={styles.timeDateText}>Select Start Time</Text>
                                            <Pressable
                                                style={styles.androidTimeDatePressable}
                                                onPress={() => { setStartTimePickerVisibility(true) }}
                                            >
                                                <Text style={{ color: '#444' }}>{startTime ? formatTime(startTime) : new Date().toLocaleTimeString()}</Text>
                                            </Pressable>
                                        </View>

                                        <View style={styles.timeDateBarView}>
                                            <Text style={styles.timeDateText}>Select End Time</Text>

                                            <Pressable
                                                style={styles.androidTimeDatePressable}
                                                onPress={() => { setEndTimePickerVisibility(true) }}
                                            >
                                                <Text style={{ color: '#444' }}>{endTime ? formatTime(endTime) : new Date().toLocaleTimeString()}</Text>
                                            </Pressable>
                                        </View>
                                        <View style={styles.timeDateBarView}>
                                            <Text style={styles.timeDateText}>Select Date</Text>

                                            <Pressable
                                                style={styles.androidTimeDatePressable}
                                                onPress={() => { setDatePickerVisibility(true) }}
                                            >
                                                <Text numberOfLines={1} style={{ color: '#444' }}>{selectedDate ? selectedDate.toLocaleDateString() : new Date().toLocaleDateString()}</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                )}

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginVertical: 20 }}>
                                    <TextInput
                                        placeholder="Building Name"
                                        style={{ backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, width: '48%' }}
                                        numberOfLines={1}
                                        onChangeText={(text) => setBuildingForClub(text)}
                                    />

                                    <TextInput
                                        placeholder="Room"
                                        style={{ backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, width: '48%' }}
                                        numberOfLines={1}
                                        onChangeText={(text) => setRoomForClub(text)}
                                    />
                                </View>

                                <TextInput
                                    placeholder="Add Note"
                                    multiline={true}
                                    numberOfLines={10000}
                                    maxLength={10000}
                                    style={{ backgroundColor: '#f0f0f0', height: 180, padding: 10, borderRadius: 10, textAlignVertical: 'top' }}
                                    onChangeText={(text) => setNoteForClub(text)}
                                />
                            </ScrollView>

                        </KeyboardAvoidingView>

                        <View style={{}}>
                            <TouchableOpacity
                                onPress={() => {
                                    if(messageState !== meetingStates.NO_INTERNET){
                                    checkExistingMeeting();
                                    }
                                }}
                                style={{
                                    backgroundColor: messageState === meetingStates.SENT_ATTEMPTED ? 'grey' : (messageState === meetingStates.SENT_SUCCESS? 'rgb(93, 189, 121)': messageState === meetingStates.NO_INTERNET ? 'grey' :'#e86464'),
                                    padding: 15,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 10,
                                    opacity: messageState === meetingStates.NO_INTERNET ? 0.5 : 1
                                }}
                                
                            > 
                                {messageState === meetingStates.NORMAL && <Text style={{ color: 'white', fontWeight: '500', fontSize: 17 }}>Share with all members</Text>}
                                {messageState === meetingStates.NO_INTERNET && <Text style={{ color: 'white', fontWeight: '500', fontSize: 17 }}>No Internet</Text>}  
                                {messageState === meetingStates.SENT_ATTEMPTED && <Text style={{ color: 'white', fontWeight: '500', fontSize: 17 }}>Sending...</Text>}
                                {messageState === meetingStates.SENT_SUCCESS && <Text style={{ color: 'white', fontWeight: '500', fontSize: 17 }}>Sent!</Text>}
                            </TouchableOpacity>
                        </View>


                    </View>

                </View>
            </Modal >

            {Platform.OS == 'android' && (
                <View>
                    {isDatePickerVisible && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="calendar"
                            minimumDate={new Date()}
                            onChange={(event, date) => { date ? setSelectedDate(date) : null; setDatePickerVisibility(false) }}
                        />
                    )}

                    {isStartTimePickerVisible && (
                        <DateTimePicker
                            value={startTime}
                            mode="time"
                            display='default'
                            onChange={(event, date) => { date ? setStartTime(date) : null; setStartTimePickerVisibility(false) }}
                            style={{ borderRadius: 10 }}
                        />
                    )}

                    {isEndTimePickerVisible && (
                        <DateTimePicker
                            value={endTime}
                            mode="time"
                            display='default'
                            onChange={(event, date) => { date ? setEndTime(date) : null; setEndTimePickerVisibility(false) }}
                        />
                    )}
                </View>
            )}


            {/* Confirmation Modal */}
            <Modal
                isVisible={confirmationModalVisible}
                onBackdropPress={() => setConfirmationModalVisible(false)}
                style={{ justifyContent: 'center', alignItems: 'center' }}
                backdropOpacity={0.5}
                useNativeDriver={true}
                animationIn="fadeIn"
                animationOut="fadeOut"
                animationInTiming={200}
                animationOutTiming={200}
            >
                <View style={styles.confirmationModal}>
                    <View style={{ backgroundColor: '#ffeae9', padding: 10, borderRadius: 5, marginBottom: 20, width: '100%', alignItems: 'center' }}>
                        <Text style={{ color: '#a94442', fontWeight: '500', fontSize: 18 }}>Warning</Text>
                    </View>
                    <Text style={styles.confirmationText}>{warningText}</Text>
                    <View style={styles.confirmationButtons}>
                        <Pressable onPress={() => setConfirmationModalVisible(false)} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>No</Text>
                        </Pressable>
                        <Pressable onPress={() => { setConfirmationModalVisible(false); sendMeeting(); }} style={styles.confirmButton}>
                            <Text style={styles.confirmButtonText}>Yes</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>



        </SafeAreaView>
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
        textAlign: 'left',
    },
    confirmationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    confirmButtonText: {
        color: '#636363',
        fontWeight: '500',
        fontSize: 18,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    cancelButtonText: {
        color: '#636363',
        fontWeight: '500',
        fontSize: 18,
    },
    timeDateBarView: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        paddingHorizontal: 5
    },
    timeDateText:
    {
        color: 'black',
        textAlign: 'center',
        width: '55%'
    },
    androidTimeDatePressable: {
        backgroundColor: '#d7d7d7',
        height: "70%",
        borderRadius: 7,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default DetailedClubModal;

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


const formatTime = (time: Date | null) => {
    if (!time) return "Select Time";
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};