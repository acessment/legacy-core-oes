import * as mongoose from 'mongoose';

/**
 * MongoDB connection utility with caching for SSR environments
 * 
 * This utility ensures a single connection is reused across requests
 * and handles connection pooling automatically.
 * 
 * @example
 * // In a React Router loader
 * import { dbConnect } from '@acessment/core-oes/database';
 * 
 * export async function loader() {
 *   await dbConnect('your-db-name');
 *   const data = await YourModel.find();
 *   return json({ data });
 * }
 */

/**
 * Global cache to prevent multiple connections in development
 */
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to MongoDB with the specified database name
 * 
 * @param dbName - The name of the database to connect to
 * @param connectionString - Optional MongoDB connection string. Falls back to MONGO_CONNECTION_STRING env var
 * @returns Mongoose instance
 * 
 * @throws {Error} If MONGO_CONNECTION_STRING is not defined
 */
export async function dbConnect(
  dbName: string,
  connectionString?: string
): Promise<typeof mongoose> {
  // Use process.env for server-side only (not prefixed with VITE_)
  const MONGODB_URI = connectionString || process.env.MONGO_CONNECTION_STRING;

  if (!MONGODB_URI) {
    throw new Error(
      'Please define MONGO_CONNECTION_STRING environment variable (server-side only)'
    );
  }

  // Return existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection if none exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering for SSR
      dbName, // Explicitly set database name
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Disconnects from MongoDB
 * Useful for cleanup in tests or shutdown hooks
 */
export async function dbDisconnect(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
