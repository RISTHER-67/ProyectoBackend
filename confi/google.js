// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "firebase/auth";




const firebaseConfig = {
    apiKey: "AIzaSyCKYvDQcyes_FoUmJJFKsNa0ZlgrpHnG60",
    authDomain: "auth-62c14.firebaseapp.com",
    projectId: "auth-62c14",
    storageBucket: "auth-62c14.firebasestorage.app",
    messagingSenderId: "924651705622",
    appId: "1:924651705622:web:810be4237a91c81708ac37",
    measurementId: "G-KVWFTYHL4X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

//Export 
export { auth, provider, signInWithPopup, signOut };