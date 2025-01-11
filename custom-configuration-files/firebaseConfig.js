// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrPWBBgGsbPiJPLrXyLhES3X-vrXFnkIo",
  authDomain: "tech-schedule-firebase.firebaseapp.com",
  databaseURL: "https://tech-schedule-firebase-default-rtdb.firebaseio.com",
  projectId: "tech-schedule-firebase",
  storageBucket: "tech-schedule-firebase.firebasestorage.app",
  messagingSenderId: "95551567123",
  appId: "1:95551567123:web:b24603c28baeafc5a756e6",
  measurementId: "G-N55CVS3SLH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireStoreDb = getFirestore(app);
const realTimeDb = getDatabase(app);

export {fireStoreDb, realTimeDb};