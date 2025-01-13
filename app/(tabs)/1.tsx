import FacultyView from '@/custom-components/student-faculty-view-components/FacultyView';
import StudentView from '@/custom-components/student-faculty-view-components/StudentView';
import { findTodaysClubsAndSort, findTodaysCoursesAndSort, openDirectionsInGMaps } from '@/custom-utils/helper-functions/DayHelperFunctions';
import { updateBuildingStatus, updateClassStatus, updateNoteStatus, updateRoomStatus } from '@/custom-utils/helper-functions/FacultyUpdateFunctions';
import { GETisUserFaculty, GETturnOffDays } from '@/custom-utils/helper-functions/GetSetFunctions';
import { TodaysClubDataType } from '@/custom-utils/interfaces/ClubInterfaces';
import { TodaysCourseDataType } from '@/custom-utils/interfaces/CourseInterfaces';
import { useState, useEffect } from 'react';


const DAY_NUMBER = 1; // Tab Number

export default function Day1() {

    const [refreshing, setRefreshing] = useState(false);
    const [rerender, setRerender] = useState(false);

    const [isFaculty, setIsFaculty] = useState(false);
    const [todaysCourses, setTodaysCourses] = useState<TodaysCourseDataType[]>([]);
    const [todaysClubs, setTodaysClubs] = useState<TodaysClubDataType[]>([]);

    const [turnOffDaysNote, setTurnOffDaysNote] = useState('');

    useEffect(() => {

        const findAndShowCourses = async () => {

            const isFaculty = await GETisUserFaculty();
            setIsFaculty(isFaculty);

            const sortedCourses = await findTodaysCoursesAndSort(DAY_NUMBER);
            setTodaysCourses(sortedCourses);

            if (!isFaculty) {

                const sortedClubs = await findTodaysClubsAndSort(DAY_NUMBER);
                setTodaysClubs(sortedClubs);

                GETturnOffDays().then((turnOffDays) => {

                    for (let i = 0; i < turnOffDays.length; i++) {

                        const [startDateString, endDateString] = turnOffDays[i].startToEndDate.split('-').map(String);

                        const [month, day, year] = startDateString.split('/').map(Number);
                        const startDate = new Date(year, month - 1, day);

                        const [month2, day2, year2] = endDateString.split('/').map(Number);
                        const endDate = new Date(year2, month2 - 1, day2);

                        const today = new Date();

                        startDate.setHours(0, 0, 0, 0);
                        endDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);

                        today.setDate(today.getDate() + DAY_NUMBER - 1);

                        if (startDate <= today && endDate >= today) {
                            setTurnOffDaysNote(turnOffDays[i].note);
                            if (turnOffDays[i].elements.includes("clubs")) {
                                setTodaysClubs([]);
                            }
                            if (turnOffDays[i].elements.includes("courses")) {
                                setTodaysCourses([]);
                            }
                        }
                        else if (i === turnOffDays.length - 1) {
                            setTurnOffDaysNote('');
                        }
                    }
                });

            }
            else if (isFaculty) {

                GETturnOffDays().then((turnOffDays) => {
                    for (let i = 0; i < turnOffDays.length; i++) {

                        const [startDateString, endDateString] = turnOffDays[i].startToEndDate.split('-').map(String);

                        const [month, day, year] = startDateString.split('/').map(Number);
                        const startDate = new Date(year, month - 1, day);

                        const [month2, day2, year2] = endDateString.split('/').map(Number);
                        const endDate = new Date(year2, month2 - 1, day2);

                        const today = new Date();

                        startDate.setHours(0, 0, 0, 0);
                        endDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);

                        today.setDate(today.getDate() + DAY_NUMBER - 1);

                        if (startDate <= today && endDate >= today) {
                            setTurnOffDaysNote(turnOffDays[i].note);
                            if (turnOffDays[i].elements.includes("courses")) {
                                setTodaysCourses([]);
                            }
                        }
                        else if (i === turnOffDays.length - 1) {
                            setTurnOffDaysNote('');
                        }
                    }
                });
            }
        };


        findAndShowCourses();
    }, [rerender]);

    const onRefresh = () => {
        setRefreshing(true);
        setRerender(prev => !prev);
        setRefreshing(false);
    }

    const updateTransparency = async (index: number) => {
        setTodaysCourses(prev => {
            const updatedCourses = [...prev];
            updatedCourses[index].isTransparent = !updatedCourses[index].isTransparent;
            updateClassStatus(todaysCourses[index], !updatedCourses[index].isTransparent, DAY_NUMBER);
            return updatedCourses;
        });
    };

    const updateBuilding = (index: number, building: string) => {
        setTodaysCourses(prev => {
            const updatedCourses = [...prev];
            building = building.toLowerCase();
            if (building === updatedCourses[index].meeting.building) {
                updatedCourses[index].meeting.building = building;
                updatedCourses[index].changedBuilding = '';
            }
            else {
                updatedCourses[index].changedBuilding = building;
            }
            updateBuildingStatus(todaysCourses[index], building, DAY_NUMBER);
            return updatedCourses;
        });
    };

    const updateRoom = (index: number, room: string) => {
        setTodaysCourses(prev => {
            const updatedCourses = [...prev];
            room = room.toLowerCase();
            if (room === updatedCourses[index].meeting.room) {
                updatedCourses[index].meeting.room = room;
                updatedCourses[index].changedRoom = '';
            }
            else {
                updatedCourses[index].changedRoom = room;
            }
            updateRoomStatus(todaysCourses[index], room, DAY_NUMBER);
            return updatedCourses;
        });
    };

    const updateNote = (index: number, note: string) => {
        setTodaysCourses(prev => {
            const updatedCourses = [...prev];
            updatedCourses[index].note = note;
            updateNoteStatus(todaysCourses[index], note, DAY_NUMBER);
            return updatedCourses;
        });
    };


    return (
        (
            isFaculty ?
                <FacultyView todaysCourses={todaysCourses} openDirectionsInGMaps={openDirectionsInGMaps} updateTransparency={updateTransparency} updateBuilding={updateBuilding} updateRoom={updateRoom} updateNote={updateNote} refreshing={refreshing} onRefresh={onRefresh} turnOffDaysNote={turnOffDaysNote} />
                :
                <StudentView todaysCourses={todaysCourses} todaysClubs={todaysClubs} openDirectionsInGMaps={openDirectionsInGMaps} refreshing={refreshing} onRefresh={onRefresh} turnOffDaysNote={turnOffDaysNote} DAY_NUMBER={DAY_NUMBER} />
        )
    );
}


