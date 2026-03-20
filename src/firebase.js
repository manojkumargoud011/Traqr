import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBjdpA3AJ0uzRh-3aJUez_HIvXJ6w7t9Vc",
  authDomain: "traqr-42749.firebaseapp.com",
  projectId: "traqr-42749",
  storageBucket: "traqr-42749.firebasestorage.app",
  messagingSenderId: "377751406337",
  appId: "1:377751406337:web:36cd6ecadb48e47900bd00",
  measurementId: "G-JJYHX4C90J"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
