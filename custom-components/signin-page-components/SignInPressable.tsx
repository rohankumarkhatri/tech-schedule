import { StyleSheet, Pressable, Text, View, TouchableOpacity } from 'react-native';
import { exchangeCodeAsync, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import { CLIENT_ID, SCOPES, REDIRECT_URI, TENET_ID } from '@/custom-configuration-files/AuthConfig';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
interface SignInPressableProps {

    onTokenReceived: (token: string | null) => void;
    buttonText: string;
}

/**
 * A button that, when pressed, will prompt the user to sign in to Microsoft Entra ID and authenticate them.
 * If the user exists in the scope specified in the application in Entra ID, they will be authenticated and redirected to the app with a token.
 * This presseable sends that token to the callback function onTokenReceived.
 * The Token can be used to access the user's information through the Microsoft Graph API i.e. https://graph.microsoft.com/oidc/userinfo.
 * @param discoveryDocument a discovery document from Entra ID
 * @param onTokenReceived a function that is called when the token is received
 * @param buttonText the text of the button
 * 
 */
const SignInPressable = ({ onTokenReceived, buttonText }: SignInPressableProps) => {

    //[Tenet thing] useAutoDiscovery returns all endpoints (enpointes needed for the authorization).
    const discoveryDocument = useAutoDiscovery(`https://login.microsoftonline.com/${TENET_ID}/v2.0`);
    const isPressed = useRef(false);
    //[Client thing] Loading authorization request for "Time Tomato", client sitting in the Entra ID.
    const [request, , promptAsync] = useAuthRequest({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        //scopes: SCOPES
        scopes: [...SCOPES, 'People.Read', 'MultiTenantOrganization.ReadBasic.All', 'Calendars.Read',], // Add new scopes accordingly
    }, discoveryDocument);

    const showPromptToGetToken = async () => {
        isPressed.current = true;
        const authSessionResult = await promptAsync();

        if (request && authSessionResult?.type === 'success' && discoveryDocument) {
            const response = await exchangeCodeAsync(
                {
                    clientId: CLIENT_ID,
                    code: authSessionResult.params.code,
                    extraParams: request.codeVerifier
                        ? { code_verifier: request.codeVerifier }
                        : undefined,
                    redirectUri: REDIRECT_URI,
                },
                discoveryDocument,
            );
            onTokenReceived(response.accessToken);
        }
        else {
            isPressed.current = false;
        }

        // console.log('discoveryDocument', discoveryDocument);
    };

    return (
        <>
            {buttonText === 'Texas Tech Student Sign-In' ? (
                <TouchableOpacity
                    disabled={!request}
                    onPress={showPromptToGetToken}
                    style={[
                        styles.buttonStudent,
                    ]}
                >
                    <LinearGradient
                        colors={['#b53939', '#e86464']}
                        start={[-0.7, 0]}
                        end={[1, 0]}
                        style={[
                            styles.studentGradient,
                        ]}
                    >
                        <Text style={[styles.buttonText, { marginRight: 3.5}]}>{buttonText}</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" style={styles.icon} />
                    </LinearGradient>

                </TouchableOpacity>

            ) : (
                <TouchableOpacity
                    disabled={!request}
                    onPress={showPromptToGetToken}
                    style={[
                        styles.buttonInstructor,
                    ]}
                >

                    <Text style={[styles.buttonText, { fontSize: 18, color: '#d0d0d0' }]}>{buttonText}</Text>
                    <Ionicons name="arrow-forward" size={18} color="#d0d0d0" style={styles.icon} />
                </TouchableOpacity>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    buttonStudent: {
        borderRadius: 6,
        overflow: 'hidden',
        width: '70%',
    },
    buttonInstructor: {
        borderRadius: 6,
        overflow: 'hidden',
        position: 'absolute',
        flexDirection: 'row',
        bottom: 120,
    },
    studentGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 17,
        lineHeight: 17,
        paddingTop: 2.5,
    },
    icon: {
        marginLeft: 5,
    },
});

export default SignInPressable;
