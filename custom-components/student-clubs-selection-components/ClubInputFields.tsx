import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Text,
    Dimensions,
    Pressable,
    KeyboardAvoidingView,
} from 'react-native';
import ClubTitle from './ClubTitle';
import { ClubDataType } from '@/custom-utils/interfaces/ClubInterfaces';
import { Context } from '@/app/_layout';


const CLUBS_DIRECTORY_PATH: string = '@/local-data/FinalClubsDirectory.json'




export const MAX_CLUBS = 10;

interface InputFieldsProps {
    addNewClub: (club: string, index: number) => void;
    deleteClub: (index: number) => void;
    selectedClubs: string[];
}

const InputFields: React.FC<InputFieldsProps> = ({ selectedClubs, addNewClub, deleteClub }) => {

    const [textFields, setTextFields] = useState<string[]>([]);
    const [clubTitles, setClubTitles] = useState<string[]>([]);
    const [filteredClubs, setFilteredClubs] = useState<string[][]>([]);
    const [showSuggestionsOrNot, setShowSuggestionsOrNot] = useState<boolean[]>([]);
    const inputRefs = useRef<TextInput[]>([]);
    const clubsDirectoryToShowFilteredSuggestions = useRef<string[]>([]);

    useEffect(() => {
   
        setTextFields([]);
        setClubTitles([]);

        const newFilteredClubs = selectedClubs.map(() => []);
        const newShowSuggestions = selectedClubs.map(() => false);

        if (selectedClubs && selectedClubs.length > 0) {

            for (const club of selectedClubs) {
                if(club !== ''){
                    setTextFields(prevTextFields => [...prevTextFields, club]);
                    setClubTitles(prevTitles => [...prevTitles, club]);
                }
                
            }
            if(selectedClubs.length <= 4){
                for(let i = 0; i < 3-selectedClubs.length; i++){
                    setTextFields(prevTextFields => [...prevTextFields, '']);
                } 
            }
            setTextFields(prevTextFields => [...prevTextFields, '']);


        } else {
            setTextFields(['', '', '', '']);
        }


        setFilteredClubs(newFilteredClubs);
        setShowSuggestionsOrNot(newShowSuggestions);

    }, [selectedClubs]);

    useEffect(() => {
        const data = require(CLUBS_DIRECTORY_PATH);
        clubsDirectoryToShowFilteredSuggestions.current = data.org.map((club: any) => club.name);
    }, [textFields]);


    const handleTextChanged = (text: string, index: number) => {
        const newTextFields = [...textFields];
        newTextFields[index] = text;
        setTextFields(newTextFields);

        if (text.length === 0) {
            const newFilteredClubs = [...filteredClubs];
            newFilteredClubs[index] = [];
            setFilteredClubs(newFilteredClubs);

            const newShowSuggestions = [...showSuggestionsOrNot];
            newShowSuggestions[index] = false;
            setShowSuggestionsOrNot(newShowSuggestions);
            return;
        }

        const filtered = clubsDirectoryToShowFilteredSuggestions.current
            .filter((clubName: string) =>
                clubName.toLowerCase().includes(text.toLowerCase())
            )
            .slice(0, 5);

        const newFilteredClubs = [...filteredClubs];
        newFilteredClubs[index] = filtered;
        setFilteredClubs(newFilteredClubs);

        const newShowSuggestions = [...showSuggestionsOrNot];
        newShowSuggestions[index] = filtered.length > 0; // Ensure suggestions are shown only if there are results
        setShowSuggestionsOrNot(newShowSuggestions);
    };

    const handleSelectSuggestion = (suggestion: string, index: number) => {
        if (clubTitles.includes(suggestion)) {
            alert('This club is already selected.');
            return;
        }

        const newClubTitles = [...clubTitles];
        newClubTitles[index] = suggestion;
        setClubTitles(newClubTitles);

        const newTextFields = [...textFields];
        newTextFields[index] = suggestion;
        setTextFields(newTextFields);

        const newShowSuggestions = [...showSuggestionsOrNot];
        newShowSuggestions[index] = false;
        setShowSuggestionsOrNot(newShowSuggestions);

        if (textFields.length < MAX_CLUBS) {
            addNewClub(suggestion, index);
        }

        if (index === textFields.length - 1) { //2. Check if last field, if so add new empty field
            const temp = [...textFields, ''];
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


    };

    const handleDelete = (index: number) => {
        const newClubTitles = [...clubTitles];
        newClubTitles.splice(index, 1);
        setClubTitles(newClubTitles);

        const newTextFields = [...textFields];
        newTextFields.splice(index, 1);
        setTextFields(newTextFields);

        const newFilteredClubs = [...filteredClubs];
        newFilteredClubs.splice(index, 1);
        setFilteredClubs(newFilteredClubs);

        const newShowSuggestions = [...showSuggestionsOrNot];
        newShowSuggestions.splice(index, 1);
        setShowSuggestionsOrNot(newShowSuggestions);

        deleteClub(index);
    };

    return (
        <KeyboardAvoidingView style={styles.screenrollViewContainer} behavior='padding'>
            {textFields.length > 0 && textFields.map((text, index) => (
                <View key={index} style={{}}>
                    {clubTitles[index] !== '' && clubTitles[index] ?
                        (
                            <ClubTitle
                                key={index}
                                index={index}
                                clubTitle={clubTitles[index]}
                                handleDelete={handleDelete}
                            />
                        )
                        :
                        (
                            <View key={index} style={styles.inputContainer}>
                                <TextInput
                                    ref={(ref) => { inputRefs.current[index] = ref as TextInput; }}
                                    style={styles.fieldTextInput}
                                    value={text}
                                    onChangeText={(text) => handleTextChanged(text, index)}
                                    placeholder="Enter Club Name"
                                    placeholderTextColor="#aaa"
                                />
                                {showSuggestionsOrNot[index] && filteredClubs[index].length > 0 && (
                                    <View style={styles.suggestionsContainer}>
                                        <FlatList
                                            data={filteredClubs[index]}
                                            keyboardShouldPersistTaps='handled'
                                            keyExtractor={(item, idx) => idx.toString()}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    onPress={() => handleSelectSuggestion(item, index)}
                                                    style={styles.suggestionItem}
                                                >
                                                    <Text style={styles.suggestionText}>{item}</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                )}
                            </View>
                        )
                    }
                </View>
            ))}

        </KeyboardAvoidingView>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1c1c1c',
    },
    selectedClubsContainer: {
        marginTop: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    fieldTextInput: {
        borderWidth: 1,
        borderColor: 'gray',
        color: 'white',
        padding: 10,
        margin: 10,
        borderRadius: 5,
        width: 330,
        backgroundColor: '#262626', // Added background color for better visibility
        opacity: 0.6
    },
    inputContainer: {
        marginBottom: 0,
        width: '100%',
        position: 'relative', // To position suggestions absolutely
    },
    suggestionsContainer: {
        position: 'absolute',
        bottom: 50, // Adjust based on TextInput height
        left: 10,
        right: 10,
        backgroundColor: '#484848',
        borderColor: '#ccc',
        borderWidth: 0,
        borderTopWidth: 0,
        maxHeight: 150,
        zIndex: 1,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#3E3E3E',
    },
    suggestionText: {
        fontSize: 16,
        color: '#fff',
    },
    screenrollViewContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0,
        marginBottom: 100,
    },
});

export default InputFields;