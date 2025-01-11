export interface CourseDataType {

    Title: string;

    CRN: number;

    ScheduleType: string;

    MeetingTimes: {
        name: string; // A single meeting time object is a horizontal line on the week at a specific time
    }[];

    Section: string;

    CourseNumber: string;

    Campus: string;

    SubjectDescription: string;

    Hours: string;

    InstructorsNamesWithPrimary: string; //Empty string if no instructors

    Instructors: { //No array if no instructors
        name: string;
        url: string;
    }[];


    //Properties below are custom (i.e. not found in original scraped data) and are only added (or updated) in realtime database when a instructor makes a change

    PrimaryInstructor_url: string;
    PrimaryInstructor: string;

    parsedMeetingTimes: { //one object is a horizontal "line" on the week at a specific time. 
                          //The line can be copied to multiple weeks by start and end dates. The days will be the same for all weeks. 
                          //for example if some class is on alternate weeks, then they will need separate ilne for each week.
        hasMeeting: boolean;
        building: string;
        room: string;
        startDate: Date;
        endDate: Date;
        days: string[];
        startTime: number; //HHMM [24 hour format] ex: 1330 = 1:30 PM
        endTime: number; //HHMM [24 hour format] ex: 1330 = 1:30 PM

        //These arrays are for the changes for the whole week. Changes with the date less than or equal to current date are overwritten
        ClassStatusChanges: {
            dateOfChange: Date;
            isOn: boolean;
        }[];
        BuildingUpdates: {
            dateOfChange: Date;
            building: string;
        }[];
        RoomUpdates: {
            dateOfChange: Date;
            room: string;
        }[];
        NoteUpdates: {
            dateOfChange: Date;
            note: string;
        }[];
    }[];

};

/**
 * This interface is one slot/rectangle on the week view i.e. if a course has two meetings a day, there will be two of these slots/rectangle
 */
export interface TodaysCourseDataType {
    
    Title: string;

    CRN: number;

    ScheduleType: string;

    Section: string;

    CourseNumber: string;

    Campus: string;

    SubjectDescription: string;

    Hours: string;

    IndexInDirectory: number;

    PrimaryInstructor_url: string;

    PrimaryInstructor: string;
    
    //properites till above are the same as CourseDataType

    //properties below are specific to todaysCourseDataType
    meeting: { 
        hasMeeting: boolean;
        building: string;
        room: string;
        startDate: Date;
        endDate: Date;
        days: string[];
        startTime: number; //HHMM [24 hour format] ex: 1330 = 1:30 PM
        endTime: number; //HHMM [24 hour format] ex: 1330 = 1:30 PM
    };
    note: string;
    isTransparent: boolean;
    changedBuilding: string;
    changedRoom: string;
    meetingIndex: number;

}