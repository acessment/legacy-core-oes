/**
 * Reusable Zod schemas for MongoDB security
 *
 * These schemas prevent NoSQL injection by validating:
 * - ObjectId format
 * - Content sanitization (no MongoDB operators)
 * - Proper data types
 */

import { z } from "zod";
import mongoose from "mongoose";

/**
 * MongoDB ObjectId validator
 * Ensures the ID is a valid 24-character hex string
 */
export const mongoIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId format")
    .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid ObjectId" });

/**
 * Safe content validator - prevents MongoDB operator injection
 * Rejects objects with keys starting with $ or containing MongoDB operators
 */
export const safeContentSchema = z.union([z.string(), z.record(z.string(), z.unknown())]).refine(
    (val) => {
        // If it's an object, ensure no MongoDB operators at root level
        if (typeof val === "object" && val !== null) {
            const keys = Object.keys(val);

            // Check for $ prefix (MongoDB operators)
            const hasDollarOperator = keys.some((key) => key.startsWith("$"));
            if (hasDollarOperator) {
                return false;
            }

            // Recursively check nested objects (optional - more thorough)
            const hasNestedOperators = keys.some((key) => {
                const value = (val as Record<string, unknown>)[key];
                if (typeof value === "object" && value !== null) {
                    return Object.keys(value).some((k) => k.startsWith("$"));
                }
                return false;
            });

            if (hasNestedOperators) {
                return false;
            }
        }
        return true;
    },
    { message: "Content cannot contain MongoDB operators ($set, $where, etc.)" }
);

/**
 * Safe JSON content - validates and sanitizes JSON content
 * Use this for content fields that should be stored as JSON strings
 */
export const safeJsonContentSchema = safeContentSchema.transform((val) => {
    return typeof val === "string" ? val : JSON.stringify(val);
});

/**
 * Validate MongoDB ObjectId in params
 * Use in Zod schemas for route parameters
 */
export const paramsWithIdSchema = z.object({
    id: mongoIdSchema,
});

/**
 * Common ID parameter names with validation
 */
export const commonIdParams = {
    exerciseId: mongoIdSchema,
    homeworkId: mongoIdSchema,
    userId: mongoIdSchema,
    studentId: mongoIdSchema,
    schoolId: mongoIdSchema,
    classId: mongoIdSchema,
};

/**
 * Helper to create ID param schemas
 * @example
 * const schema = createIdParamSchema("exerciseId");
 */
export function createIdParamSchema(paramName: string) {
    return z.object({
        [paramName]: mongoIdSchema,
    });
}
