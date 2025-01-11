import { View, Text, TextInput, StyleSheet } from 'react-native';
import CourseTitle from './CourseTitle';
import { useState, useRef, useEffect } from 'react';
import { CourseDataType } from '../../utils/Interfaces/CustomDataTypes';
import { getCourseFromRealTimeDb } from '../../utils/services/firebaseFunctions';

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

    //initialize textFields with already selectedCRNs and set courseTitles for them
    useEffect(() => {

        // setTextFields([]);
        // setCourseTitles([]);

        // if (selectedCRNs && selectedCRNs.length > 0) {

        //     for (const crn of selectedCRNs) {

        //         getCourseFromRealTimeDb(crn).then((course) => {
        //             setTextFields(prevTextFields => [...prevTextFields, crn.toString()]);
        //             setCourseTitles(prevTitles => [...prevTitles, course.SubjectDescription + " " + course.CourseNumber + " " + course.ScheduleType]);
        //         });
        //     }

        //     // Add an empty field at the end
        //     setTextFields(prevTextFields => [...prevTextFields, '']);

        // } else {
        //     // If no selected CRNs, initialize with empty fields
        //     setTextFields(['', '', '', '']);
        // }

        let tempTextFields: string[] = [];
        let tempCourseTitles: string[] = [];

        if (selectedCRNs && selectedCRNs.length > 0) {

            for (let i = 0; i < selectedCRNs.length; i++) {

                getCourseFromRealTimeDb(selectedCRNs[i]).then((course) => {
                    tempTextFields[i] = selectedCRNs[i].toString();
                    tempCourseTitles[i] = course.SubjectDescription + " " + course.CourseNumber + " " + course.ScheduleType;
                    setTextFields([...tempTextFields, '']);
                    setCourseTitles(tempCourseTitles);
                });
            }

        } else {
            // If no selected CRNs, initialize with empty fields
            tempTextFields = ['', '', '', ''];
            setTextFields(tempTextFields);
            setCourseTitles(tempCourseTitles);
        }

        setTextFields(tempTextFields);
        setCourseTitles(tempCourseTitles);

    }, [ ]);

    //when the user has entered a CRN turn it into the appropriate course title
    async function handleTextChanged(textInField: string, index: number) {

        if (/^\d*$/.test(textInField)) { //make sure text is a number


            const tempTextFields = [...textFields];
            tempTextFields[index] = textInField;
            setTextFields(tempTextFields);

            if (textInField.length === 5) { //if CRN Complete: 1. add title, 2. check if last, 3. shift focus

                if (selectedCRNs.includes(Number(textInField))) { //if course is already selected
                    alert("Course already selected!");
                    return;
                }

                const crn = Number(textInField);

                const course = await getCourseFromRealTimeDb(crn);

                if (course && course !== null) { //1. Adding Title

                    const tempTitles = [...courseTitles];
                    tempTitles[index] = course.SubjectDescription + " " + course.CourseNumber + " " + course.ScheduleType;
                    setCourseTitles(tempTitles);
                    console.log(courseTitles);

                    if (index === textFields.length - 1 && textFields.length < MAX_CRNS) { //2. Check if last field, if so add new empty field
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

                    if (inputRefs.current[index + 1]) { //3. Focusing on next input field
                        inputRefs.current[index + 1].focus();
                    }

                    addNewCRN(crn, index);

                }
                else { //if course is not found set title to empty and alert user

                    const tempTitles = [...courseTitles];
                    tempTitles[index] = '';
                    setCourseTitles(tempTitles);

                    tempTextFields[index] = '';
                    setTextFields(tempTextFields);
                    inputRefs.current[index].clear();

                    alert("Course not found");
                    return;
                }

            }
        }
    }


    function handleDelete(index: number) {
        //const temp = [...textFields];
        // temp[index] = '';
        // setTextFields(temp); 

        const tempTitles = [...courseTitles];
        tempTitles[index] = '';
        setCourseTitles(tempTitles);

        deleteCRN(index);
    }


    return (
        <View style={{ marginBottom: 130 }}>
            {textFields.length > 0 && textFields.map((eachTextField, index) => (
                <View key={index} >
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
                                defaultValue={eachTextField}
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
        opacity: 0.85
    },
    screenrollViewContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0
    },
});


export default InputFields;

