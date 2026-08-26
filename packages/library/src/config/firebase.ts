// firebase.ts

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";

// Singleton instances
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

// Initialize Firebase with config (called by ConfigProvider or app setup)
export const initializeFirebase = async (config: { apiKey: string; projectId: string }) => {
    if (!config.apiKey || !config.projectId) {
        console.warn("Firebase configuration missing. Auth features will not work.");
        return null;
    }

    if (!firebaseApp) {
        // Firebase requires authDomain for proper auth state persistence
        const firebaseConfig = {
            apiKey: config.apiKey,
            projectId: config.projectId,
            authDomain: `${config.projectId}.firebaseapp.com`, // Required for auth
        };

        firebaseApp = initializeApp(firebaseConfig);
        firebaseAuth = getAuth(firebaseApp);

        // Set persistence to LOCAL (survives page reloads and tab closes)
        try {
            await setPersistence(firebaseAuth, browserLocalPersistence);
        } catch (error) {
            console.error("Failed to set Firebase auth persistence:", error);
        }
    }

    return firebaseApp;
};

// Get initialized Firebase app
export const getFirebaseApp = (): FirebaseApp | null => firebaseApp;

// Get initialized Firebase auth
export const getFirebaseAuth = (): Auth | null => firebaseAuth;

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => !!(firebaseApp && firebaseAuth);

// Backward compatibility - default export
const auth = firebaseAuth;
export default auth;

// Export app instance for other Firebase services
export { firebaseApp as app };
