import { makeRedirectUri } from 'expo-auth-session';

const scheme = 'tech-schedule'; //From app.json file
const path = 'signinpage'; //Redirect Page [must be same as in entra id application]

export const TENET_ID = '178a51bf-8b20-49ff-b655-56245d5c173c';
export const CLIENT_ID = 'b847369e-fdca-458e-b4c3-463ed8b9de0c'; //application id


export const SCOPES = ['openid', 'profile', 'email', 'offline_access']; // Default scope, we are authenticated to grab this data from GraphQL with our access token
export const REDIRECT_URI = makeRedirectUri( __DEV__ ? {scheme: '', path:''}: {scheme: scheme, path: path});
