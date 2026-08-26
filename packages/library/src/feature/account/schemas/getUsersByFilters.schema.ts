import { z } from "zod";

/**
 * Zod schema for validating and sanitizing query parameters for getUsersByFilters
 */
export const getUsersByFiltersSchema = z.object({
    status: z.string().optional().default(""),
    classGroups: z.string().optional().default(""),
    keyword: z.string().optional().default(""),
    grades: z.string().optional().default(""),
    schools: z.string().optional().default(""),
    subscriptions: z.string().optional().default(""),
    page: z
        .string()
        .optional()
        .default("0")
        .transform((val) => parseInt(val, 10)),
    limit: z
        .string()
        .optional()
        .default("25")
        .transform((val) => parseInt(val, 10)),
});

/**
 * Inferred type from the Zod schema (after transformation)
 */
export type GetUsersByFiltersParams = z.infer<typeof getUsersByFiltersSchema>;
