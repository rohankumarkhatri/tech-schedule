
export interface TodaysClubDataType {
    name: string;
    members: string[];
    index: number;


    meeting: {
        hasMeeting: boolean;
        building: string;
        room: string;
        startDate: Date;
        endDate: Date;
        days: string[];
        startTime: number; //HHMM [24 hour format] ex: 1330 = 1:30 PM
        endTime: number; //HHMM [24 hour format] ex: 1330 = 1:30 PM
        note: string;
        senderEmail: string;
        senderName: string;
    };
}

export interface ClubDataType {
    name: string;
    members: string[];
    index: number;

    meeting: { //one object is a horizontal line on the week at a specific time
        exists: boolean;
        building: string;
        room: string;
        startDate: Date;
        endDate: Date;
        days: string[];
        startTime: number; //HHMM [24 hour format] ex: 1330 = 1:30 PM
        endTime: number; //HHMM [24 hour format] ex: 1330 = 1:30 PM
        note: string;
        senderEmail: string;
        senderName: string;
    };

}
