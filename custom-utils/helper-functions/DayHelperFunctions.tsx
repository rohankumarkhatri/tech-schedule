import { Linking } from "react-native";
import { GETmyAcceptedClubs, GETmyCoursesArray } from "./GetSetFunctions";
import { TodaysClubDataType } from "../interfaces/ClubInterfaces";
import { TodaysCourseDataType } from "../interfaces/CourseInterfaces";

//for faculty and student
export async function findTodaysCoursesAndSort(DAY_NUMBER: number) {
    const filteredCourses = await findCoursesForTheDay(DAY_NUMBER);
    if(!filteredCourses || filteredCourses.length == 0){
        return []
    }
    const sortedCourses = sortCoursesByStartTime(filteredCourses);

    return sortedCourses;
}

//For student clubs:
export async function findTodaysClubsAndSort(DAY_NUMBER: number) {
    const filteredClubs = await findClubsForTheDay(DAY_NUMBER);
    if(!filteredClubs || filteredClubs.length === 0){
        return []
    }
    const sortedClubs = sortClubsByStartTime(filteredClubs);

    return sortedClubs;
}

//for faculty and student
export function openDirectionsInGMaps(building: string, campus: string) {

    let url = '';

    if (building !== 'None') { 

        console.log('building: ', building);
        console.log('campus: ', campus);

        if (campus === 'Lubbock TTU') {

            url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(building + ' Building ' + campus + ', TX')}&travelmode=walking`;
        }
        else {
            url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(building + ' ' + campus + ', TX')}&travelmode=walking`;
        }

        Linking.openURL(url).catch(err => console.error('An error occurred', err));

    }
    else {
        alert('No Building Specified For this Class');
    }
}

//Local Helper Function
function stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}





//for faculty and student
async function findCoursesForTheDay(dayNumber: number): Promise<TodaysCourseDataType[]> {

    const courses = await GETmyCoursesArray();
    if(courses == null){
        return []
    }
    const todaysCoursesArray: TodaysCourseDataType[] = []; //to be filled
    const todayDate = stripTime(new Date());
    todayDate.setDate(todayDate.getDate() + dayNumber - 1);

    const todayDay = todayDate.toLocaleDateString('en-US', { weekday: 'long' });

    for (const eachCourse of courses) {

        if (eachCourse.parsedMeetingTimes) {
            for (const eachParsedMeetingTime of eachCourse.parsedMeetingTimes) {

                if (eachParsedMeetingTime.hasMeeting) { //i.e. is day, date defined (may be time too, check parseMeetingTimes function)

                    const startDate = new Date(eachParsedMeetingTime.startDate);
                    const endDate = new Date(eachParsedMeetingTime.endDate);

                    if (todayDate >= startDate && todayDate <= endDate) {
                        if (eachParsedMeetingTime.days.includes(todayDay)) {

                            //this needs to be tested because of just comparing dates
                            const isTransparent = eachParsedMeetingTime.ClassStatusChanges?.some((change: { dateOfChange: Date; isOn: boolean; }) =>
                                new Date(change.dateOfChange).getDate() === stripTime(todayDate).getDate() && !change.isOn
                            );


                            const noteUpdate = eachParsedMeetingTime.NoteUpdates?.find((change: { dateOfChange: Date; note: string; }) =>
                                new Date(change.dateOfChange).getDate() === stripTime(todayDate).getDate() && change.note !== ''
                            );
                            const note = noteUpdate ? noteUpdate.note : '';


                            const buildingUpdate = eachParsedMeetingTime.BuildingUpdates?.find((change: { dateOfChange: Date; building: string; }) =>
                                new Date(change.dateOfChange).getDate() === stripTime(todayDate).getDate() && change.building !== 'None'
                            );
                            const changedBuilding = buildingUpdate ? buildingUpdate.building !== eachParsedMeetingTime.building ? buildingUpdate.building : '' : '';



                            const roomUpdate = eachParsedMeetingTime.RoomUpdates?.find((change: { dateOfChange: Date; room: string; }) =>
                                new Date(change.dateOfChange).getDate() === stripTime(todayDate).getDate() && change.room !== 'None'
                            );
                            const changedRoom = roomUpdate ? roomUpdate.room !== eachParsedMeetingTime.room ? roomUpdate.room : '' : '';


                            const todaysCourse: TodaysCourseDataType = {
                                Title: eachCourse.Title,
                                CRN: eachCourse.CRN,
                                ScheduleType: eachCourse.ScheduleType,
                                Section: eachCourse.Section,
                                CourseNumber: eachCourse.CourseNumber,
                                Campus: eachCourse.Campus,
                                SubjectDescription: eachCourse.SubjectDescription,
                                Hours: eachCourse.Hours,
                                IndexInDirectory: eachCourse.IndexInDirectory,
                                PrimaryInstructor: eachCourse.PrimaryInstructor,
                                PrimaryInstructor_url: eachCourse.PrimaryInstructor_url,
                                meeting: eachParsedMeetingTime,
                                isTransparent: isTransparent,
                                meetingIndex: eachCourse.parsedMeetingTimes.indexOf(eachParsedMeetingTime),
                                note: note,
                                changedBuilding: changedBuilding,
                                changedRoom: changedRoom,
                            }

                            todaysCoursesArray.push(todaysCourse);
                        }
                    }
                }

            }
        }

    }

    return todaysCoursesArray;

}

async function findClubsForTheDay(dayNumber: number): Promise<TodaysClubDataType[]> {

    const clubs = await GETmyAcceptedClubs();
    if(clubs == null){
        return [];
    }
    const todaysClubsArray: TodaysClubDataType[] = []; //to be filled
    const todayDate = stripTime(new Date());
    todayDate.setDate(todayDate.getDate() + dayNumber - 1);
    const todayDay = todayDate.toLocaleDateString('en-US', { weekday: 'long' });

    for (const eachClub of clubs) {
        if (eachClub.meeting?.exists) {
            

            const startDate = stripTime(new Date(eachClub.meeting.startDate));
            const endDate = stripTime(new Date(eachClub.meeting.endDate));
        
            if (todayDate >= startDate && todayDate <= endDate) {
                if (eachClub.meeting.days[0].includes(todayDay)) {

                    const todaysClub: TodaysClubDataType = {
                        name: eachClub.name,
                        members: eachClub.members,
                        index: eachClub.index,
                        meeting: {
                            hasMeeting: eachClub.meeting.exists,
                            building: eachClub.meeting.building,
                            room: eachClub.meeting.room,
                            startDate: eachClub.meeting.startDate,
                            endDate: eachClub.meeting.endDate,
                            days: eachClub.meeting.days,
                            startTime: eachClub.meeting.startTime,
                            endTime: eachClub.meeting.endTime,
                            note: eachClub.meeting.note,
                            senderEmail: eachClub.meeting.senderEmail,
                            senderName: eachClub.meeting.senderName,
                        }
                    }

                    todaysClubsArray.push(todaysClub);
                }
            }
        }

    }

    return todaysClubsArray;
}

function sortClubsByStartTime(clubs: TodaysClubDataType[]) {
    const clubsCopy = clubs;
    clubsCopy.sort((a, b) => {
        const aStartTime = a.meeting.startTime;
        const bStartTime = b.meeting.startTime;
        return aStartTime - bStartTime;
    });
    return clubsCopy;
}

function sortCoursesByStartTime(courses: TodaysCourseDataType[]) {
    const coursesCopy = courses;
    coursesCopy.sort((a, b) => {
        const aStartTime = a.meeting.startTime;
        const bStartTime = b.meeting.startTime;
        return aStartTime - bStartTime;
    });
    return coursesCopy;
}

