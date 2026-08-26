import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeAppConfig } from "../config/initializeConfig";

export interface AppConfig {
    apiDomain: string;
    apiEndpoint?: string;
    baseUrl?: string;
    firebaseApiKey: string;
    firebaseProjectId: string;
    emailDomain: string;
    googleClientId?: string;
    facebookClientId?: string;
    viteAuthDomain?: string;
    stripePricingTableId?: string;
    stripePublishableKey?: string;
    stripeProductIds?: string[];
    stripePremiumPlanId?: string;
    stripePlusPlanId?: string;
    stripeThreeInOnePlanId?: string;
    s3publicUrl?: string;
    encryptionSecretKey?: string;
}

const ConfigContext = createContext<AppConfig | null>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode; value: AppConfig }> = ({ children, value }) => {
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize all singletons when config changes
    useEffect(() => {
        initializeAppConfig(value)
            .then(() => {
                setIsInitialized(true);
            })
            .catch((error) => {
                console.error("Failed to initialize app config:", error);
                setIsInitialized(true); // Still render to show error state
            });
    }, [value]);

    // Don't render children until Firebase is initialized
    if (!isInitialized) {
        return null; // Or return a loading spinner
    }

    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export const useConfig = (): AppConfig => {
    const config = useContext(ConfigContext);
    if (!config) {
        throw new Error("useConfig must be used within a ConfigProvider");
    }
    return config;
};

// Convenience hooks for specific config values
export const useApiDomain = () => useConfig().apiDomain;
export const useApiEndpoint = () => useConfig().apiEndpoint ?? `${useConfig().apiDomain}/api`;
export const useAuthDomain = () => useConfig().viteAuthDomain;
export const useFirebaseConfig = () => {
    const config = useConfig();
    return {
        apiKey: config.firebaseApiKey,
        projectId: config.firebaseProjectId,
    };
};
