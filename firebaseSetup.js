import { initializeApp, getApps} from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCL3Efm3J5AXeCMNqvmi9iIgXcoE4S2KAM",
  projectId: "medformsai",
  storageBucket: "medformsai.firebasestorage.app",
  messagingSenderId: "777260286981",
  appId: "1:777260286981:ios:dbf9c04469307c1809486c",
};

// Initialize Firebase app
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Auth only once
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

//Get Functions
const functions = getFunctions(app);

console.log("🔥 Firebase App Initialized:", app.name);

export { app, auth, functions, httpsCallable };
