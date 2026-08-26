/**
 * Server-side configuration utilities
 *
 * ⚠️ SECURITY WARNING:
 * These functions should ONLY be used in server-side contexts:
 * - React Router loaders
 * - React Router actions
 * - Server-side API routes
 *
 * DO NOT use these in client components or anywhere that renders on the client!
 */

export interface ServerConfig {
    passwordAesSecret: string;
    mongoConnectionString: string;
    awsS3AccessKeyId: string;
    awsS3SecretKey: string;
    awsS3Region: string;
    awsS3BucketName: string;
    // Consumers can add more server-only secrets as needed
}

/**
 * Retrieves server-only configuration from environment variables.
 *
 * ⚠️ This function can ONLY be called on the server-side.
 * Attempting to call it in a client-side context will throw an error.
 *
 * @throws {Error} If called in a client-side context
 * @returns {ServerConfig} Server-only configuration object
 *
 * @example
 * // In a React Router loader (server-only)
 * export async function loader() {
 *   const serverConfig = getServerConfigFromEnv();
 *   const encrypted = encryptPassword(password, serverConfig.passwordAesSecret);
 *   return json({ encrypted });
 * }
 *
 * @example
 * // In a React Router action (server-only)
 * export async function action({ request }: ActionFunctionArgs) {
 *   const serverConfig = getServerConfigFromEnv();
 *   await connectToDatabase(serverConfig.mongoConnectionString);
 *   // ... perform action
 * }
 */
export function getServerConfigFromEnv(): ServerConfig {
    // Runtime check to ensure this is only called server-side
    if (typeof process === "undefined") {
        throw new Error(
            "🔒 Security Error: getServerConfigFromEnv() can only be called server-side. " +
                "This function accesses sensitive secrets and must not be used in client components. " +
                "Only use this in React Router loaders, actions, or server-side API routes."
        );
    }

    return {
        passwordAesSecret: process.env.VITE_PASSWORD_AES_SECRET || "",
        mongoConnectionString: process.env.MONGO_CONNECTION_STRING || "",
        awsS3AccessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
        awsS3SecretKey: process.env.AWS_S3_SECRET_KEY || "",
        awsS3Region: process.env.AWS_S3_REGION || "us-east-1",
        awsS3BucketName: process.env.AWS_S3_BUCKET_NAME || "",
    };
}
