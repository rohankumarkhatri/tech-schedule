import { View, StyleSheet, Text, Linking } from 'react-native';

export default function NotFoundScreen() {
  return (
      <View style={styles.container}>
        <Text style={styles.text}>Oops! This screen doesn't exist. Close the app and try again.</Text>
        <Text style={styles.bottomText} onPress={() => Linking.openURL('mailto:rocinantebattleship@gmail.com')}>If error persists, explain the problem here.</Text>
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
    bottom: 30,
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});