// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Deine Firebase-Konfiguration einfügen:
const firebaseConfig = {
  apiKey: "AIzaSyChYmFmii4E9Ys31bFc7VOx42Q7ORxoiho",
  authDomain: "junds-d31db.firebaseapp.com",
  databaseURL: "https://junds-d31db-default-rtdb.firebaseio.com",
  projectId: "junds-d31db",
  storageBucket: "junds-d31db.firebasestorage.app",
  messagingSenderId: "706326315999",
  appId: "1:706326315999:web:d8da74bb178b63e2f0fa6a"
};
// Firebase App & Firestore initialisieren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
