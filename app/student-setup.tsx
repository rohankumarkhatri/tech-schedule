import React, { useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, StatusBar, Easing } from 'react-native';
import FirstCoursesSection from './student-setup-pages/first-courses-section';
import SecondClubsSection from './student-setup-pages/second-clubs-section';


const { height } = Dimensions.get('window');

const SetUpForStudent: React.FC = () => {
    
    const [currentSection, setCurrentSection] = useState<'first' | 'second'>('first');
    const animation = useRef(new Animated.Value(0)).current;

    
    const navigateToFirst = () => {
        
        Animated.timing(animation, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
        }).start(() => {
            setCurrentSection('first');
        });
    };

    const navigateToSecond = () => {
        setCurrentSection('second');
        Animated.timing(animation, {
            toValue: -height, // Move the first section up
            duration: 500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
        }).start();
    };

    const navigateBack = () => {
        Animated.timing(animation, {
            toValue: 0, // Move the first section back to original position
            duration: 500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
        }).start(() => {
            setCurrentSection('first');
        });
    };
    

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <Animated.View
                style={[
                    styles.animatedView,
                    {
                        transform: [{ translateY: animation }],
                    },
                ]}
            >
                {/* <ZeroSection onPress={navigateToFirst} /> */}
            </Animated.View>
            <Animated.View
                style={[
                    styles.animatedView,
                    {
                        transform: [{ translateY: animation }],
                    },
                ]}
            >
                <FirstCoursesSection onPress={navigateToSecond} />
            </Animated.View>
            {/* Second Section is positioned below the first one */}
            <Animated.View
                style={[
                    styles.animatedView,
                    styles.secondSection,
                    {
                        transform: [{ translateY: animation.interpolate({
                            inputRange: [-height, 0],
                            outputRange: [0, height],
                            extrapolate: 'clamp',
                        }) }],
                    },
                ]}
            >
                <SecondClubsSection onPressBack={navigateBack} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Ensure the container takes up the full screen
    },
    animatedView: {
        position: 'absolute',
        width: '100%',
        height: '100%', // Ensure the animated views cover the full height
        flex: 1,
    },
    secondSection: {
        // Optional: Additional styles for the second section
    },
});

export default SetUpForStudent;