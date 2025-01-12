import { CourseDataType } from "../interfaces/CourseInterfaces";


/**
 * 
 * @param crn 
 * @param coursesDirectory coursesDirectory array with all the courses
 * @returns either returns the found course or null
 */
export function binarySearchCourseInDirectory(crn: number, coursesDirectory: CourseDataType[]): CourseDataType | null {
    
    let up = 0;
    let down = coursesDirectory.length - 1;
    let mid: number;

    while (up <= down) {
        mid = Math.floor((up + down) / 2);
        let centerCourse = coursesDirectory[mid];

        if (Number(centerCourse.CRN) === Number(crn)) {
            return centerCourse;
        } else if (Number(crn) > Number(centerCourse.CRN)) {
            up = mid + 1;
        } else {
            down = mid - 1;
        }
    }

    return null;
}

//Helper function to extract the primary instructor from the long instructors string
export function extractPrimaryInstructorFromLongString(instructors: string): string | null {
    if (!instructors.includes('(Primary)')) {
        return null;
    }
    const primaryInstructorMatch = instructors.match(/([^\n]+)\s*\(Primary\)/);
    return primaryInstructorMatch ? primaryInstructorMatch[1].trim() : null;
}

//Helper function to parse the meeting times of a course
//note: a meetingTimeObject only hasMeeting = true when atleast days and start end date are given i.e. doesn't matter if time is missing
export function parseMeetingTimes(course: CourseDataType) {
    course.parsedMeetingTimes = [];
    for (const meeting of course.MeetingTimes) { //a meeting is a horizontal strip in calendar

        const meetingInfo = meeting.name; // word "name" doesn't mean anything, it's just the key which contains the meeting info object in scraped data

        // Parse start and end dates
        const startDateMatch = meetingInfo.match(/Start Date: (\d{2}\/\d{2}\/\d{4})/);
        const endDateMatch = meetingInfo.match(/End Date: (\d{2}\/\d{2}\/\d{4})/);
        if (!startDateMatch || !endDateMatch) { //if start or end date not found, then no meeting
            console.log(`No start or end date found for meeting for ${course.Title} [${course.CRN}]`);
            course.parsedMeetingTimes.push({
                hasMeeting: false,
                startDate: new Date(0),
                endDate: new Date(0),
                days: [],
                startTime: 0,
                endTime: 0,
                building: '',
                room: '',
                ClassStatusChanges: [],
                BuildingUpdates: [],
                RoomUpdates: [],
                NoteUpdates: []
            }); //everything after hasMeeting is arbitrary
            continue;
        }
        const startDate = parseDate(startDateMatch[1]);
        const endDate = parseDate(endDateMatch[1]);


        // Parse days of the week
        const daysMatch = meetingInfo.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/g);
        if (!daysMatch) { //if no days found, then no meeting
            console.log(`Time found but no days found for meeting for ${course.Title} [${course.CRN}]`);
            course.parsedMeetingTimes.push({
                hasMeeting: false,
                startDate,
                endDate,
                days: [],
                startTime: 0,
                endTime: 0,
                building: '',
                room: '',
                ClassStatusChanges: [],
                BuildingUpdates: [],
                RoomUpdates: [],
                NoteUpdates: []
            }); //everything after hasMeeting is arbitrary
            continue;
        }

        // Parse time interval
        const TimeInterval = meetingInfo.match(/(((\d{1}|\d{2}):\d{2} (AM|PM)) - ((\d{1}|\d{2}):\d{2} (AM|PM)))/);
        if (!TimeInterval) { //if no time interval found, then no meeting
            console.log(`Days and Date found but no time interval found for meeting for ${course.Title} [${course.CRN}]`);
            //alert(`No time interval found for meeting for ${course.Title}`);
            course.parsedMeetingTimes.push({
                hasMeeting: false,
                startDate,
                endDate,
                days: daysMatch,
                startTime: 9999,
                endTime: 9999,
                building: '',
                room: '',
                ClassStatusChanges: [],
                BuildingUpdates: [],
                RoomUpdates: [],
                NoteUpdates: []
            });
            continue;
        }
        const startTime = convertTo24HourFormat(TimeInterval[2]);
        const endTime = convertTo24HourFormat(TimeInterval[5]);


        // Parse building and room
        const buildingMatch = (meetingInfo.match(/Building: (.*?) Room:/));
        const roomMatch = meetingInfo.match(/Room: (.*?) Start Date:/);


        // Parsing completed for this meeting, push to parsedMeetingTimes
        course.parsedMeetingTimes.push({
            hasMeeting: true,
            startDate,
            endDate,
            days: daysMatch,
            startTime: startTime,
            endTime: endTime,
            building: buildingMatch ? buildingMatch[1].toLowerCase() : '',
            room: roomMatch ? roomMatch[1].toLowerCase() : '',
            ClassStatusChanges: [],
            BuildingUpdates: [],
            RoomUpdates: [],
            NoteUpdates: []
        });
    }

}

//Converts 4 Character time string to 12-hour format am/pm time string
export function convertToAmPm(time: string) {
    if (time === '9999') return 'No Meeting Times';
    // Ensure the time string is always 4 characters long e.g. 900 -> 0900
    const paddedTime = time.padStart(4, '0');
  
    const hours = parseInt(paddedTime.substring(0, 2), 10);
    const minutes = paddedTime.substring(2);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    const paddedHours = adjustedHours.toString().padStart(2, '0');
    const paddedMinutes = minutes.padStart(2, '0');
    return `${paddedHours}:${paddedMinutes} ${ampm}`;
};





// Local function to parse a date string into a Date object
function parseDate(dateString: string): Date {
    const [month, day, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day); //month is 0 indexed
}

// Local function to convert 12-hour string time format to 24-hour format number
function convertTo24HourFormat(time: string): number {

    const [timePart, period] = time.split(' '); //split into time and period
    let [hours, minutes] = timePart.split(':').map(part => parseInt(part, 10)); //split into hours and minutes

    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    return hours * 100 + minutes; // Return time in HHMM format
}
