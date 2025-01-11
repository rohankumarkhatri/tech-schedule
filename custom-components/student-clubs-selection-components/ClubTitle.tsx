import { View, Text, Pressable, StyleSheet, TouchableOpacity } from "react-native";

interface ClubTitleInInputFieldProps {
    index: number;
    clubTitle: string;
    handleDelete: (index: number) => void;
}

const ClubTitle = ({ index, clubTitle, handleDelete }: ClubTitleInInputFieldProps) => {
    return (

        <View style={styles.tag}>
            <Text style={styles.tagText} numberOfLines={1} ellipsizeMode="tail">{clubTitle}</Text>
            <Pressable onPress={() => handleDelete(index)} style={styles.deleteButton}/>
        </View>

    );
}

const styles = StyleSheet.create({
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        padding: 10,
        margin: 10,
        borderRadius: 5,
        width: 330,
    },
    tagText: {
        fontSize: 16,
        marginRight: 7,
        maxWidth: '80%',
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

export default ClubTitle;
