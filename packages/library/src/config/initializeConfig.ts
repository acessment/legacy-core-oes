// Initialize all configuration singletons
// This should be called once at app startup before rendering

import { initializeFirebase, getFirebaseAuth } from "./firebase";
import { setAxiosConfig } from "../api/customAxios";
import { setHttpClientConfig } from "../api/httpClient";
import { setClientConfig } from "./config";
import type { AppConfig } from "../provider/ConfigProvider";

export const initializeAppConfig = async (config: AppConfig) => {
    // Initialize Firebase (this also initializes auth internally with persistence)
    await initializeFirebase({
        apiKey: config.firebaseApiKey,
        projectId: config.firebaseProjectId,
    });

    // Firebase Auth is already initialized by initializeFirebase()
    // Access it via getFirebaseAuth() when needed elsewhere in the app
    // Initialize HTTP clients
    const apiEndpoint = config.apiEndpoint || `${config.apiDomain}/api`;
    setAxiosConfig({ apiEndpoint });
    setHttpClientConfig({ apiEndpoint });

    // Initialize client config
    setClientConfig({
        googleClientId: config.googleClientId,
        facebookClientId: config.facebookClientId,
        emailDomain: config.emailDomain,
        passwordAesSecret: config.passwordAesSecret,
        encryptionSecretKey: config.encryptionSecretKey,
    });
};
