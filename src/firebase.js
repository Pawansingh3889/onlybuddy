import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyCfNMmIULY90ugYbmaLhkIJuxTi_5HtPnE",
  authDomain:        "onlybuddy-493b2.firebaseapp.com",
  projectId:         "onlybuddy-493b2",
  storageBucket:     "onlybuddy-493b2.firebasestorage.app",
  messagingSenderId: "613243455754",
  appId:             "1:613243455754:web:d04e715cb24adebbe752f3",
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
