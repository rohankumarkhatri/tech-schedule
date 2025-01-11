import { Pressable, StyleSheet } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

interface NextPressableProps {
    isNextButtonEnabled: boolean;
    handleNextPress: () => void;
    customStyles?: any;
}

const NextPressable = ({isNextButtonEnabled, handleNextPress, customStyles}: NextPressableProps) => {
    return (
        <Pressable
            style={[customStyles, styles.nextButton, isNextButtonEnabled ? styles.nextButtonEnabled : styles.nextButtonDisabled]}
            onPress={handleNextPress}
            disabled={!isNextButtonEnabled}
        >
            <Ionicons name="arrow-forward" size={30} color="white" />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    nextButton: {
        backgroundColor: 'transparent',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        width: '30%',
    },
    nextButtonEnabled: {
        opacity: 1,
    },
    nextButtonDisabled: {
        opacity: 0.5,
    },
});


export default NextPressable;

