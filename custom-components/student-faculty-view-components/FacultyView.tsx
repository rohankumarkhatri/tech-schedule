import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Pressable, TextInput, Button, Linking } from 'react-native';
import { TodaysCourseDataType } from '../../utils/Interfaces/CustomDataTypes';
import { convertToAmPm } from '../../utils/helper-functions/CourseObjectHelperFunctions';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from 'react-native-modal';

type Props = {
    todaysCourses: TodaysCourseDataType[];
    openDirectionsInGMaps: (building: string, campus: string) => void;
    updateTransparency: (index: number) => void;
    updateBuilding: (index: number, building: string) => void;
    updateRoom: (index: number, room: string) => void;
    updateNote: (index: number, note: string) => void;
    refreshing: boolean;
    onRefresh: () => void;
    turnOffDaysNote: string;
}

export default function FacultyView({ todaysCourses, openDirectionsInGMaps, updateTransparency, updateBuilding, updateRoom, updateNote, refreshing, onRefresh, turnOffDaysNote }: Props) {

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<TodaysCourseDataType | null>(null);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [inputValue, setInputValue] = useState<string>('');
    const [isEditingBuilding, setIsEditingBuilding] = useState<boolean>(false);
    const [isEditingRoom, setIsEditingRoom] = useState<boolean>(false);
    const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const indexforref = useRef(-1);
    const courseRefFornow = useRef<TodaysCourseDataType | null>()
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);


    const handleUpdateBuilding = (index: number) => {
        setEditingIndex(index);
        setIsEditingBuilding(true);
        setIsEditingRoom(false);
        setIsEditingNote(false);
        setInputValue(todaysCourses[index].changedBuilding === '' ? todaysCourses[index].meeting.building : todaysCourses[index].changedBuilding);
        setIsModalVisible(true);
    };

    const handleUpdateRoom = (index: number) => {
        setEditingIndex(index);
        setIsEditingRoom(true);
        setIsEditingBuilding(false);
        setIsEditingNote(false);
        setInputValue(todaysCourses[index].changedRoom === '' ? todaysCourses[index].meeting.room : todaysCourses[index].changedRoom);
        setIsModalVisible(true);
    };

    const handleUpdateNote = (index: number) => {
        setEditingIndex(index);
        setIsEditingNote(true);
        setIsEditingBuilding(false);
        setIsEditingRoom(false);
        setInputValue(todaysCourses[index].note);
        setIsModalVisible(true);
    };



    const handleSave = () => {
        if (editingIndex !== null) {
            if (isEditingBuilding) {
                updateBuilding(editingIndex, inputValue);
            } else if (isEditingRoom) {
                updateRoom(editingIndex, inputValue);
            }
            else if (isEditingNote) {
                updateNote(editingIndex, inputValue);
            }
            setEditingIndex(null);
            setInputValue('');
            setIsModalVisible(false);
        }
    };

    const openModal = (course: TodaysCourseDataType) => {
        setSelectedCourse(course);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const handleModalHide = () => {
        setSelectedCourse(null);
    };

    return (
        <View style={{ flex: 1 }}>

            <ScrollView
                contentContainerStyle={[styles.container]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {todaysCourses?.length > 0 ?
                    (
                        todaysCourses.map((course, index) => (
                            <View key={index} style={[index % 2 === 0 ? { backgroundColor: 'rgba(55,55,55,1)' } : {}, { paddingTop: 25, paddingBottom: 5 }]}>
                                {/* This is the row that contains the course container, the note button, and the time container */}
                                <View style={styles.courseRow}>
                                    <Pressable
                                        onPress={() => { openModal(course) }}
                                        style={[
                                            styles.courseContainer,
                                            course.isTransparent && styles.transparent,
                                            !course.meeting.hasMeeting && { opacity: 0 },
                                            course.Section.includes('H') && styles.honorsCourse, // Apply honors course style
                                            course.ScheduleType.includes('Laboratory') && styles.labCourse, // Apply lab course style
                                        ]}
                                    >
                                        <Text style={styles.courseTitle} numberOfLines={2} ellipsizeMode='tail'>{course.Title + ' (' + course.Section + ')'}</Text>
                                        <Text style={styles.courseScheduleType}>{course.ScheduleType}</Text>
                                        {course.ScheduleType.includes('Laboratory') && <Ionicons name="flask" size={20} color="black" style={styles.labIcon} />}

                                        <Ionicons name="chevron-forward" size={20} color="black" style={styles.chevronIcon} />
                                    </Pressable>

                                    {/* this is the row that contains the go to class button and the time container */}
                                    <View style={[{ flex: 1, justifyContent: 'center' }, course.isTransparent && styles.transparent,]}>

                                        {/* This is the row that contains the go to class button */}
                                        <View style={styles.goToClassButtonContainer}>
                                            {course.meeting.building !== 'none' && course.changedBuilding === '' && course.changedRoom === '' ? ( //no changes and not none i.e. original location
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    style={[
                                                        styles.pressableForGoToClassButton,
                                                    ]}
                                                // onPress={() => openDirectionsInGMaps(course.meeting.building, course.Campus)}
                                                >
                                                    <Text style={styles.goToClassText} numberOfLines={3} adjustsFontSizeToFit={true} ellipsizeMode='tail'>{`${course.meeting.room} ${course.meeting.building}`}</Text>
                                                    {/* <Ionicons name="arrow-forward" size={20} color="white" /> */}

                                                </TouchableOpacity>
                                            ) : course.changedBuilding !== '' ? ( //changes in either building or room or both i.e. changed location

                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    style={[
                                                        styles.pressableForGoToClassButton,
                                                        styles.changedLocation
                                                    ]}
                                                // onPress={() => openDirectionsInGMaps(course.changedBuilding, course.Campus)}
                                                >
                                                    <Text style={styles.goToClassText} numberOfLines={3} adjustsFontSizeToFit={true} ellipsizeMode='tail'>
                                                        {course.changedRoom === '' ? `${course.meeting.room} ${course.changedBuilding}` :
                                                            `${course.changedRoom} ${course.changedBuilding}`}
                                                    </Text>
                                                    {/* <Ionicons name="arrow-forward" size={20} color="white" /> */}
                                                </TouchableOpacity>

                                            ) : course.changedRoom !== '' ? (
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    style={[
                                                        styles.pressableForGoToClassButton,
                                                        styles.changedLocation
                                                    ]}
                                                // onPress={() => openDirectionsInGMaps(course.meeting.building, course.Campus)}
                                                >

                                                    <Text style={styles.goToClassText} numberOfLines={3} adjustsFontSizeToFit={true} ellipsizeMode='tail'>
                                                        {course.changedRoom} {course.meeting.building}
                                                    </Text>
                                                    {/* <Ionicons name="arrow-forward" size={20} color="white" /> */}
                                                </TouchableOpacity>
                                            ) : (
                                                <View style={[styles.pressableForGoToClassButton, styles.undefinedLocation]}>
                                                    <Text style={styles.undefinedLocationText}>none</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/*time container*/}
                                        <View style={[styles.timeContainer]}>
                                            <Text style={styles.timeText}>
                                                {course.meeting.hasMeeting && course.meeting.startTime !== 9999 ?
                                                    `${convertToAmPm(course.meeting.startTime.toString())}\n${convertToAmPm(course.meeting.endTime.toString())}` : 'No Meeting Times'}
                                            </Text>
                                        </View>

                                    </View>

                                </View>

                                {/*this is the row that contains the edit buttons*/}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 10 }}>

                                    <TouchableOpacity style={styles.editButton} onPress={() => handleUpdateBuilding(index)}>
                                        <Text>Change Building</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.editButton} onPress={() => handleUpdateRoom(index)}>
                                        <Text>Change Room</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.editButton} onPress={() => handleUpdateNote(index)}>
                                        {/* <MaterialIcons name="edit-note" size={24} color="black" /> */}
                                        <Text style={[{ marginLeft: 5, fontSize: 16, flexWrap: 'wrap' }]}>Leave Note</Text>
                                    </TouchableOpacity>
                                </View>



                                {/*Cancel/Reinstate Meeting Button*/}
                                <View style={styles.cancelMeetingButtonContainer}>
                                    <TouchableOpacity style={[styles.cancelMeetingButton, course.isTransparent && { backgroundColor: '#93cda4' }]} onPress={() => { setConfirmationModalVisible(true); indexforref.current = index; courseRefFornow.current = selectedCourse; }}>
                                        {course.isTransparent ? <Text numberOfLines={2} style={styles.cancelMeetingText}>Reinstate Meeting</Text>
                                            : <Text numberOfLines={2} style={styles.cancelMeetingText}>Cancel Meeting</Text>}
                                    </TouchableOpacity>
                                </View>

                            </View>

                        ))
                    )
                    :
                    (
                        <View style={styles.noCoursesContainer}>
                            {turnOffDaysNote == '' || turnOffDaysNote == null || !turnOffDaysNote ? (
                                <Text style={styles.noCoursesText}>FREE DAY! 🍻</Text>
                            ) : (
                                <Text style={styles.noCoursesText}>{turnOffDaysNote}</Text>
                            )}
                            <Text style={{ position: 'absolute', bottom: 70, fontSize: 16, fontWeight: '500', color: 'white', opacity: 0.5 }}>Pull down to refresh</Text>
                        </View>
                    )}
                <View style={{ height: 300 }} />

            </ScrollView>


            {selectedCourse && (
                <Modal
                    isVisible={modalVisible}
                    onBackdropPress={closeModal}
                    onSwipeComplete={closeModal}
                    swipeDirection="down"
                    style={{ justifyContent: 'flex-end', margin: 0 }}
                    animationIn="slideInUp"
                    animationOut="slideOutDown"
                    backdropOpacity={0.5}
                    animationOutTiming={500}
                    backdropTransitionOutTiming={100}
                    onModalHide={handleModalHide}
                    statusBarTranslucent={true}
                >
                    <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, width: '100%' }}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>{selectedCourse.Title}</Text>
                        <Text style={styles.modalDetails}>CRN: {selectedCourse.CRN}</Text>
                        <Text style={styles.modalDetails}>Schedule Type: {selectedCourse.ScheduleType}</Text>
                        <Text style={styles.modalDetails}>Section: {selectedCourse.Section}</Text>
                        <Text style={styles.modalDetails}>Course Number: {selectedCourse.CourseNumber}</Text>
                        <Text style={styles.modalDetails}>Campus: {selectedCourse.Campus}</Text>
                        <Text style={styles.modalDetails}>Subject Description: {selectedCourse.SubjectDescription}</Text>
                        <Text style={styles.modalDetails}>Hours: {selectedCourse.Hours}</Text>
                        <Text style={styles.modalDetails}>Primary Instructor: {selectedCourse.PrimaryInstructor}</Text>
                        <TouchableOpacity onPress={() => Linking.openURL(selectedCourse.PrimaryInstructor_url)}>
                            <Text style={[styles.modalDetails, { color: 'blue', textDecorationLine: 'underline' }]}>
                                {selectedCourse.PrimaryInstructor_url}
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.modalDetails}>
                            Meeting Times: {selectedCourse.meeting.hasMeeting && selectedCourse.meeting.startTime !== 9999 ?
                                `${convertToAmPm(selectedCourse.meeting.startTime.toString())} - ${convertToAmPm(selectedCourse.meeting.endTime.toString())}` : 'No Meeting Times'}
                        </Text>
                        <Text style={styles.modalDetails}>Class Building: {selectedCourse.meeting.building.toUpperCase()}</Text>
                        <Text style={styles.modalDetails}>Class Room: {selectedCourse.meeting.room}</Text>
                        {(selectedCourse.changedBuilding !== '' || selectedCourse.changedRoom !== '') && (
                            <View style={{ padding: 5, margin: 5, borderRadius: 10, borderWidth: 1, borderColor: 'black', backgroundColor: '#337ab7', position: 'relative', left: -10 }}>
                                {selectedCourse.changedBuilding !== '' && <Text style={[styles.modalDetails, { marginBottom: 2, marginLeft: 5, fontWeight: '500', color: 'white', paddingTop: 5, paddingHorizontal: 5 }]}>Changed Building: {selectedCourse.changedBuilding.toUpperCase()}</Text>}
                                {selectedCourse.changedRoom !== '' && <Text style={[styles.modalDetails, { marginBottom: 2, marginLeft: 5, fontWeight: '500', color: 'white', padding: 5 }]}>Changed Room: {selectedCourse.changedRoom}</Text>}
                            </View>
                        )}
                    </View>
                </Modal>
            )}

            {/* Modal for editing building, room, or note */}
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={() => setIsModalVisible(false)}
                onSwipeComplete={() => setIsModalVisible(false)}
                swipeDirection="down"
                style={{
                    justifyContent: 'center',
                    margin: 0,
                    alignItems: 'center',
                }}
                animationIn="fadeIn"
                animationOut="fadeOut"
                backdropOpacity={0.5}
                animationOutTiming={300}
                backdropTransitionOutTiming={100}
                statusBarTranslucent={false}
            >
                <View style={styles.centeredModalContent}>
                    <TextInput
                        style={[isEditingNote ? { height: 300, width: '100%', borderWidth: 1, borderColor: 'black', padding: 10, borderRadius: 5, textAlignVertical: 'top' } :
                            styles.input]}
                        value={inputValue}
                        onChangeText={setInputValue}
                        placeholder={isEditingBuilding ? "Building" : isEditingRoom ? "Room" : isEditingNote ? "Note" : ""}
                        multiline={true}
                        numberOfLines={isEditingNote ? 10 : 2}
                        maxLength={isEditingNote ? 1000 : 70}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 45 }}>
                        <Pressable style={{ backgroundColor: '#d9534f', padding: 10, borderRadius: 5, }} onPress={() => { setIsModalVisible(false); }}>
                            <Text style={{ color: 'white', fontWeight: '500', textTransform: 'uppercase' }}>Cancel</Text>
                        </Pressable>
                        <Pressable style={{ backgroundColor: '#00BCD4', padding: 10, borderRadius: 5, }} onPress={() => { handleSave(); setIsModalVisible(false); }}>
                            <Text style={{ color: 'white', fontWeight: '500', textTransform: 'uppercase' }}>Update</Text>
                        </Pressable>
                    </View>
                </View>                                 
            </Modal>

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
                    <Text style={styles.confirmationText}>This course meeting will be canceled and all students will be notified. Do you want to cancel?</Text>
                    <View style={styles.confirmationButtons}>
                        <Pressable onPress={() => setConfirmationModalVisible(false)} style={styles.noButton}>
                            <Text style={styles.noButtonText}>No</Text>
                        </Pressable>
                        <Pressable onPress={() => { setConfirmationModalVisible(false); updateTransparency(indexforref.current) }} style={styles.confirmButton}>
                            <Text style={styles.confirmButtonText}>Yes</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>



        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#484848',
        gap: 20,
    },
    noButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    noButtonText: {
        color: '#636363',
        fontWeight: '500',
        fontSize: 18,
    },
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
    courseRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'space-between',
    },
    courseContainer: {
        // backgroundColor: '#fcaeae',
        // padding: 15,
        // borderRadius: 10,
        // borderWidth: 1,
        // height: 135,
        // width: '68%',
        // shadowColor: '#ed9292',
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.8,
        // shadowRadius: 3.84,
        // elevation: 5,

        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 13.5,
        borderRadius: 10,
        minHeight: 105,
        width: '68%',
        shadowColor: 'white',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 3.84,
        elevation: 10,
    },
    honorsCourse: {
        backgroundColor: '#ffeeb1',
        borderColor: 'black',
        borderWidth: 1,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 3.84,
        elevation: 5,
    },
    labCourse: {
        backgroundColor: '#E0FFFF', // Light cyan color for lab courses
        borderColor: 'black',
        borderWidth: 1,
        shadowColor: '#00CED1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 5,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 5,
        color: '#333',
    },
    courseScheduleType: {
        alignSelf: 'flex-start',
        position: 'absolute',
        bottom: 12,
        left: 15,
    },
    timeContainer: {
        borderRadius: 7.5,
        width: '100%',
        marginLeft: 10,
        backgroundColor: '#333',
        borderWidth: 0,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
    },
    timeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    goToClassButtonContainer: {
        marginBottom: 10,
        marginLeft: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        height: 60,
        width: '100%',
    },
    goToClassText: {
        color: 'white',
        textTransform: 'uppercase',
        fontSize: 13,
        textAlign: 'center',
        padding: 10,
    },
    pressableForGoToClassButton: {
        flexDirection: 'row',
        backgroundColor: '#333',
        borderRadius: 7.5,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changedLocation: {
        backgroundColor: '#337ab7',
    },
    cancelMeetingButtonContainer: {
        marginVertical: 10,
        marginHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelMeetingText: {
        color: 'black',
        fontWeight: '500',
        textTransform: 'uppercase',
        textAlign: 'center',
        fontSize: 16,
    },
    cancelMeetingButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dedede',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    editButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#dedede',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    noteButtonContainer: {
        borderRadius: 10,
        width: '100%',
        marginLeft: 10,
        backgroundColor: '#ffe6c1',
        borderWidth: 1,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        marginBottom: 10,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    noteButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginLeft: 5,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -14,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    chevronIcon: {
        position: 'absolute',
        right: 8,
        bottom: 11,
    },
    labIcon: {
        marginTop: 7,
    },
    courseDetails: {
        marginBottom: 3,
    },
    noCoursesContainer: {
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 150,
        justifyContent: 'center',
        alignItems: 'center',
        width: '85%',
        alignSelf: 'center',
    },
    noCoursesText: {
        fontSize: 50,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
    },
    undefinedLocation: {
        backgroundColor: 'gray',
        opacity: 0.7,
        borderWidth: 0,
    },
    undefinedLocationText: {
        color: 'white',
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    input: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 12,
        width: '80%',
        height: 50,
        marginTop: 10,

    },
    transparent: {
        opacity: 0.4,
    },
    centeredModalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
        alignContent: 'center',
        minHeight: "25%",
        gap: 50,
        justifyContent: 'center',
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDetails: {
        fontSize: 16,
        marginBottom: 5,

    },

});