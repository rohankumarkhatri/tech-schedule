import { TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

interface NextPressableProps {
    isNextButtonEnabled: boolean;
    handleNextPress: () => void;
    customStyles?: any;
}

const NextPressable = ({isNextButtonEnabled, handleNextPress, customStyles}: NextPressableProps) => {
    return (
        <TouchableOpacity
            style={[customStyles, styles.nextButton, isNextButtonEnabled ? styles.nextButtonEnabled : styles.nextButtonDisabled]}
            onPress={handleNextPress}
            disabled={!isNextButtonEnabled}
        >
            <Ionicons name="arrow-forward-outline" size={35} color="white" style={{fontWeight: 'bold'}} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    nextButton: {
        backgroundColor: 'transparent',
        borderRadius: 6,
        alignItems: 'center',
        paddingVertical: 14,
        width: '60%',
    },
    nextButtonEnabled: {
        opacity: 1,
    },
    nextButtonDisabled: {
        opacity: 0.5,
    },
});


export default NextPressable;

