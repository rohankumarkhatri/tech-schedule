import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { createContext, useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { NotificationProvider } from "@/contexts/NotificationsContext";
import * as TaskManager from "expo-task-manager";


const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {
    console.log("✅ Received a notification in the background!", {
      data,
      error,
      executionInfo,
    });    
    // Do something with the notification data
  }
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});



//FOR GLOBAL RENDERING CONTEXT
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
//FOR GLOBAL RENDERING CONTEXT


export default function RootLayout() {
  const [globalRerender, setGlobalRerender] = useState(false);
  const areCoursesLoaded = useRef(false);

  useEffect(() => {
    console.log("Rerending everything from root layout i.e. Global Rerender");
  }, [globalRerender]); 

  return (
    <Context.Provider  value={{ globalRerender, setGlobalRerender, areCoursesLoaded }}>
      <StatusBar style="light" backgroundColor="transparent"/>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#484848' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen   
            name="notifications-page" 
            options={{ 
              headerShown: true, 
              headerTitleAlign: 'center',
              headerTitle: 'Notifications',
              headerStyle: { backgroundColor: '#484848' },
              headerTitleStyle: { fontSize: 20, color: 'white' },
              headerTintColor: 'white', // This makes the arrow white
              headerBackTitle: '‎', // This removes the back button text
            }}
          />
          <Stack.Screen   
            name='non-ttu-student-signin' 
            options={{ 
              headerShown: true, 
              headerTitleAlign: 'center',
              headerTitle: ' ',
              headerStyle: { backgroundColor: '#1a1a1a' },
              headerTitleStyle: { fontSize: 20, color: 'white' },
              headerTintColor: 'white', // This makes the arrow white
              headerBackTitle: '‎', // This removes the back button text
            }}
          />
        </Stack>
      </NotificationProvider>
    </Context.Provider>
  );
}
