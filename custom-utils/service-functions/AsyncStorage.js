import AsyncStorage from '@react-native-async-storage/async-storage'; //reference: https://react-native-async-storage.github.io/async-storage/docs/api/


//AsyncStorage stores data in values as string, so if we want to store objects, we need to convert them to string using JSON.stringify
//Here I convert the value to string if it is not a string to improve performance and avoid errors

export const setItem = async (key, value) => { 
  try {
    const storedValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, storedValue);
  } catch (error) {
    console.error('Error setting item:', error);
  }
};

export const getItem = async (key) => { 
  try {
    const value = await AsyncStorage.getItem(key);
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
};

export const removeItem = async (key) => { 
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item:', error);
  }
};


export const clear = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
};
