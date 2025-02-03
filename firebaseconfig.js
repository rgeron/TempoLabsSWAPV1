// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1IwNghA-VgMY_84brXd5R8CgGOEt9gpI",
  authDomain: "swap-1205d.firebaseapp.com",
  projectId: "swap-1205d",
  storageBucket: "swap-1205d.firebasestorage.app",
  messagingSenderId: "61100527883",
  appId: "1:61100527883:web:39237b51c36ff717d7520e",
  measurementId: "G-661QC02VBW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
