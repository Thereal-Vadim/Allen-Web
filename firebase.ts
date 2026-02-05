// @ts-ignore
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
// @ts-ignore
import { getAnalytics } from 'firebase/analytics';
// @ts-ignore
import { getDatabase } from 'firebase/database';

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

// Initialize Cloud Storage
export const storage = getStorage(app);

// Initialize Realtime Database
export const db = getDatabase(app);

/**
 * UTILITY: Get Cached Video URL
 * Fetches the download URL from Firebase and caches it in SessionStorage.
 * This prevents repeated API calls to Firebase when navigating between pages,
 * significantly speeding up perceived loading times.
 */
export const getCachedVideoUrl = async (fileName: string): Promise<string> => {
    // 1. Check Cache
    const CACHE_KEY = `vid_cache_${fileName}`;
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
            // Optional: Basic validation if url looks like a firebase url
            if(cached.includes("firebasestorage")) return cached;
        }
    } catch (e) {
        // Storage access denied or full
    }

    // 2. Fetch from Network
    const storageRef = ref(storage, fileName);
    const url = await getDownloadURL(storageRef);

    // 3. Save to Cache
    try {
        sessionStorage.setItem(CACHE_KEY, url);
    } catch (e) {
        console.warn("SessionStorage full, skipping cache.");
    }

    return url;
};