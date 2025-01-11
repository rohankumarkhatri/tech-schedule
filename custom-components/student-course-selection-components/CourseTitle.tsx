import { View, Text, Pressable, StyleSheet, TouchableOpacity } from "react-native";

interface CourseTitleInInputFieldProps {
    index: number;
    courseTitle: string;
    handleDelete: (index: number) => void;
}

const CourseTitle = ({ index, courseTitle, handleDelete }: CourseTitleInInputFieldProps) => {
    return (

        <View style={styles.tag}>
            <Text style={styles.tagText} numberOfLines={1} ellipsizeMode="tail">{courseTitle}</Text>
            <Pressable onPress={() => handleDelete(index)} style={styles.deleteButton}/>
        </View>

    );
}

const styles = StyleSheet.create({
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e0e0e0',
        padding: 10,
        margin: 10,
        borderRadius: 5,
        width: 330,
    },
    tagText: {
        fontSize: 16,
        marginRight: 7,
        maxWidth: '90%',
        color: '#171717',
        // fontWeight: '500'
    },
    deleteButton: {
        backgroundColor: 'transparent',
        paddingHorizontal: 3,
        height: '120%',
        width: '100%',
        borderRadius: 0,
        marginLeft: 5,
        position: 'absolute',
        right: 10,
        opacity: 0.9,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 16,
        // position: 'relative',
        // bottom: 2
        textAlignVertical: 'center',
        textAlign:'center',
        bottom:  2,
    }
});

export default CourseTitle;
