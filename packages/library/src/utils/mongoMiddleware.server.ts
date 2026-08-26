/**
 * Security middleware for protecting routes against NoSQL injection
 * 
 * This middleware validates route parameters to ensure they are valid MongoDB ObjectIds
 * before reaching the action/loader, providing centralized security.
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import mongoose from "mongoose";

/**
 * Validate that all route params that look like IDs are valid ObjectIds
 * Returns error response if any ID is invalid
 */
export function validateMongoParams(
    params: Record<string, string | undefined>
): Response | null {
    const idParams = Object.entries(params).filter(([key]) => 
        key.toLowerCase().includes("id") || 
        key === "exercise" || 
        key === "homework" ||
        key === "user" ||
        key === "student"
    );

    for (const [key, value] of idParams) {
        if (!value) continue;
        
        // Check if it's a string and not an object (prevent injection)
        if (typeof value !== "string") {
            return new Response(
                JSON.stringify({
                    error: "Bad Request",
                    message: `Invalid parameter: ${key} must be a string`,
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return new Response(
                JSON.stringify({
                    error: "Bad Request",
                    message: `Invalid MongoDB ObjectId format for parameter: ${key}`,
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    }

    return null; // All params are valid
}

/**
 * Loader wrapper that validates MongoDB params before executing loader
 * Use this to wrap your loader functions for automatic validation
 * 
 * @example
 * export const loader = withMongoParamValidation(async ({ params }) => {
 *   // params are already validated here
 *   const exercise = await Exercise.findById(params.exerciseId);
 *   return json({ exercise });
 * });
 */
export function withMongoParamValidation<T = unknown>(
    loaderFn: (args: LoaderFunctionArgs) => Promise<T> | T
) {
    return async (args: LoaderFunctionArgs) => {
        const validationError = validateMongoParams(args.params);
        if (validationError) {
            return validationError;
        }
        return loaderFn(args);
    };
}

/**
 * Action wrapper that validates MongoDB params before executing action
 * Use this to wrap your action functions for automatic validation
 * 
 * @example
 * export const action = withMongoParamValidation(async ({ request, params }) => {
 *   // params are already validated here
 *   const exercise = await Exercise.findById(params.exerciseId);
 *   return json({ success: true });
 * });
 */
export function withMongoParamValidation_Action<T = unknown>(
    actionFn: (args: ActionFunctionArgs) => Promise<T> | T
) {
    return async (args: ActionFunctionArgs) => {
        const validationError = validateMongoParams(args.params);
        if (validationError) {
            return validationError;
        }
        return actionFn(args);
    };
}
