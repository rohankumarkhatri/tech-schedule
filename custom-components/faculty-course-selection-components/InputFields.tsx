import { View, TextInput, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import CourseTitle from './CourseTitle';
import { useState, useRef, useEffect } from 'react';
import { CourseDataType } from '@/utils/Interfaces/CustomDataTypes';
import { getCourseFromRealTimeDb } from '@/utils/services/firebaseFunctions';
import { GETUserEmail } from '@/utils/helper-functions/GetSet_UserInfo';

export const MAX_CRNS = 10;

interface InputFieldsProps {

    addNewCRN: (crn: number, index: number) => void;
    deleteCRN: (index: number) => void;
    selectedCRNs: number[];
}

const InputFields = ({ selectedCRNs, addNewCRN, deleteCRN }: InputFieldsProps) => {

    const [textFields, setTextFields] = useState<string[]>([]);
    const [courseTitles, setCourseTitles] = useState<string[]>([]);
    const inputRefs = useRef<TextInput[]>([]);

    //initialize textFields with selectedCRNs
    useEffect(() => {
        // const initializeFields = async () => {
        //     if (selectedCRNs.length > 0) {
        //         const newTextFields: string[] = [];
        //         const newCourseTitles: string[] = [];

        //         for (const crn of selectedCRNs) {
        //             try {
        //                 const course = await getCourseFromRealTimeDb(crn);
        //                 newTextFields.push(crn.toString());
        //                 newCourseTitles.push(`(${course.Section}) ${course.SubjectDescription} ${course.CourseNumber} ${course.ScheduleType}`);
        //             } catch (error) {
        //                 console.error('Error fetching course:', error);
        //             }
        //         }

        //         // Add an empty field at the end
        //         newTextFields.push('');

        //         setTextFields(newTextFields);
        //         setCourseTitles(newCourseTitles);
        //     } else {
        //         // If no selected CRNs, initialize with empty fields
        //         setTextFields(['', '', '', '', '']);
        //     }

        // };

        // initializeFields();

           let tempTextFields: string[] = [];
           let tempCourseTitles: string[] = [];

           if (selectedCRNs && selectedCRNs.length > 0) {

               for (let i = 0; i < selectedCRNs.length; i++) {

                   getCourseFromRealTimeDb(selectedCRNs[i]).then((course) => {
                       tempTextFields[i] = selectedCRNs[i].toString();
                       tempCourseTitles[i] =  course.Section + " " + course.SubjectDescription + " " + course.CourseNumber + " " + course.ScheduleType;
                       setTextFields([...tempTextFields, '']);
                       setCourseTitles(tempCourseTitles);
                   });
               }

           } else {
               // If no selected CRNs, initialize with empty fields
               tempTextFields = ['', '', '', '', ''];
               setTextFields(tempTextFields);
               setCourseTitles(tempCourseTitles);
           }

           setTextFields(tempTextFields);
           setCourseTitles(tempCourseTitles);

           console.log(textFields, tempCourseTitles)

    }, []); 

    //when the user has entered a CRN turn it into the appropriate course title
    async function handleTextChanged(textInField: string, index: number) {

        if (/^\d*$/.test(textInField)) { //make sure text is a number

            const temp = [...textFields];
            temp[index] = textInField;
            setTextFields(temp);

            if (textInField.length == 5) { //if CRN Complete: add title, check if last, shift focus

                if (selectedCRNs.includes(Number(textInField))) { //if course is already selected
                    alert("Course already selected!");
                    return;
                }
                const crn = Number(textInField);
                const course = await getCourseFromRealTimeDb(crn);

                if (course && course !== null) { //if course is found 

                    if ((course.InstructorsNamesWithPrimary === '' && !course.PrimaryInstructor)) { //if course has no instructors

                        const tempTitles = [...courseTitles];
                        tempTitles[index] = "(" + course.Section + ") " + course.SubjectDescription + " " + course.CourseNumber + " " + course.ScheduleType;
                        setCourseTitles(tempTitles);


                        if (index === textFields.length - 1 && textFields.length < MAX_CRNS) { //if it is the last input field then push new empty field
                            const temp = [...textFields];
                            temp.push('');
                            setTextFields(temp);

                            // Use a timeout to ensure the new input field is rendered before focusing
                            setTimeout(() => {
                                if (inputRefs.current[textFields.length]) {
                                    inputRefs.current[textFields.length].focus();
                                }
                            }, 100);
                        }

                        if (inputRefs.current[index + 1]) { //if next input field exists, focus on it
                            inputRefs.current[index + 1].focus();
                        }

                        addNewCRN(crn, index);

                    }
                    else {
                        const usersEmail = await GETUserEmail();
                        if (course.PrimaryInstructor_url && course.PrimaryInstructor_url !== usersEmail) {
                            const tempTitles = [...courseTitles];
                            tempTitles[index] = "(" + course.Section + ") " + course.SubjectDescription + " " + course.CourseNumber + " " + course.ScheduleType;
                            setCourseTitles(tempTitles);


                            if (index === textFields.length - 1 && textFields.length < MAX_CRNS) { //if it is the last input field then push new empty field
                                const temp = [...textFields];
                                temp.push('');
                                setTextFields(temp);

                                // Use a timeout to ensure the new input field is rendered before focusing
                                setTimeout(() => {
                                    if (inputRefs.current[textFields.length]) {
                                        inputRefs.current[textFields.length].focus();
                                    }
                                }, 100);
                            }

                            if (inputRefs.current[index + 1]) { //if next input field exists, focus on it
                                inputRefs.current[index + 1].focus();
                            }

                            addNewCRN(crn, index);
                        }
                        else {

                            const tempTitles = [...courseTitles];
                            tempTitles[index] = '';
                            setCourseTitles(tempTitles);

                            temp[index] = '';
                            setTextFields(temp);
                            inputRefs.current[index].clear();

                            alert("Course already has instructor(s)!\nPrimary Instructor: " + course.PrimaryInstructor);
                        }

                    }


                }
                else { //if course is not found set title to empty and alert user

                    const tempTitles = [...courseTitles];
                    tempTitles[index] = '';
                    setCourseTitles(tempTitles);

                    temp[index] = '';
                    setTextFields(temp);
                    inputRefs.current[index].clear();

                    alert("Course not found!");

                }

            }
        }
    }


    function handleDelete(index: number) {
        // const temp = [...textFields];
        // temp[index] = '';
        // setTextFields(temp);

        const tempTitles = [...courseTitles];
        tempTitles[index] = '';
        setCourseTitles(tempTitles);

        deleteCRN(index);
    }


    return (
        <View style={{ height: '45%' }}>
            <ScrollView>
                {textFields.map((eachTextField, index) => (
                    <View key={index} style={styles.fieldsContainer}>
                        {courseTitles[index] !== '' && courseTitles[index] ?
                            (
                                <CourseTitle
                                    key={index}
                                    index={index}
                                    courseTitle={courseTitles[index]}
                                    handleDelete={handleDelete}
                                />
                            )
                            :
                            (
                                <TextInput
                                    key={index}
                                    ref={(refToTextInputElement) => (inputRefs.current[index] = refToTextInputElement as TextInput)}
                                    value={eachTextField}
                                    placeholder='Enter CRN (5 digits)'
                                    placeholderTextColor='gray'
                                    keyboardType="numeric"
                                    maxLength={5}
                                    onChangeText={(text) => {
                                        handleTextChanged(text, index);
                                    }}
                                    style={styles.fieldTextInput}
                                />
                            )
                        }
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fieldTextInput: {
        borderWidth: 1,
        borderColor: 'gray',
        color: 'white',
        padding: 10,
        margin: 10,
        borderRadius: 5,
        width: 330,
        backgroundColor: '#262626', // Added background color for better visibility
        opacity: 0.9
    },
    fieldsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
    },

});


export default InputFields;

