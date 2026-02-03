// @ts-ignore
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getStorage } from 'firebase/storage';
// @ts-ignore
import { getAnalytics } from 'firebase/analytics';

// ------------------------------------------------------------------
// КОНФИГУРАЦИЯ FIREBASE (Client SDK)
// Данные обновлены из вашего последнего сообщения.
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyDaa2d2K1fObcIeP8H6s4IkJt41H5qVpLE",
  authDomain: "allen-d830c.firebaseapp.com",
  databaseURL: "https://allen-d830c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "allen-d830c",
  storageBucket: "allen-d830c.firebasestorage.app",
  messagingSenderId: "12193258704",
  appId: "1:12193258704:web:ea4e55a6262fe9af5ad2d5",
  measurementId: "G-FJR0MNHXLC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (Safe check for SSR/environment)
let analytics;
if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (e) {
        console.warn("Firebase Analytics failed to initialize:", e);
    }
}

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);