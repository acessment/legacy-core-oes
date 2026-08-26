import admin from "firebase-admin";

let adminInitialized = false;

/**
 * Decode base64 Firebase credentials
 */
const getFirebaseConfig = () => {
    const firebaseCredential = process.env.FIREBASE_CREDENTIAL;
    if (!firebaseCredential) {
        throw new Error("FIREBASE_CREDENTIAL environment variable is not set");
    }
    const decodedCredential = Buffer.from(firebaseCredential, "base64").toString("utf-8");
    return JSON.parse(decodedCredential);
};

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebase = () => {
    try {
        const firebaseConfig = getFirebaseConfig();
        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
        });
        console.log("✅ Firebase Admin initialized successfully");
    } catch (error) {
        console.error("❌ Firebase Admin initialization failed:", error);
        throw error;
    }
};

/**
 * Get Firebase Admin instance (initializes on first call)
 */
export function getFirebaseAdmin() {
    if (!adminInitialized) {
        initializeFirebase();
        adminInitialized = true;
    }
    return admin;
}
