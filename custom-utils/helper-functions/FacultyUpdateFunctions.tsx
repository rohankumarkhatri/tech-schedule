import { TodaysCourseDataType, CourseDataType } from "../interfaces/CourseInterfaces";
import { updateCourseInRealtimeDatabase } from "../service-functions/FirebaseFunctions";
import { GETmyCoursesArray, SETmyCoursesArray } from "./GetSetFunctions";


/**
 * updates class status in realtime database and local storage
 * @param todaysCourse 
 * @param isTransparent 
 */
//for faculty

export async function updateClassStatus(todaysCourse: TodaysCourseDataType, isTransparent: boolean, DAY_NUMBER: number) {

    const courses = await GETmyCoursesArray();
    const courseToUpdate = courses.find((course: CourseDataType) => course.CRN === todaysCourse.CRN);
    const meeting = courseToUpdate?.parsedMeetingTimes[todaysCourse.meetingIndex];

    const currentTabDate = new Date();
    currentTabDate.setDate(currentTabDate.getDate() + DAY_NUMBER - 1);

    const todayDate = stripTime(new Date());

    const updatedClassStatus = {
        dateOfChange: stripTime(currentTabDate),
        isOn: isTransparent
    }

    if (meeting) {

        if (meeting.ClassStatusChanges && meeting.ClassStatusChanges.length > 0) { //if there are class status changes already

            for (let i = 0; i < meeting.ClassStatusChanges.length; i++) { //loop through all class status changes

                if (new Date(meeting.ClassStatusChanges[i].dateOfChange).getDate() === currentTabDate.getDate()) { //if any status change is before or on current date
                    meeting.ClassStatusChanges[i] = updatedClassStatus; //replace it with the new status change
                }
                else if (new Date(meeting.ClassStatusChanges[i].dateOfChange).getDate() < todayDate.getDate()) {
                    meeting.ClassStatusChanges[i] = updatedClassStatus;
                }
                else if (i === meeting.ClassStatusChanges.length - 1) { //if no status change is before or on current date, push it to the end
                    meeting.ClassStatusChanges.push(updatedClassStatus);
                }

            }

        }
        else {
            meeting.ClassStatusChanges = [updatedClassStatus];
        }
    }

    await SETmyCoursesArray(courses)
    updateCourseInRealtimeDatabase(courseToUpdate.CRN, {
        parsedMeetingTimes: courseToUpdate.parsedMeetingTimes
    });
}

/**
 * updates building status in realtime database and local storage
 * @param todaysCourse 
 * @param building 
 */
//for faculty
export async function updateBuildingStatus(todaysCourse: TodaysCourseDataType, building: string, DAY_NUMBER: number) {

    const courses = await GETmyCoursesArray();
    const courseToUpdate = courses.find((course: CourseDataType) => course.CRN === todaysCourse.CRN);
    const meeting = courseToUpdate?.parsedMeetingTimes[todaysCourse.meetingIndex];

    const currentTabDate = new Date();
    currentTabDate.setDate(currentTabDate.getDate() + DAY_NUMBER - 1);

    const todayDate = stripTime(new Date());

    const updatedBuildingStatus = {
        dateOfChange: stripTime(currentTabDate),
        building: building
    }

    if (meeting) {

        if (meeting.BuildingUpdates && meeting.BuildingUpdates.length > 0) { //loop through all building updates

            for (let i = 0; i < meeting.BuildingUpdates.length; i++) {
                if (new Date(meeting.BuildingUpdates[i].dateOfChange).getDate() === currentTabDate.getDate()) { //if any update is on current date
                    meeting.BuildingUpdates[i] = updatedBuildingStatus; //replace it with the new update
                }
                else if (new Date(meeting.BuildingUpdates[i].dateOfChange).getDate() < todayDate.getDate()) { //if any update is before todays date
                    meeting.BuildingUpdates[i] = updatedBuildingStatus; //replace it with the new update
                }
                else if (i === meeting.BuildingUpdates.length - 1) { //if no update is before or on current date, push new update to the end
                    meeting.BuildingUpdates.push(updatedBuildingStatus);
                }
            }

        }
        else {
            meeting.BuildingUpdates = [updatedBuildingStatus];
        }
    }

    await SETmyCoursesArray(courses)
    updateCourseInRealtimeDatabase(courseToUpdate.CRN, {
        parsedMeetingTimes: courseToUpdate.parsedMeetingTimes
    });
}

