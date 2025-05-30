import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBX8xnzYD0aa-rWcwmeDpyyPv_hFSS_vbw",
  authDomain: "pokerexpo-f62e1.firebaseapp.com",
  projectId: "pokerexpo-f62e1",
  storageBucket: "pokerexpo-f62e1.firebasestorage.app",
  messagingSenderId: "283649337741",
  appId: "1:283649337741:web:a31129a0433a5cc8c075c4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };