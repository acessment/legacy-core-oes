/**
 * Server-side configuration utilities
 *
 * ⚠️ SECURITY WARNING:
 * This file uses the `.server.ts` extension to ensure it's ONLY bundled for server-side code.
 * React Router automatically excludes `.server.ts` files from client bundles.
 *
 * These configurations should ONLY be used in server-side contexts:
 * - React Router loaders
 * - React Router actions
 * - Server-side API routes
 * - Files with `.server.ts` extension
 *
 * DO NOT import this in client components or anywhere that renders on the client!
 */

export interface ServerConfig {
    // Database
    mongoConnectionString: string;
    mongoDatabase: string;

    // AWS S3
    awsS3AccessKeyId: string;
    awsS3SecretKey: string;
    awsS3Region: string;
    awsS3BucketName: string;

    // Security
    passwordAesSecret: string;
    encryptionSecretKey: string;

    // Firebase Admin
    firebaseCredential: string;

    // Server
    port: number;
    nodeEnv: string;
    clientDomain: string;
    sessionDomain: string;
    sessionAge: number; // in milliseconds

    // S3 Paths
    exerciseThumbnailBasePath: string;
    exerciseAudioBasePath: string;

    // Generator
    generatorHost: string;

    // Token limits
    maxFreeToken: number;

    // Stripe Plan IDs
    threeInOnePlanId: string;
    plusPlanId: string;
    premiumPlanId: string;
    authDomain: string;
}

/**
 * Server-only configuration object loaded from environment variables.
 *
 * The `.server.ts` file extension ensures this code is never sent to the client.
 * All sensitive credentials and server-side settings are safely contained here.
 */
const serverConfig: ServerConfig = {
    // Database
    mongoConnectionString: process.env.MONGO_CONNECTION_STRING || "",
    mongoDatabase: process.env.MONGO_DATABASE || "",

    // AWS S3
    awsS3AccessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
    awsS3SecretKey: process.env.AWS_S3_SECRET_KEY || "",
    awsS3Region: process.env.AWS_S3_REGION || "us-east-1",
    awsS3BucketName: process.env.AWS_S3_BUCKET_NAME || "",

    // Security
    passwordAesSecret: process.env.VITE_PASSWORD_AES_SECRET || "",
    encryptionSecretKey: process.env.ENCRYPTION_SECRET_KEY || "",

    // Firebase Admin
    firebaseCredential: process.env.FIREBASE_CREDENTIAL || "",

    // Server
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    clientDomain: process.env.CLIENT_DOMAIN || "http://localhost:5173",
    sessionDomain: process.env.SESSION_DOMAIN || "localhost",
    sessionAge: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds

    // S3 Paths
    exerciseThumbnailBasePath: process.env.EXERCISE_THUMBNAIL_BASE_PATH!,
    exerciseAudioBasePath: process.env.EXERCISE_AUDIO_BASE_PATH!,

    // Generator
    generatorHost: process.env.GENERATOR_HOST || "https://nmjh6u64ugpevanhyy5oongftm0zwmag.lambda-url.us-west-2.on.aws",

    // Token limits
    maxFreeToken: 20,

    // Stripe Plan IDs
    threeInOnePlanId: process.env.THREE_IN_ONE_PLAN_ID || "",
    plusPlanId: process.env.PLUS_PLAN_ID || "",
    premiumPlanId: process.env.PREMIUM_PLAN_ID || "",
    authDomain: process.env.AUTH_DOMAIN || "http://localhost:5173",
};

export default serverConfig;
