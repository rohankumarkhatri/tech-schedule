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
import { addMyPushTokenToClubs, getAllTokensForThisClub } from "@/custom-utils/service-functions/FirebaseFunctions";
import { GETallClubs, GETUserEmail } from "@/custom-utils/helper-functions/GetSetFunctions";

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
            (token) => {setExpoPushToken(token); addMyPushTokenToClubs(token);},
            (error) => setError(error),
        );

        notificationListener.current =
            Notifications.addNotificationReceivedListener((notif) => {
                console.log("🔔 Notification Received: ", notif);

                setNotification(notif);
            });

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener((response) => {
                if(response.notification.request.content.data.screen === "GoToNotificationsScreen"){
                    setTimeout(() => {
                        router.push("/notifications-page");
                    }, 1800);
                }
                // Handle the notification response here
            });
        
         Notifications.setNotificationCategoryAsync('custom_actions', [
            {
                identifier: 'first_action',
                buttonTitle: 'Action 1',
            },
            {
                identifier: 'second_action',
                buttonTitle: 'Action 2',
            },
        ]);

        Notifications.addNotificationResponseReceivedListener((response) => {
            if (response.actionIdentifier === 'first_action') {
                // Handle first action
            } else if (response.actionIdentifier === 'second_action') {
                // Handle second action
            }
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