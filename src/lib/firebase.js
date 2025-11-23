import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANlvKPBmtZ0ziHvhqLHjhRaz4h3NiSrIE",
  authDomain: "focus-tracker-66ac4.firebaseapp.com",
  projectId: "focus-tracker-66ac4",
  storageBucket: "focus-tracker-66ac4.firebasestorage.app",
  messagingSenderId: "1052456092955",
  appId: "1:1052456092955:web:19b9150e363842e080ffbe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export default app;
