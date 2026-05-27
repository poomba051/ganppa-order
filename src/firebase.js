import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCzbq68cO93xQHTYJ_5PrXqnYAk3NrpMQk",
  authDomain: "kanpeilist.firebaseapp.com",
  projectId: "kanpeilist",
  storageBucket: "kanpeilist.firebasestorage.app",
  messagingSenderId: "939966291773",
  appId: "1:939966291773:web:f3753b177ea71e1b532f54"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