/**
 * updates room status in realtime database and local storage
 * @param todaysCourse 
 * @param room 
 */
//for faculty
export async function updateRoomStatus(todaysCourse: TodaysCourseDataType, room: string, DAY_NUMBER: number) {

    const courses = await GETmyCoursesArray()
    const courseToUpdate = courses.find((course: CourseDataType) => course.CRN === todaysCourse.CRN);
    const meeting = courseToUpdate?.parsedMeetingTimes[todaysCourse.meetingIndex];

    const currentTabDate = new Date();
    currentTabDate.setDate(currentTabDate.getDate() + DAY_NUMBER - 1);

    const todayDate = stripTime(new Date());

    const updatedRoomStatus = {
        dateOfChange: stripTime(currentTabDate),
        room: room
    }

    if (meeting) {

        if (meeting.RoomUpdates && meeting.RoomUpdates.length > 0) { //loop through all room updates

            for (let i = 0; i < meeting.RoomUpdates.length; i++) {
                if (new Date(meeting.RoomUpdates[i].dateOfChange).getDate() === currentTabDate.getDate()) { //if any update is before on current date
                    meeting.RoomUpdates[i] = updatedRoomStatus; //replace it with the new update
                }
                else if (new Date(meeting.RoomUpdates[i].dateOfChange).getDate() < todayDate.getDate()) { //if any update is before todays date
                    meeting.RoomUpdates[i] = updatedRoomStatus; //replace it with the new update
                }
                else if (i === meeting.RoomUpdates.length - 1) { //if no update is before or on current date, push new update to the end
                    meeting.RoomUpdates.push(updatedRoomStatus);
                }
            }
        }
        else {
            meeting.RoomUpdates = [updatedRoomStatus];
        }
    }

    await SETmyCoursesArray(courses);
    updateCourseInRealtimeDatabase(courseToUpdate.CRN, {
        parsedMeetingTimes: courseToUpdate.parsedMeetingTimes
    });

}

/**
 * updates note status in realtime database and local storage
 * @param todaysCourse 
 * @param note 
 */
//for faculty
export async function updateNoteStatus(todaysCourse: TodaysCourseDataType, note: string, DAY_NUMBER: number) {
    const courses = await GETmyCoursesArray()
    const courseToUpdate = courses.find((course: CourseDataType) => course.CRN === todaysCourse.CRN);
    const meeting = courseToUpdate?.parsedMeetingTimes[todaysCourse.meetingIndex];

    const currentTabDate = new Date();
    currentTabDate.setDate(currentTabDate.getDate() + DAY_NUMBER - 1);

    const todayDate = stripTime(new Date());

    const updatedRoomStatus = {
        dateOfChange: stripTime(currentTabDate),
        note: note
    }

    if (meeting) {

        if (meeting.NoteUpdates && meeting.NoteUpdates.length > 0) { //loop through all note updates

            for (let i = 0; i < meeting.NoteUpdates.length; i++) {
                if (new Date(meeting.NoteUpdates[i].dateOfChange).getDate() === currentTabDate.getDate()) { //if any update is before on current date
                    meeting.NoteUpdates[i] = updatedRoomStatus; //replace it with the new update
                }
                else if (new Date(meeting.NoteUpdates[i].dateOfChange).getDate() < todayDate.getDate()) { //if any update is before todays date
                    meeting.NoteUpdates[i] = updatedRoomStatus; //replace it with the new update
                }
                else if (i === meeting.NoteUpdates.length - 1) { //if no update is before or on current date, push new update to the end
                    meeting.NoteUpdates.push(updatedRoomStatus);
                }
            }
        }
        else {
            meeting.NoteUpdates = [updatedRoomStatus];
        }
    }

    await SETmyCoursesArray(courses)
    updateCourseInRealtimeDatabase(courseToUpdate.CRN, {
        parsedMeetingTimes: courseToUpdate.parsedMeetingTimes
    });
}



//Local Helper Function
function stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}