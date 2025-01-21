import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/custom-utils/helper-functions/registerForPushNotifications";
import { router } from "expo-router";
import { getAllTokensForThisClub } from "@/custom-utils/service-functions/FirebaseFunctions";

interface NotificationContextType {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            "useNotification must be used within a NotificationProvider"
        );
    }
    return context;
};

export async function sendClubMeetingViaPushNotificationToEveryone(clubName: string, meetingDate: string, senderName: string) {
    
    const allMembersTokens = await getAllTokensForThisClub(clubName);
    console.log(allMembersTokens);
    
    if (allMembersTokens == null) {
        return;
    }

    for (const token of allMembersTokens) {
        const message = {
            to: token,
            sound: 'default',
            title: `${clubName} shared a meeting.`,
            body: `Meeting on ${meetingDate}. Shared by ${senderName}. Click see details.`,
            data: {
                screen: "GoToNotificationsScreen",
            },
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
        
    }

}

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
}) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] =
        useState<Notifications.Notification | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    useEffect(() => {
        registerForPushNotificationsAsync().then(
            (token) => setExpoPushToken(token),
            (error) => setError(error)
        );

        notificationListener.current =
            Notifications.addNotificationReceivedListener((notif) => {
                // console.log("🔔 Notification Received: ", notification);
                setNotification(notif);
            });

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener((response) => {
                if(response.notification.request.content.data.screen === "GoToNotificationsScreen"){
                    setTimeout(() => {
                        router.push("/notifications-page");
                    }, 1500);
                }
                // Handle the notification response here
            });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(
                    notificationListener.current
                );
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return (
        <NotificationContext.Provider
            value={{ expoPushToken, notification, error }}
        >
            {children}
        </NotificationContext.Provider>
    );
};