// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOIvSnEQIVpDIRy5ubceRZPKfmJYXwiMQ",
  authDomain: "time-tomato-3d536.firebaseapp.com",
  databaseURL: "https://time-tomato-3d536-default-rtdb.firebaseio.com",
  projectId: "time-tomato-3d536",
  storageBucket: "time-tomato-3d536.appspot.com",
  messagingSenderId: "835390485530",
  appId: "1:835390485530:web:1197f8a848fcd3f91acda3",
  measurementId: "G-JVFJZ9J84B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireStoreDb = getFirestore(app);
const realTimeDb = getDatabase(app);

export {fireStoreDb, realTimeDb};