import { View, StyleSheet, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
      <View style={styles.container}>
        <Text style={styles.text}>Oops! This screen doesn't exist. Close the app and try again.</Text>
        <Text style={styles.bottomText}>If error persists, contact the developer.</Text>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: '500', 
    color: 'white',
    textAlign: 'center',
  },
  bottomText: {
    position: 'absolute',
    opacity: 0.5,
    bottom: 20,
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
  },
});