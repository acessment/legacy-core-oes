/**
 * Global input sanitization middleware to prevent NoSQL injection attacks
 *
 * This middleware should be applied to all loaders/actions that accept user input.
 * It sanitizes query parameters, route params, and request bodies.
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import mongoose from "mongoose";

/**
 * Dangerous MongoDB operators that should be stripped from user input
 * These can be used for NoSQL injection attacks
 */
const DANGEROUS_OPERATORS = [
    "$where",
    "$regex",
    "$expr",
    "$jsonSchema",
    "$function",
    "$accumulator",
    // Query operators that can be abused
    "$gt",
    "$gte",
    "$lt",
    "$lte",
    "$ne",
    "$in",
    "$nin",
    "$and",
    "$or",
    "$not",
    "$nor",
    "$exists",
    "$type",
    "$mod",
    "$text",
    "$geoIntersects",
    // Update operators
    "$set",
    "$unset",
    "$inc",
    "$mul",
    "$rename",
    "$min",
    "$max",
    "$push",
    "$pull",
    "$addToSet",
    "$pop",
    "$pullAll",
    // Array update operators
    "$",
    "$[]",
    "$[<identifier>]",
];

/**
 * Recursively sanitize an object by removing MongoDB operators
 * Also converts objects in strings to prevent JSON injection
 */
export function sanitizeObject(obj: any, depth = 0): any {
    // Prevent deep recursion DoS
    if (depth > 10) {
        console.warn("⚠️  Input sanitization: Maximum depth exceeded");
        return null;
    }

    if (obj === null || obj === undefined) {
        return obj;
    }

    // Convert to string for primitives
    if (typeof obj !== "object") {
        return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObject(item, depth + 1));
    }

    // Sanitize object keys and values
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
        // Remove keys that start with $ (MongoDB operators)
        if (key.startsWith("$")) {
            console.warn(`⚠️  Blocked dangerous operator: ${key}`);
            continue;
        }

        // Remove keys that start with . (can be used to access nested properties maliciously)
        if (key.includes(".")) {
            console.warn(`⚠️  Blocked key with dot notation: ${key}`);
            continue;
        }

        // Recursively sanitize nested objects
        sanitized[key] = sanitizeObject(value, depth + 1);
    }

    return sanitized;
}

/**
 * Validate and sanitize MongoDB ObjectId parameters
 */
export function sanitizeMongoId(id: string | undefined): string | null {
    if (!id) return null;

    // Ensure it's a string (not an object)
    if (typeof id !== "string") {
        console.warn(`⚠️  Invalid ID type: ${typeof id}`);
        return null;
    }

    // Trim whitespace
    const trimmed = id.trim();

    // Validate ObjectId format (24 hex characters)
    if (!mongoose.Types.ObjectId.isValid(trimmed)) {
        console.warn(`⚠️  Invalid MongoDB ObjectId format: ${trimmed}`);
        return null;
    }

    return trimmed;
}

/**
 * Sanitize URL search parameters
 */
export function sanitizeSearchParams(url: URL): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const [key, value] of url.searchParams.entries()) {
        // Skip keys with operators
        if (key.startsWith("$") || key.includes(".")) {
            console.warn(`⚠️  Blocked search param: ${key}`);
            continue;
        }

        // Sanitize the value (remove potential JSON/object injection)
        if (typeof value === "string") {
            sanitized[key] = value.trim();
        }
    }

    return sanitized;
}

/**
 * Sanitize route parameters (typically IDs)
 */
export function sanitizeRouteParams(params: Record<string, string | undefined>): Record<string, string | null> {
    const sanitized: Record<string, string | null> = {};

    for (const [key, value] of Object.entries(params)) {
        // Check if the param looks like an ID
        if (
            key.toLowerCase().includes("id") ||
            key === "exercise" ||
            key === "homework" ||
            key === "user" ||
            key === "student" ||
            key === "pdf"
        ) {
            sanitized[key] = sanitizeMongoId(value);
        } else if (value && typeof value === "string") {
            // For non-ID params, just ensure it's a clean string
            sanitized[key] = value.trim();
        }
    }

    return sanitized;
}

/**
 * Sanitize request body (JSON)
 */
export async function sanitizeRequestBody(request: Request): Promise<any> {
    try {
        const contentType = request.headers.get("content-type");

        if (contentType?.includes("application/json")) {
            const body = await request.json();
            return sanitizeObject(body);
        }

        if (
            contentType?.includes("application/x-www-form-urlencoded") ||
            contentType?.includes("multipart/form-data")
        ) {
            const formData = await request.formData();
            const obj: Record<string, any> = {};

            for (const [key, value] of formData.entries()) {
                if (!key.startsWith("$") && !key.includes(".")) {
                    obj[key] = value;
                }
            }

            return sanitizeObject(obj);
        }

        return null;
    } catch (error) {
        console.error("Error sanitizing request body:", error);
        return null;
    }
}

/**
 * High-level sanitization wrapper for loaders
 * Use this in loaders that accept user input
 */
export async function sanitizeLoaderInput(args: LoaderFunctionArgs) {
    const url = new URL(args.request.url);

    return {
        params: sanitizeRouteParams(args.params),
        searchParams: sanitizeSearchParams(url),
        url,
    };
}

/**
 * High-level sanitization wrapper for actions
 * Use this in actions that accept user input
 */
export async function sanitizeActionInput(args: ActionFunctionArgs) {
    const url = new URL(args.request.url);
    const body = await sanitizeRequestBody(args.request);

    return {
        params: sanitizeRouteParams(args.params),
        searchParams: sanitizeSearchParams(url),
        body,
        url,
    };
}

// Type definitions for sanitized inputs
export type SanitizedLoaderInput = Awaited<ReturnType<typeof sanitizeLoaderInput>>;
export type SanitizedActionInput = Awaited<ReturnType<typeof sanitizeActionInput>>;

/**
 * Middleware wrapper that automatically sanitizes inputs for loaders
 *
 * @example
 * export const loader = withInputSanitization(async (args, sanitized) => {
 *   const { params, searchParams } = sanitized;
 *   // Use sanitized inputs safely
 * });
 */
export function withInputSanitization<T extends LoaderFunctionArgs>(
    handler: (args: T, sanitized: SanitizedLoaderInput) => Promise<Response>
): (args: T) => Promise<Response>;

/**
 * Middleware wrapper that automatically sanitizes inputs for actions
 *
 * @example
 * export const action = withInputSanitization(async (args, sanitized) => {
 *   const { params, body } = sanitized;
 *   // Use sanitized inputs safely
 * });
 */
export function withInputSanitization<T extends ActionFunctionArgs>(
    handler: (args: T, sanitized: SanitizedActionInput) => Promise<Response>
): (args: T) => Promise<Response>;

// Implementation
export function withInputSanitization<T extends LoaderFunctionArgs | ActionFunctionArgs>(
    handler: (args: T, sanitized: SanitizedLoaderInput | SanitizedActionInput) => Promise<Response>
): (args: T) => Promise<Response> {
    return async (args: T): Promise<Response> => {
        const isAction = args.request.method !== "GET" && args.request.method !== "HEAD";

        const sanitized = isAction
            ? await sanitizeActionInput(args as ActionFunctionArgs)
            : await sanitizeLoaderInput(args as LoaderFunctionArgs);

        return handler(args, sanitized);
    };
}
