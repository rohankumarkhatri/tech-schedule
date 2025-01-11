import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { createContext, useState, useEffect, useRef } from "react";

type CourseContextType = {
  globalRerender: boolean;
  setGlobalRerender: React.Dispatch<React.SetStateAction<boolean>>;
  areCoursesLoaded: React.MutableRefObject<boolean>;
};

export const Context = createContext<CourseContextType>({
  globalRerender: false,
  setGlobalRerender: () => {},
  areCoursesLoaded: { current: false },
});

export default function RootLayout() {
  const [globalRerender, setGlobalRerender] = useState(false);
  const areCoursesLoaded = useRef(false);

  useEffect(() => {
    console.log("Rerending everything from root layout i.e. Global Rerender");
  }, [globalRerender]); 

  return (
    <Context.Provider value={{ globalRerender, setGlobalRerender, areCoursesLoaded }}>
      <StatusBar style="light" />  
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen 
          name="notificationsPage" 
          options={{ 
            headerShown: true, 
            headerTitleAlign: 'center',
            headerTitle: 'Notifications',
            headerStyle: { backgroundColor: '#404040' },
            headerTitleStyle: { fontSize: 20, color: 'white' },
            headerTintColor: 'white', // This makes the arrow white
            headerBackTitle: '‎', // This removes the back button text
          }}
        />
      </Stack>
    </Context.Provider>
  );
}
