// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgyr9c1-1qlmMftGjdWNUyWv2eqvUNP4w",
  authDomain: "pnp-conveyancer.firebaseapp.com",
  projectId: "pnp-conveyancer",
  storageBucket: "pnp-conveyancer.firebasestorage.app",
  messagingSenderId: "223625627019",
  appId: "1:223625627019:web:a01d3da9084abe2e5c5b8e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;