import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3mSlPIjA0R1z2rszxdVod0vK0GK8w8ik",
  authDomain: "project-spotlight-3183d.firebaseapp.com",
  projectId: "project-spotlight-3183d",
  storageBucket: "project-spotlight-3183d.firebasestorage.app",
  messagingSenderId: "656506975255",
  appId: "1:656506975255:web:5bebcd5d855c759e7d9852",
  measurementId: "G-QHTBYWF6MM",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
