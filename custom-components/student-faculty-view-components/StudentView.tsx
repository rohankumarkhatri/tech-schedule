import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Pressable, Linking } from 'react-native';
import { convertToAmPm } from '../../custom-utils/helper-functions/CoursesHelperFunctions';
import { CourseDataType, TodaysCourseDataType } from '../../custom-utils/interfaces/CourseInterfaces';
import { ClubDataType, TodaysClubDataType } from '../../custom-utils/interfaces/ClubInterfaces';
import Modal from 'react-native-modal';
import { Context } from '../../app/_layout';
import { Ionicons, FontAwesome, FontAwesome5, FontAwesome6, MaterialCommunityIcons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { GETmyCoursesArray, GETUserEmail } from '@/custom-utils/helper-functions/GetSetFunctions';

type Props = {
    todaysCourses: TodaysCourseDataType[];
    todaysClubs: TodaysClubDataType[];
    openDirectionsInGMaps: (building: string, campus: string) => void;
    refreshing: boolean;
    onRefresh: () => void;
    turnOffDaysNote: string;
    DAY_NUMBER: number;
}

export default function StudentView({ todaysCourses, todaysClubs, openDirectionsInGMaps, refreshing, onRefresh, turnOffDaysNote, DAY_NUMBER }: Props) {

    const [courseModalVisible, setCourseModalVisible] = useState(false);
    const [clubModalVisible, setClubModalVisible] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<TodaysCourseDataType | null>(null);
    const [indicatorArray, setIndicatorArray] = useState<number[]>([]);
    const [indexManager, setindexManager] = useState<number[]>([]);
    const [selectedClub, setSelectedClub] = useState<TodaysClubDataType | null>(null);

    const myEmail = useRef('');
    const [myCoursesArray, setMyCoursesArray] = useState<CourseDataType[]>([]);

    const openModal = (course: TodaysCourseDataType) => {
        setSelectedCourse(course);
        setCourseModalVisible(true);
        setClubModalVisible(false);
    };

    const openClubModal = (club: TodaysClubDataType) => {
        setSelectedClub(club);
        setClubModalVisible(true);
        setCourseModalVisible(false);
    };

    const closeModal = () => {
        setCourseModalVisible(false);
        setClubModalVisible(false);
    };

    const handleModalHide = () => {
        setSelectedCourse(null);
    };

    const { globalRerender, setGlobalRerender } = useContext(Context);

    const getCurrentHHMM = () => {

        if (DAY_NUMBER === 1) {
            const now = new Date();
            return now.getHours() * 100 + now.getMinutes();
        }
        return 0;

    };

    useEffect(() => {
        const courseStartTimes = todaysCourses.map(course => ({
            startTime: course.meeting.startTime,
            source: 1,
        }));

        const clubStartTimes = todaysClubs.map(club => ({
            startTime: club.meeting.startTime,
            source: 0,
        }));

        const combinedStartTimes = [...courseStartTimes, ...clubStartTimes];
        const validStartTimes = combinedStartTimes.filter(item => item.startTime !== undefined && item.startTime !== null);
        validStartTimes.sort((a, b) => a.startTime - b.startTime);

        const indicator = validStartTimes.map(item => item.source);

        let j = 0;
        let k = 0;
        const newindexManager = [];

        for (let i = 0; i < indicator.length; i++) {
            if (indicator[i] === 1) {
                newindexManager.push(j);
                j++;
            } else if (indicator[i] === 0) {
                newindexManager.push(k);
                k++;
            }
        }

        setindexManager(newindexManager);
        setIndicatorArray(indicator);

        // Remove console logs or ensure they don't cause state changes
    }, [todaysCourses, todaysClubs]); // Ensure dependencies are correct


    useEffect(() => {
        onRefresh();

    }, [globalRerender]);

    useEffect(() => {
        GETUserEmail().then((email) => {
            myEmail.current = email;
        });
       GETmyCoursesArray().then((courses) => {
            setMyCoursesArray(courses);
        });
    }, []);


    const startOrEndTime = (startTime: number, endTime: number) => {
        const greaterTime = startTime > endTime ? startTime : endTime;
        return greaterTime;
    };

    /**
     * If current time is less than the range then return 0 
     * if it is in the range then return 1 
     * if it is greater than the range then return 2
     * @param startTime 
     * @param endTime 
     * @returns 
     */
    const whereIsCurrentTimeWithRespectToMeetingTimes = (startTime: number, endTime: number) => {

        const currentTime = getCurrentHHMM();

        if (startTime > endTime) { //special case

            if (currentTime >= startTime) {
                return 1;
            }
            else if (currentTime < startTime) {
                return 0;
            }

            //Important Note: no condition for greater than endTime is needed 
            //   since in this special case currentTime will never be greater than endTime
            //   because by then it will be the next day
        }

        if (currentTime < startTime && currentTime < endTime) {
            return 0;
        } else if (currentTime >= startTime && currentTime <= endTime) {
            return 1;
        } else if (currentTime > endTime && currentTime > startTime) {
            return 2;
        }
    };



    function renderSubjectIcon(scheduleType: string, subject: string) {
        if (scheduleType.toLocaleLowerCase() == 'laboratory') {
            switch (subject.toLowerCase()) {
                case 'environmental engineering':
                    return <Ionicons name="leaf" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'biology':
                    return <FontAwesome5 name="dna" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'plant and soil science':
                    return <FontAwesome5 name="seedling" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'construction engineering':
                    return <FontAwesome5 name="hard-hat" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'personal financial planning':
                    return <FontAwesome name="calculator" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'theatre arts':
                    return <FontAwesome5 name="theater-masks" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'music ensemble':
                    return <FontAwesome name="users" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'aerospace studies':
                    return <FontAwesome5 name="rocket" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'dance':
                    return <MaterialIcons name="directions-run" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'sociology':
                    return <Ionicons name="people" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'astronomy':
                    return <Ionicons name="planet" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'geography':
                    return <FontAwesome name="globe" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'renewable energy':
                    return <FontAwesome5 name="solar-panel" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'anthropology':
                    return <FontAwesome5 name="user-friends" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'electrical computer engr':
                    return <FontAwesome6 name="microchip" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'music theory':
                    return <FontAwesome name="music" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'physics':
                    return <FontAwesome5 name="atom" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'atmospheric science':
                    return <Ionicons name="cloud" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'environmental toxicology':
                    return <FontAwesome5 name="skull-crossbones" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'geology':
                    return <FontAwesome5 name="mountain" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'chemistry':
                    return <FontAwesome5 name="flask" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'personal fitness and wellness':
                    return <FontAwesome5 name="heartbeat" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'civil engineering':
                    return <FontAwesome5 name="drafting-compass" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'petroleum engineering':
                    return <FontAwesome5 name="oil-can" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'animal science':
                    return <FontAwesome5 name="paw" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'architecture':
                    return <FontAwesome5 name="building" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'chemical engineering':
                    return <FontAwesome5 name="vial" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'art':
                    return <Ionicons name="color-palette" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'nutritional sciences':
                    return <FontAwesome5 name="apple-alt" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'mechanical engineering':
                    return <FontAwesome name="cogs" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'music applied':
                    return <FontAwesome5 name="guitar" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                default:
                    if (scheduleType.toLowerCase() === 'laboratory') {
                        return <MaterialCommunityIcons name="test-tube" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                    }
                    return null;
            }
        }
        else if (scheduleType.toLocaleLowerCase() == "no credit lab") {
            switch (subject.toLowerCase()) {
                case 'agricultural education':
                    return <FontAwesome5 name="tractor" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'engineering':
                    return <FontAwesome5 name="cogs" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'biology':
                    return <FontAwesome5 name="dna" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'agricultural systems managemnt':
                    return <FontAwesome5 name="sitemap" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'apparel design and manufactrng':
                    return <FontAwesome5 name="tshirt" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'plant and soil science':
                    return <FontAwesome5 name="seedling" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'mass communications':
                    return <FontAwesome5 name="broadcast-tower" size={20.5} color="#373737" style={{ marginVertical: 5 }} />;
                case 'construction engineering':
                    return <FontAwesome5 name="hard-hat" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'military science':
                    return <FontAwesome5 name="medal" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'veterinary sciences':
                    return <FontAwesome5 name="paw" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'theatre arts':
                    return <FontAwesome5 name="theater-masks" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'industrial engineering':
                    return <FontAwesome5 name="industry" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'kinesiology':
                    return <FontAwesome5 name="running" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'dance':
                    return <MaterialIcons name="directions-run" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'astronomy':
                    return <AntDesign name="star" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                case 'computer science':
                    return <FontAwesome5 name="laptop-code" size={20} color="#373737" style={{ marginVertical: 5 }} />;
                case 'advertising':
                    return <FontAwesome5 name="ad" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'agricultural communications':
                    return <FontAwesome5 name="bullhorn" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'restaurant hotel inst mgmt':
                    return <FontAwesome5 name="concierge-bell" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'interior design':
                    return <FontAwesome5 name="couch" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'landscape architecture':
                    return <FontAwesome5 name="tree" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'natural resource management':
                    return <FontAwesome5 name="leaf" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'psychology':
                    return <FontAwesome5 name="brain" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'physics':
                    return <FontAwesome5 name="atom" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'family consumer sciences educ':
                    return <FontAwesome5 name="home" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'retail management':
                    return <FontAwesome5 name="store" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'agricultural science':
                    return <FontAwesome5 name="wheat" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'zoology':
                    return <FontAwesome5 name="hippo" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'early childhood in hdfs':
                    return <FontAwesome5 name="child" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'biotechnology':
                    return <FontAwesome5 name="microscope" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'geographic information systems':
                    return <FontAwesome5 name="map-marked-alt" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'geology':
                    return <FontAwesome5 name="mountain" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'civil engineering':
                    return <FontAwesome5 name="bridge" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'food science':
                    return <FontAwesome5 name="utensils" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'geophysics':
                    return <FontAwesome5 name="globe" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'petroleum engineering':
                    return <FontAwesome5 name="oil-can" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'human development family study':
                    return <FontAwesome5 name="users" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'animal science':
                    return <FontAwesome5 name="paw" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'architecture':
                    return <FontAwesome5 name="building" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'chemical engineering':
                    return <FontAwesome5 name="flask" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'microbiology':
                    return <FontAwesome5 name="bacteria" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'nutritional sciences':
                    return <FontAwesome5 name="apple-alt" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                case 'mechanical engineering':
                    return <FontAwesome5 name="wrench" size={21} color="#373737" style={{ marginVertical: 5 }} />;
                default:
                    if (scheduleType.toLowerCase() === 'no credit lab') {
                        return <MaterialCommunityIcons name="test-tube" size={23} color="#373737" style={{ marginVertical: 5 }} />;
                    }
                    return null;
            }
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {(todaysCourses?.length > 0 || todaysClubs?.length > 0) ? (

                    indicatorArray.map((indicator, index) => (
                        indicator === 1 ? (
                            <View key={index} style={[index % 2 === 0 ? { backgroundColor: 'rgba(55,55,55,1)' } : {}, { paddingTop: 25, paddingBottom: 5 }]}>
                                {/* This is the row that contains the course container, the note button, and the time container */}
                                <View style={[{ marginHorizontal: 20 }]}>
                                    <Pressable
                                        onPress={() => openModal(todaysCourses[indexManager[index]])}
                                        style={[
                                            styles.courseContainer,
                                            todaysCourses[indexManager[index]]?.isTransparent && styles.transparent,
                                            !todaysCourses[indexManager[index]]?.meeting.hasMeeting && { opacity: 0 },
                                            // todaysCourses[indexManager[index]].Section.includes('H') && styles.honorsCourse, // Apply honors course style
                                            (todaysCourses[indexManager[index]]?.ScheduleType.includes('Lab')) && styles.labCourse, // Apply lab course style
                                            whereIsCurrentTimeWithRespectToMeetingTimes(todaysCourses[indexManager[index]].meeting.startTime, todaysCourses[indexManager[index]].meeting.endTime) === 2 && styles.pastEndTime,
                                        ]}
                                    >

                                        <Text style={[styles.courseTitle, whereIsCurrentTimeWithRespectToMeetingTimes(todaysCourses[indexManager[index]]?.meeting.startTime,
                                            todaysCourses[indexManager[index]]?.meeting.endTime) === 2 && { fontWeight: '500', opacity: 0.8 }]}
                                            numberOfLines={2}
                                            ellipsizeMode='tail'>
                                            {todaysCourses[indexManager[index]].Title}
                                        </Text>

                                        {(todaysCourses[indexManager[index]]?.ScheduleType.includes('Lab') &&
                                            !(whereIsCurrentTimeWithRespectToMeetingTimes(todaysCourses[indexManager[index]]?.meeting.startTime,
                                                todaysCourses[indexManager[index]]?.meeting.endTime) === 2)) &&
                                            renderSubjectIcon(todaysCourses[indexManager[index]].ScheduleType, todaysCourses[indexManager[index]].SubjectDescription)}

                                        {!(whereIsCurrentTimeWithRespectToMeetingTimes(todaysCourses[indexManager[index]]?.meeting.startTime,
                                            todaysCourses[indexManager[index]]?.meeting.endTime) === 2) &&
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>


                                                <Text >{todaysCourses[indexManager[index]].ScheduleType}</Text>

                                                {whereIsCurrentTimeWithRespectToMeetingTimes(todaysCourses[indexManager[index]]?.meeting.startTime,
                                                    todaysCourses[indexManager[index]]?.meeting.endTime) === 1 &&
                                                    <View style={{ backgroundColor: '#4b844e', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 12, width: 100, shadowColor: 'green' }}>
                                                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '500', textAlign: 'center' }}>ACTIVE</Text>
                                                    </View>}

                                                {todaysCourses[indexManager[index]].note && (
                                                    <View style={{
                                                        backgroundColor: 'red',
                                                        borderRadius: 5,
                                                        minWidth: 32,
                                                        minHeight: 32,
                                                        paddingHorizontal: 8,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        position: 'absolute',
                                                        right: 33
                                                    }}>
                                                        <Text style={{ color: 'white', fontSize: 20, textAlign: 'center', fontWeight: '500' }}>{`!`}</Text>
                                                    </View>
                                                )}

                                                {/* <View style={[{
                                                height: 45,
                                                width: 100,
                                            }, todaysCourses[indexManager[index]].isTransparent && { opacity: 0.5 }]}>
                                                <Text style={{ color: 'transparent', fontSize: 17, textAlign: 'center', fontWeight: 'bold' }}>
                                                    {todaysCourses[indexManager[index]].meeting.hasMeeting && todaysCourses[indexManager[index]].meeting.startTime !== 9999 ?
                                                        `${convertToAmPm(todaysCourses[indexManager[index]].meeting.startTime.toString())}\n${convertToAmPm(todaysCourses[indexManager[index]].meeting.endTime.toString())}` : 'No Meeting Times'}
                                                </Text>
                                            </View> */}

                                                <Ionicons name="chevron-forward" size={20} color="#515151" style={{ position: 'absolute', right: 0 }} />
                                            </View>
                                        }

                                    </Pressable>
                                </View >

                                {/* This is the row that contains the go to class button */}
                                {
                                    !(whereIsCurrentTimeWithRespectToMeetingTimes(todaysCourses[indexManager[index]]?.meeting.startTime,
                                        todaysCourses[indexManager[index]]?.meeting.endTime) === 2) ? (
                                        todaysCourses[indexManager[index]]?.isTransparent ?

                                            <View style={[{
                                                marginTop: 10,
                                                marginBottom: 10,
                                                marginHorizontal: 20,
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                opacity: 0.9,
                                            }]}>
                                                <View style={styles.canceledCourseContainer}>
                                                    <Text style={{ color: 'white', fontWeight: '500', fontSize: 16, textAlign: 'center' }}>CANCELED</Text>
                                                </View>
                                            </View>
                                            :
                                            <View style={{
                                                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 23,
                                                opacity: whereIsCurrentTimeWithRespectToMeetingTimes(todaysCourses[indexManager[index]]?.meeting.startTime,
                                                    todaysCourses[indexManager[index]]?.meeting.endTime) === 2 ? 0.5 : 1
                                            }}>
                                                <View style={[styles.goToClassButtonContainer]}>
                                                    {todaysCourses[indexManager[index]]?.meeting.building !== 'none' && todaysCourses[indexManager[index]]?.changedBuilding === '' && todaysCourses[indexManager[index]]?.changedRoom === '' ? (
                                                        <TouchableOpacity
                                                            activeOpacity={0.8}
                                                            style={[
                                                                styles.pressableForGoToClassButton,
                                                                todaysCourses[indexManager[index]]?.isTransparent && { opacity: 0.5 }
                                                            ]}
                                                            onPress={() => openDirectionsInGMaps(todaysCourses[indexManager[index]]?.meeting.building, todaysCourses[indexManager[index]]?.Campus)}
                                                        >
                                                            <Text style={styles.pressableText} numberOfLines={1} ellipsizeMode='tail'>{`${todaysCourses[indexManager[index]].meeting.room} ${todaysCourses[indexManager[index]].meeting.building}`}</Text>
                                                            <Ionicons style={{ marginHorizontal: 5 }} name="arrow-forward" size={17} color="white" />
                                                        </TouchableOpacity>
                                                    ) : todaysCourses[indexManager[index]]?.Section?.startsWith('D') ? (
                                                        <View
                                                            style={[
                                                                styles.pressableForGoToClassButton,
                                                                styles.onlineSectionTextContainer,
                                                                todaysCourses[indexManager[index]]?.isTransparent && { opacity: 0.5 }
                                                            ]}
                                                        >
                                                            <Text style={styles.pressableText} numberOfLines={1} ellipsizeMode='tail'>
                                                                DIGITAL
                                                            </Text>
                                                        </View>
                                                    ) : todaysCourses[indexManager[index]]?.changedBuilding !== '' ? (
                                                        <TouchableOpacity
                                                            activeOpacity={0.8}
                                                            style={[
                                                                styles.pressableForGoToClassButton,
                                                                styles.changedLocation,
                                                                todaysCourses[indexManager[index]]?.isTransparent && { opacity: 0.5 }
                                                            ]}
                                                            onPress={() => openDirectionsInGMaps(todaysCourses[indexManager[index]]?.changedBuilding, todaysCourses[indexManager[index]]?.Campus)}
                                                        >
                                                            <Text style={styles.pressableText} numberOfLines={1} ellipsizeMode='tail'>
                                                                {todaysCourses[indexManager[index]]?.changedRoom === '' ? `${todaysCourses[indexManager[index]]?.meeting.room} ${todaysCourses[indexManager[index]]?.changedBuilding}` :
                                                                    `${todaysCourses[indexManager[index]]?.changedRoom} ${todaysCourses[indexManager[index]]?.changedBuilding}`}
                                                            </Text>
                                                            <Ionicons name="arrow-forward" size={17} color="white" />
                                                        </TouchableOpacity>
                                                    ) : todaysCourses[indexManager[index]]?.changedRoom !== '' ? (
                                                        <TouchableOpacity
                                                            activeOpacity={0.8}
                                                            style={[
                                                                styles.pressableForGoToClassButton,
                                                                styles.changedLocation,
                                                                todaysCourses[indexManager[index]]?.isTransparent && { opacity: 0.5 }
                                                            ]}
                                                            onPress={() => openDirectionsInGMaps(todaysCourses[indexManager[index]]?.meeting.building, todaysCourses[indexManager[index]]?.Campus)}
                                                        >
                                                            <Text style={styles.pressableText} numberOfLines={1} ellipsizeMode='tail'>
                                                                {todaysCourses[indexManager[index]].changedRoom} {todaysCourses[indexManager[index]].meeting.building}
                                                            </Text>
                                                            <Ionicons name="arrow-forward" size={17} color="white" />
                                                        </TouchableOpacity>
                                                    ) : (
                                                        <View style={[styles.pressableForGoToClassButton, styles.undefinedLocation]}>
                                                            <Text style={styles.undefinedLocationText}>none</Text>
                                                        </View>
                                                    )}
                                                </View>

                                                <View style={[styles.timeContainer, todaysCourses[indexManager[index]]?.isTransparent && { opacity: 0.5 }]}>
                                                    <Text style={styles.timeText}>
                                                        {todaysCourses[indexManager[index]]?.meeting.hasMeeting && todaysCourses[indexManager[index]]?.meeting.startTime !== 9999 ?
                                                            `${convertToAmPm(todaysCourses[indexManager[index]]?.meeting.startTime.toString())} - ${convertToAmPm(todaysCourses[indexManager[index]]?.meeting.endTime.toString())}` : 'No Meeting Times'}
                                                    </Text>
                                                </View>
                                            </View>
                                    ) : (
                                        <View style={{ height: 20 }} />
                                    )
                                }


                            </View >
                        ) :

                            // -----------------------------------------------------------------------------------
                            // -----------------------------------------------------------------------------------
                            // -----------------------------------------------------------------------------------
                            // ------------DIVIDER--- COURSES UP ------- CLUBS DOWN ------------------------------
                            // -----------------------------------------------------------------------------------
                            // -----------------------------------------------------------------------------------
                            // -----------------------------------------------------------------------------------

                            (

                                <View key={index} style={[index % 2 === 0 ? { backgroundColor: 'rgba(55,55,55,1)' } : {}, { paddingTop: 25, paddingBottom: 5 }]}>


                                    {/* This is the row that contains the course container, the note button, and the time container */}
                                    <View style={[{ marginHorizontal: 20 }]}>
                                        <Pressable
                                            onPress={() => openClubModal(todaysClubs[indexManager[index]])}
                                            style={[
                                                styles.clubContainer,
                                                whereIsCurrentTimeWithRespectToMeetingTimes(todaysClubs[indexManager[index]]?.meeting.startTime,
                                                    todaysClubs[indexManager[index]]?.meeting.endTime) === 2 && styles.pastEndTime,
                                                !todaysClubs[indexManager[index]]?.meeting.hasMeeting && { opacity: 0 },
                                            ]}
                                        >
                                            <Text style={[styles.courseTitle, whereIsCurrentTimeWithRespectToMeetingTimes(todaysClubs[indexManager[index]]?.meeting.startTime,
                                                todaysClubs[indexManager[index]]?.meeting.endTime) === 2 && { fontWeight: '500' }]} numberOfLines={2} ellipsizeMode='tail'>{todaysClubs[indexManager[index]]?.name}
                                            </Text>


                                            {<MaterialIcons name="groups" size={25} color="black" />}

                                            {!(whereIsCurrentTimeWithRespectToMeetingTimes(todaysClubs[indexManager[index]]?.meeting.startTime,
                                                todaysClubs[indexManager[index]]?.meeting.endTime) === 2) &&
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                                    <Text>Club Meeting</Text>

                                                    {whereIsCurrentTimeWithRespectToMeetingTimes(todaysClubs[indexManager[index]]?.meeting.startTime,
                                                        todaysClubs[indexManager[index]]?.meeting.endTime) === 1 &&
                                                        <View style={{ backgroundColor: '#4b844e', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 12, width: 100, shadowColor: 'green' }}>
                                                            <Text style={{ color: 'white', fontSize: 12, fontWeight: '500', textAlign: 'center' }}>ACTIVE</Text>
                                                        </View>}

                                                    {/* <Ionicons name="chevron-forward" size={20} color="#515151" style={{ position: 'absolute', right: 0 }} /> */}


                                                </View>}

                                        </Pressable>

                                    </View>

                                    {/* This is the row that contains the go to class button */}
                                    {
                                        !(whereIsCurrentTimeWithRespectToMeetingTimes(todaysClubs[indexManager[index]]?.meeting.startTime,
                                            todaysClubs[indexManager[index]]?.meeting.endTime) === 2) ? (
                                            <View style={{
                                                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 23, opacity: whereIsCurrentTimeWithRespectToMeetingTimes(todaysClubs[indexManager[index]]?.meeting.startTime,
                                                    todaysClubs[indexManager[index]]?.meeting.endTime) === 2 ? 0.5 : 1
                                            }}>



                                                <View style={[styles.goToClassButtonContainer]}>
                                                    <TouchableOpacity
                                                        activeOpacity={0.8}
                                                        style={[
                                                            styles.pressableForGoToClassButton,
                                                        ]}
                                                        onPress={() => openDirectionsInGMaps(todaysClubs[indexManager[index]]?.meeting.building, "TTU")}
                                                    >
                                                        <Text style={styles.pressableText} numberOfLines={1} ellipsizeMode='tail'>{`${todaysClubs[indexManager[index]]?.meeting.room} ${todaysClubs[indexManager[index]]?.meeting.building}`}</Text>
                                                        <Ionicons style={{ marginHorizontal: 5 }} name="arrow-forward" size={17} color="white" />
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={[styles.timeContainer]}>
                                                    <Text style={styles.timeText}>
                                                        {todaysClubs[indexManager[index]]?.meeting.hasMeeting && todaysClubs[indexManager[index]]?.meeting.startTime !== 9999 ?
                                                            `${convertToAmPm(todaysClubs[indexManager[index]]?.meeting.startTime.toString())} - ${convertToAmPm(todaysClubs[indexManager[index]]?.meeting.endTime.toString())}` : 'No Meeting Times'}
                                                    </Text>
                                                </View>

                                            </View>
                                        ) : (
                                            <View style={{ height: 20 }} />
                                        )
                                    }

                                    {/* {todaysClubs[indexManager[index]]?.meeting.senderEmail == myEmail.current && (whereIsCurrentTimeWithRespectToMeetingTimes(todaysClubs[indexManager[index]]?.meeting.startTime,
                                        todaysClubs[indexManager[index]]?.meeting.endTime) === 1) && (
                                            <TouchableOpacity
                                                style={{ backgroundColor: 'red', padding: 10, borderRadius: 5, marginHorizontal: 20, marginBottom: 10 }}
                                                onPress={() => {
                                                    update(ref(realTimeDb, `ClubsDirectory/${todaysClubs[indexManager[index]]?.index}/meeting/`), { exists: false }).then(() => {
                                                        setGlobalRerender(prev => !prev);
                                                    });

                                                }}
                                            >
                                                <Text style={{ color: 'white', fontWeight: '500' }}>Cancel Meeting</Text>
                                            </TouchableOpacity>
                                        )} */}

                                </View>
                            )
                    ))

                ) : (
                    <View style={styles.noCoursesContainer}>
                        {turnOffDaysNote == '' || turnOffDaysNote == null || !turnOffDaysNote ? (
                            <Text style={styles.noCoursesText}>FREE DAY! 🍻</Text>
                        ) : (
                            <Text style={styles.noCoursesText}>{turnOffDaysNote}</Text>
                        )}
                        <Text style={{ position: 'absolute', bottom: 70, fontSize: 16, fontWeight: '500', color: 'white', opacity: 0.5 }}>Pull down to refresh</Text>
                    </View>
                )
                }
                <View style={{ height: 300 }} />
            </ScrollView >

            {selectedCourse && (
                <Modal
                    isVisible={courseModalVisible}
                    onBackdropPress={closeModal}
                    onSwipeComplete={closeModal}
                    swipeDirection="down"
                    style={{ justifyContent: 'flex-end', margin: 0 }}
                    animationIn="slideInUp"
                    animationOut="slideOutDown"
                    backdropOpacity={0.5}
                    onModalHide={handleModalHide}
                    statusBarTranslucent={true}
                    backdropTransitionOutTiming={0}
                >

                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        {selectedCourse.note && (
                            <>
                                <Text style={{ textAlign: 'center', marginVertical: 10, fontSize: 20 }}>Note by Instructor for this meeting</Text>
                                <View style={{ padding: 5, margin: 5, borderRadius: 10, backgroundColor: '#3b3b3b', minHeight: 150 }}>
                                    <Text style={{ textAlign: 'center', fontSize: 16, padding: 10, color: 'white' }}>{selectedCourse.note}</Text>
                                </View>
                                <View style={{ borderBottomColor: 'lightgray', borderBottomWidth: 1.5, marginVertical: 22 }} />
                            </>
                        )}
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
                            <Text style={[styles.modalDetails, { color: 'blue' }]}>
                                {selectedCourse.PrimaryInstructor_url}
                            </Text>
                        </TouchableOpacity>
                        {myCoursesArray.map(course => {
                            if (course.CRN === selectedCourse.CRN && course.Instructors && course.Instructors.length > 1) {
                                return course.Instructors.filter(instructor => instructor.name !== selectedCourse.PrimaryInstructor).map((instructor, index) => (
                                    <View key={index}>
                                        <Text style={styles.modalDetails}>Instructor: {instructor.name}</Text>
                                        <TouchableOpacity onPress={() => Linking.openURL(instructor.url)}>
                                            <Text style={[styles.modalDetails, { color: 'blue' }]}>
                                                {instructor.url}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ));
                            }
                            return null;
                        })}
                        <Text style={styles.modalDetails}>
                            Meeting Times: {selectedCourse.meeting.hasMeeting && selectedCourse.meeting.startTime !== 9999 ?
                                `${convertToAmPm(selectedCourse.meeting.startTime.toString())} - ${convertToAmPm(selectedCourse.meeting.endTime.toString())}` : 'No Meeting Times'}
                        </Text>
                        <Text style={styles.modalDetails}>Class Building: {selectedCourse.meeting.building.toUpperCase()}</Text>
                        <Text style={styles.modalDetails}>Class Room: {selectedCourse.meeting.room}</Text>
                        {(selectedCourse.changedBuilding !== '' || selectedCourse.changedRoom !== '') && (
                            <View style={{ padding: 5, margin: 5, borderRadius: 10, borderWidth: 1, borderColor: 'black', backgroundColor: '#00BCD4', position: 'relative', left: -10 }}>
                                {selectedCourse.changedBuilding !== '' && <Text style={[styles.modalDetails, { marginBottom: 2, marginLeft: 5, fontWeight: '500', color: 'white', paddingTop: 5, paddingHorizontal: 5 }]}>Changed Building: {selectedCourse.changedBuilding.toUpperCase()}</Text>}
                                {selectedCourse.changedRoom !== '' && <Text style={[styles.modalDetails, { marginBottom: 2, marginLeft: 5, fontWeight: '500', color: 'white', padding: 5 }]}>Changed Room: {selectedCourse.changedRoom}</Text>}
                            </View>
                        )}
                    </View>
                </Modal>
            )}

            {selectedClub && (
                <Modal
                    isVisible={clubModalVisible}
                    onBackdropPress={closeModal}
                    onSwipeComplete={closeModal}
                    swipeDirection="down"
                    style={{ justifyContent: 'flex-end', margin: 0 }}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        {selectedClub.meeting.note !== '' && (
                            <>
                                <Text style={{ textAlign: 'center', marginVertical: 10, fontSize: 20 }}>Note by {selectedClub.meeting.senderName}</Text>
                                <View style={{ padding: 5, margin: 5, borderRadius: 10, backgroundColor: '#3b3b3b', minHeight: 150 }}>
                                    <Text style={{ textAlign: 'center', fontSize: 16, padding: 10, color: 'white' }}>{selectedClub.meeting.note}</Text>
                                </View>
                                <View style={{ borderBottomColor: 'lightgray', borderBottomWidth: 1.5, marginVertical: 22 }} />
                            </>
                        )}
                        <Text style={styles.modalTitle}>{selectedClub.name}</Text>
                        <Text style={styles.modalDetails}>Meeting Time: {convertToAmPm(selectedClub.meeting.startTime.toString())} - {convertToAmPm(selectedClub.meeting.endTime.toString())}</Text>
                        <Text style={styles.modalDetails}>Meeting Location: {selectedClub.meeting.building} {selectedClub.meeting.room}</Text>
                        <Text style={styles.modalDetails}>Meeting Date: {selectedClub.meeting.startDate ? new Date(selectedClub.meeting.startDate).toLocaleDateString() : 'N/A'}</Text>
                        <Text style={styles.modalDetails}>Organizer: {selectedClub.meeting.senderName}</Text>
                        <Text style={styles.modalDetails}>Contact: {selectedClub.meeting.senderEmail}</Text>
                    </View>

                </Modal>
            )}

        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#484848',
    },
    courseContainer: {
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 13.5,
        borderRadius: 10,
        minHeight: 105,
        width: '100%',
        shadowColor: 'white',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 3.84,
        elevation: 10,
    },
    pastEndTime: {
        backgroundColor: 'darkgray',
        opacity: 0.6,
        minHeight: 0,
        shadowColor: 'transparent',
    },
    clubContainer: {
        justifyContent: 'space-between',
        backgroundColor: '#E6E6FA', // light purple
        padding: 15,
        borderRadius: 10,
        minHeight: 110,
        width: '100%',
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
        shadowColor: '#f7e294',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.84,
        shadowRadius: 3.84,
        elevation: 10,
    },
    labCourse: {
        backgroundColor: 'white', // Light cyan color for lab courses
        borderColor: 'black',
        shadowColor: 'rgba(247,226,148,0.7)',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3.84,
        elevation: 5,
    },
    courseTitle: {
        fontSize: 17,
        fontWeight: '500',
        marginBottom: 5,
        color: 'black',
    },
    courseScheduleType: {
        position: 'absolute',
        bottom: 12,
        left: 15,
    },
    timeWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    timeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '50%',
    },
    timeText: {
        fontSize: 15,
        fontWeight: '500',
        color: 'white',
        width: '100%',
        textAlignVertical: 'center',
    },
    noteButtonWrapper: {
        position: 'relative',
    },
    noteButtonContainer: {
        borderRadius: 9,
        width: '100%',
        marginLeft: 10,
        backgroundColor: '#d3d3d3',
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
        right: 10,
        bottom: 15,
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
    goToClassButtonContainer: {
        maxWidth: '42%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pressableForGoToClassButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 5,
    },
    pressableText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    undefinedLocation: {
        backgroundColor: 'transparent',
        opacity: 0.5,
        borderWidth: 0,
    },
    undefinedLocationText: {
        color: 'white',
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    transparent: {
        opacity: 0.4,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
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
    centeredModal: {
        justifyContent: 'center',
        margin: 0,
        alignItems: 'center',
    },
    centeredModalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
        alignContent: 'center',
        minHeight: "25%",
    },
    noteModalDetails: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    noteModalTitle: {
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
    changedLocation: {
        borderColor: '#00BCD4',
        borderWidth: 2,
        marginVertical:4,
        paddingHorizontal:10
    },
    canceledCourseContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        borderWidth: 0.5,
        borderColor: 'white',
        width: '100%',
    },
    onlineSectionTextContainer:{
        paddingHorizontal: 10
    }
});