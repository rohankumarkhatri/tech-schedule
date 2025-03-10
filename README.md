## Setting up this project on a new computer:

required: Node.js

Install expo cli globally

   ```bash
   npm install -g expo-cli
   ```
Install eas cli to access cloud functionality:
   ```bash
   npm install --global eas-cli
   ```   

Now you can call expo commands, for example:
To test the app in a sandbox app by Expo, called EXPO GO (playstore/appstore), we start the server first:
   ```bash
   npx expo start
   ```
then scan the qr code on the screen through the expo go app to test the app in expo go. 

to make the build:
   ```bash
eas build --profile <whatever most likely production> --platform <ios/android>
   ```bash
