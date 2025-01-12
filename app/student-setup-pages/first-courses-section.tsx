import { COURSES_DIRECTORY_PATH } from '@/constants/ProjectConstants';
import InputFields from '@/custom-components/student-course-selection-components/StudentInputFields';
import NextPressable from '@/custom-components/student-course-selection-components/StudentNextPressable';
import { binarySearchCourseInDirectory } from '@/custom-utils/helper-functions/CoursesHelperFunctions';
import { GETdoesUserHaveCourses, GETmyCoursesArray, SETdoesUserHaveCourses, SETmyCoursesArray } from '@/custom-utils/helper-functions/GetSetFunctions';
import { CourseDataType } from '@/custom-utils/interfaces/CourseInterfaces';
import { fetchStudentDocumentFromFirestore, updateStudentInFirestore } from '@/custom-utils/service-functions/FirebaseFunctions';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, SafeAreaView, Pressable } from 'react-native';
import Modal from "react-native-modal";


interface props {
    onPress: () => void;
}

const FirstCoursesSection: React.FC<props> = ({ onPress }) => {

    //This will have the CRNs of the courses that user has on THIS page.
    //That can either be fetched CRNs or after updating the list by the user. But it is the live list of CRNs user has as THEY want. The deleted ones will be -1. 

    const [selectedCRNs, setSelectedCRNs] = useState<number[]>([]);
    const [isHelpCRNModalVisible, setIsHelpCRNModalVisible] = useState(false);
    const coursesDirectoryLocal = useRef<CourseDataType[]>([]);

    const [isLoading, setIsLoading] = useState(true);



    // On start: Fetch the courses directory (from local json file; it is to be changed to firebase later when one can afford) and CRNs from firestore
    useEffect(() => {

        const checkAndFetchCourses = async () => {

            try {
                const hasCourses = await GETdoesUserHaveCourses();
                console.log(hasCourses);
                if (hasCourses) {
                    const myCoursesArray = await GETmyCoursesArray();
                    setSelectedCRNs(myCoursesArray.map((course: CourseDataType) => course.CRN));
                    setIsLoading(false);
                } else {
                    console.log('no courses');
                    fetchStudentDocumentFromFirestore().then((studentDocument: any) => {
                        if (studentDocument.crns) {
                            setSelectedCRNs(studentDocument.crns);
                            setIsLoading(false);
                        } else {
                            setSelectedCRNs([]); // If the user is new, set the selectedCRNs to an empty array
                            setIsLoading(false);
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching courses or student document:', error);
            }
        };

        coursesDirectoryLocal.current = require(COURSES_DIRECTORY_PATH).CoursesDirectory as CourseDataType[]; 
        checkAndFetchCourses();

    }, []);


    const toggleCRNInfoModal = () => {
        setIsHelpCRNModalVisible(!isHelpCRNModalVisible);
    };

    function newCRNAdded(crn: number, index: number) {
        //add the crn to the selectedCRNs array
        const temp = [...selectedCRNs];
        temp[index] = crn;
        setSelectedCRNs(temp);

    }

    function deleteCRN(index: number) {
        //remove the crn from the selectedCRNs array
        const temp = [...selectedCRNs];
        temp[index] = -1;
        setSelectedCRNs(temp);

    }

    function handleNextPress() { //filter the selectedCRNs

        if (!selectedCRNs || selectedCRNs.length <= 0) {
            SETmyCoursesArray([]).then(() => {
                updateStudentInFirestore(selectedCRNs, 'crns');
                SETdoesUserHaveCourses(true);
                return;
            });
        }

        const temp = selectedCRNs.filter((crn) => crn !== -1);

        const myCoursesArray = temp.map(crn => binarySearchCourseInDirectory(crn, coursesDirectoryLocal.current));

        SETmyCoursesArray(myCoursesArray as CourseDataType[]).then(() => {
            updateStudentInFirestore(temp, 'crns');
            SETdoesUserHaveCourses(true);
            // router.replace('/(tabs)/1');
            return;

        });

    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', bottom: 30, paddingHorizontal: '10%' }}>
                        <Text style={styles.headerText}>ENTER YOUR CRNs</Text>
                        <Pressable style={{ position: 'absolute', right: 2, width: 130, height: 50, backgroundColor: 'transparent' }} onPress={toggleCRNInfoModal} />
                    </View>
                    <InputFields selectedCRNs={selectedCRNs} addNewCRN={newCRNAdded} deleteCRN={deleteCRN} />
                    <NextPressable isNextButtonEnabled={true} handleNextPress={() => { handleNextPress(); onPress(); }} customStyles={styles.nextButtonPosition} />
                </>

            </SafeAreaView>
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', bottom: 30, paddingHorizontal: '10%' }}>
                    <Text style={styles.headerText}>ENTER YOUR CRNs</Text>
                    <Pressable style={{ position: 'absolute', right: 2, width: 130, height: 50, backgroundColor: 'transparent' }} onPress={toggleCRNInfoModal} />
                </View>
                <InputFields selectedCRNs={selectedCRNs} addNewCRN={newCRNAdded} deleteCRN={deleteCRN} />
                <NextPressable isNextButtonEnabled={true} handleNextPress={() => { handleNextPress(); onPress(); }} customStyles={styles.nextButtonPosition} />
            </>




            {/* Info Modal */}
            <Modal
                isVisible={isHelpCRNModalVisible}
                animationIn="fadeIn"
                animationOut="fadeOut"
                onBackdropPress={toggleCRNInfoModal}
                style={{ justifyContent: 'center', alignItems: 'center', margin: 0 }}
                backdropOpacity={0.3}
                hideModalContentWhileAnimating={true}
            >

                <View style={{ padding: 16, backgroundColor: 'white', borderRadius: 10, height: 260, width: 290, overflow: 'hidden' }}>

                    <Text style={{ textAlign: 'center', marginVertical: 25 }}>
                        CRN stands for Course Reference Number. It is a unique identifier for a class.
                        It is NOT the Course Number (i.e. 1301) but a five digit number you used to register for your course (something like 29511).
                        You can find it in visual schedule builder in the bottom right or from where you registered for your courses in raiderlink.
                    </Text>

                </View>

            </Modal>
        </SafeAreaView>
    );
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
        position: 'absolute',
        bottom: 100,
    },

    modalContent: {
        width: 300,
        height: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        transform: [{ rotate: '90deg' }]
    }
});

export default FirstCoursesSection;