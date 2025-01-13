import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import InputFields from '../custom-components/faculty-course-selection-components/FacultyInputFields';
import NextPressable from '../custom-components/faculty-course-selection-components/FacultyNextPressable';
import { updateCourseInRealtimeDatabase, addInstructorToFirestore } from '../custom-utils/service-functions/FirebaseFunctions';
import { GETUserEmail, GETUserGivenName, GETUserFamilyName, SETmyCoursesArray } from '../custom-utils/helper-functions/GetSetFunctions';
import { SETdoesUserHaveCourses } from '../custom-utils/helper-functions/GetSetFunctions';
import { CourseDataType } from '../custom-utils/interfaces/CourseInterfaces';
import { router } from 'expo-router';
import { extractPrimaryInstructorFromLongString, parseMeetingTimes, binarySearchCourseInDirectory } from '../custom-utils/helper-functions/CoursesHelperFunctions';
import Modal from 'react-native-modal';

const COURSES_DIRECTORY_PATH:string = '../local-data/RawCourseData.json'


export default function SelectCoursesForFaculty() {

    const [selectedCRNs, setSelectedCRNs] = useState<number[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const coursesDirectoryLocal = useRef<CourseDataType[]>([]);


    useEffect(() => {

        addInstructorToFirestore();
        coursesDirectoryLocal.current = require(`${COURSES_DIRECTORY_PATH}`).CoursesDirectory as CourseDataType[];
        getCoursesWithUserEmailAsPrimaryInstructor(coursesDirectoryLocal.current).then((matchedCourses) => { //matchedCourses is complete object i.e. CourseDataType all properties filled
            setSelectedCRNs(matchedCourses.map((course) => course.CRN));
            setIsLoading(false);
        });


    }, []);

    function newCRNAdded(crn: number, index: number) {
        //add the crn to the selectedCRNs array
        const temp = [...selectedCRNs];
        temp[index] = crn;
        setSelectedCRNs(temp);
    }

    function deleteCRN(index: number) {
        const temp = [...selectedCRNs];
        temp[index] = -1;
        setSelectedCRNs(temp);
    }

    async function handleNextPress() {

        const temp = selectedCRNs.filter((crn) => crn !== -1); 
        setSelectedCRNs(temp);

        const fetchCourses = async () => {

            /**
            
            Two ways either fetch from real time db or from local json

            Way 1: Fetch from real time db (this is faster, because pointing to the element and keeps the users updates)
            const myCoursesArray: CourseDataType[] = await Promise.all(
                selectedCRNs.map(async (crn) => {
                    const course = await getCourseFromRealTimeDb(crn);
                    return course ? { ...course, CRN: crn } : null;
                })
            ).then(courses => courses.filter(course => course !== null));


            USING THIS ONE
            Way 2: Fetch from local json (this is not fun because of the local file that we have to keep updated, but cheaper because of local storage)  **/

            const myCoursesArray = temp.map(crn => binarySearchCourseInDirectory(crn, coursesDirectoryLocal.current)) as CourseDataType[];

            update_myCoursesArray_And_RealtimeDatabase(myCoursesArray).then(() => {
                SETdoesUserHaveCourses(true);
                router.replace('./(tabs)/1');
            });
        };

        await fetchCourses();
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', bottom: 30, paddingHorizontal: '10%' }}>
                        <Text style={styles.headerText}>YOUR COURSES</Text>
                    </View>
                    <InputFields selectedCRNs={selectedCRNs} addNewCRN={newCRNAdded} deleteCRN={deleteCRN} />
                    <NextPressable isNextButtonEnabled={true} handleNextPress={()=>{}} customStyles={styles.nextButtonPosition} />
            </SafeAreaView>
        );
    }

    else {

        return (
            <SafeAreaView style={styles.container}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', bottom: 30, paddingHorizontal: '10%' }}>
                        <Text style={styles.headerText}>YOUR COURSES</Text>
                    </View>
                    <InputFields selectedCRNs={selectedCRNs} addNewCRN={newCRNAdded} deleteCRN={deleteCRN} />
                    <NextPressable isNextButtonEnabled={true} handleNextPress={handleNextPress} customStyles={styles.nextButtonPosition} />
            </SafeAreaView>
        );

    }

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0,
        backgroundColor: '#1c1c1c',
    },
    headerText: {
        color: 'white',
        fontSize: 35,
        fontWeight: '500',
    },
    nextButtonPosition: {
        marginTop: 20
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        height: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    closeButton: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 5,
        alignSelf: 'stretch',
        alignItems: 'center',
        marginTop: 20,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

async function getCoursesWithUserEmailAsPrimaryInstructor(coursesDirectory: CourseDataType[]): Promise<CourseDataType[]> {

    const matchedCourses: CourseDataType[] = [];
    const usersEmail = await GETUserEmail();

    //for each course we check if the users email is in instructors array if yes
    //we take the name and check if that name is the primary instructor in the long string

    if (coursesDirectory?.length > 0) { //if courses directory is not empty
        for (const eachCourse of coursesDirectory) { //For each course in the directory

            if (eachCourse.Instructors) { //if the course has instructors array
                for (const eachInstructor of eachCourse.Instructors) { //For each Instructor in the Instructors array

                    if (removeMailto(eachInstructor.url) === usersEmail) { //if any email matches that of user's email

                        //email found; now check if primary instructor
                        if (isInstructorPrimary(eachCourse.InstructorsNamesWithPrimary, eachInstructor.name)) { //if the course has the user as the primary instructor
                            eachCourse.PrimaryInstructor = eachInstructor.name;
                            eachCourse.PrimaryInstructor_url = eachInstructor.url;
                            if (!eachCourse.parsedMeetingTimes) {
                                eachCourse.parsedMeetingTimes = [];
                                parseMeetingTimes(eachCourse);
                            }
                            matchedCourses.push(eachCourse); //add the course to the matched courses
                        }

                    }
                }
            }
        }

    }

    return matchedCourses;
}

function removeMailto(email: string): string {
    return email.replace('mailto:', '');
}

function isInstructorPrimary(InstructorsNamesWithPrimary: string, usersName: string): boolean {
    //email found; now check if primary instructor
    if (InstructorsNamesWithPrimary && InstructorsNamesWithPrimary.length > 0) { //if the string is not empty

        //extract the primary instructor's name from the long string
        const primaryInstructorName = extractPrimaryInstructorFromLongString(InstructorsNamesWithPrimary);

        //if the primary instructor exists
        if (primaryInstructorName == usersName) {
            return true;
        }
        else {
            console.log('SelectCoursesForFaculty/isInstructorPrimary - No primary instructor found');
            return false;
        }
    }
    console.log('SelectCoursesForFaculty/isInstructorPrimary - No instructors found');
    return false;
}


async function update_myCoursesArray_And_RealtimeDatabase(myCoursesArray: CourseDataType[]) {

    for (const course of myCoursesArray) {
        const usersEmail = await GETUserEmail();
        const usersGivenName = await GETUserGivenName();
        const usersFamilyName = await GETUserFamilyName();

        //Currently when the instructor signs in again their previous updates are vanished
        //to maintain the updates uncomment the line below
        // const courseFromDb = await getCourseFromRealtimeDatabase(course.IndexInDirectory); 

        //Local Update
        if (!course.PrimaryInstructor || course.PrimaryInstructor === '') {
            course.PrimaryInstructor = usersGivenName + ' ' + usersFamilyName;
        }
        if (!course.PrimaryInstructor_url || course.PrimaryInstructor_url == '') {
            course.PrimaryInstructor_url = usersEmail;
        }
        parseMeetingTimes(course);

        //Realtime Database Update
        updateCourseInRealtimeDatabase(course.CRN, course);
    }

    //saving local update
    await SETmyCoursesArray(myCoursesArray);


}