// Singleton config values
let googleClientID = '';
let facebookClientID = '';
let emailDomain = 'example.com';
/** @deprecated Use getServerConfigFromEnv() instead. This will be removed in v3.0 */
let passwordAesSecret = '';
let encryptionSecretKey = '';

// Configuration setter (called by ConfigProvider or app setup)
export const setClientConfig = (config: { 
    googleClientId?: string; 
    facebookClientId?: string;
    emailDomain?: string;
    /** @deprecated Do not pass secrets to client config. Use getServerConfigFromEnv() server-side instead. */
    passwordAesSecret?: string;
    encryptionSecretKey?: string;
}) => {
    if (config.googleClientId !== undefined) {
        googleClientID = config.googleClientId;
    }
    if (config.facebookClientId !== undefined) {
        facebookClientID = config.facebookClientId;
    }
    if (config.emailDomain !== undefined) {
        emailDomain = config.emailDomain;
    }
    if (config.encryptionSecretKey !== undefined) {
        encryptionSecretKey = config.encryptionSecretKey;
    }
    if (config.passwordAesSecret !== undefined) {
        console.warn(
            '⚠️ Security Warning: passwordAesSecret should not be set in client config. ' +
            'Use getServerConfigFromEnv() in server-side code instead. ' +
            'This parameter will be removed in v3.0.'
        );
        passwordAesSecret = config.passwordAesSecret;
    }
};

// Getters for backward compatibility
export const getGoogleClientId = () => googleClientID;
export const getFacebookClientId = () => facebookClientID;
export const getEmailDomain = () => emailDomain;
export const getEncryptionSecretKey = () => encryptionSecretKey;

/** 
 * @deprecated Access secrets server-side only via getServerConfigFromEnv() from @acessment/core-oes/hooks
 * This will be removed in v3.0
 */
export const getPasswordAesSecret = () => {
    if (passwordAesSecret) {
        console.warn(
            '⚠️ Security Warning: Accessing passwordAesSecret from client-side config is deprecated. ' +
            'Use getServerConfigFromEnv() in server-side loaders/actions instead.'
        );
    }
    return passwordAesSecret;
};

// Function-based configuration getter
export const getConfig = () => ({
    googleClientID: getGoogleClientId(),
    facebookClientID: getFacebookClientId(),
    emailDomain: getEmailDomain(),
    passwordAesSecret: getPasswordAesSecret(),
    encryptionSecretKey: getEncryptionSecretKey(),
});

// Backward compatibility - default export
const config = new Proxy({} as ReturnType<typeof getConfig>, {
    get(target, prop) {
        return getConfig()[prop as keyof ReturnType<typeof getConfig>];
    }
});

export default config;
