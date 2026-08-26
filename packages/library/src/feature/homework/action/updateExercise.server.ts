import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import mongoose from "mongoose";
import Exercise from "../../../models/Exercise";
import { CategoryEnum } from "../../../enum/Category.enum";
import { Grade } from "../../../enum/Grade.enum";
import { s3Service } from "@/utils/s3Service.server";
import config from "@/config/config.server";
import { mongoIdSchema, safeJsonContentSchema } from "@/utils/mongoSecurity.server";
import { validateRequest } from "../utils/zodRequestValidator.server";
import { convertToHKTStartOfDay } from "@/feature/homework/utils/timezoneUtils.server.js";
import { withInputSanitization, type SanitizedActionInput } from "../../../middleware/inputSanitizer.server";

// Zod schema for params validation
const updateExerciseParamsSchema = z.object({
    exerciseId: mongoIdSchema,
});

// Zod schema for body validation
const updateExerciseBodySchema = z.object({
    title: z.string().min(1, "Title is required").max(500, "Title must be less than 500 characters"),
    grade: z.array(z.enum(Grade)),
    category: z.enum(CategoryEnum),
    content: safeJsonContentSchema, // Safe content with MongoDB operator protection
    welcomeExercise: z.boolean().optional().default(false),
    assignDate: z
        .string()
        .optional()
        .nullable()
        .transform((val) => {
            if (!val || typeof val !== "string") return null;
            const date = new Date(val);
            if (isNaN(date.getTime())) return null;
            // Convert to HKT start of day (00:00:00.000) for scheduler matching
            return convertToHKTStartOfDay(date);
        }),
    // Base64 with size limits to prevent DoS
    thumbnailSrc: z
        .string()
        .max(5 * 1024 * 1024, "Thumbnail size must be less than 5MB")
        .optional()
        .nullable(),
    audioSrc: z
        .string()
        .max(10 * 1024 * 1024, "Audio size must be less than 10MB")
        .optional()
        .nullable(),
    uploadPDFLibrary: z.boolean().optional(),
});

export type UpdateExerciseInput = z.infer<typeof updateExerciseBodySchema>;

/**
 * Update exercise action
 * Protected against NoSQL injection via input sanitization
 */
export const updateExerciseAction = withInputSanitization<ActionFunctionArgs>(
    async (args, sanitized: SanitizedActionInput): Promise<Response> => {
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            // Use sanitized params and body (MongoDB operators already stripped)
            const { params: validatedParams, body } = validateRequest({
                schema: {
                    bodySchema: updateExerciseBodySchema,
                    paramsSchema: updateExerciseParamsSchema,
                },
                reqBody: sanitized.body,
                reqParams: sanitized.params,
            });

            if (!validatedParams?.exerciseId || body == null) {
                return new Response(JSON.stringify({ error: "Exercise ID is required" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            // Update exercise using findOneAndUpdate
            const exercise = await Exercise.findOneAndUpdate(
                { _id: validatedParams.exerciseId },
                {
                    title: body.title,
                    grade: body.grade,
                    category: body.category,
                    content: body.content, // Already sanitized by safeJsonContentSchema
                    welcomeExercise: body.welcomeExercise,
                    assignDate: body.assignDate || undefined,
                },
                {
                    new: true, // Return the updated document
                    runValidators: true, // Run schema validators
                    session, // Use transaction session
                }
            );

            if (!exercise) {
                await session.abortTransaction();
                return new Response(JSON.stringify({ error: "Exercise not found" }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                });
            }

            // Commit transaction after database operations
            await session.commitTransaction();

            // Upload files (after transaction as S3 operations aren't transactional)
            if (body.thumbnailSrc) {
                let thumbnailBase64 = body.thumbnailSrc;
                if (thumbnailBase64.includes(",")) {
                    thumbnailBase64 = thumbnailBase64.split(",")[1];
                }
                await s3Service.uploadBase64(thumbnailBase64, config.exerciseThumbnailBasePath + exercise._id + ".png");
            }

            if (body.category === CategoryEnum.LISTENING && body.audioSrc) {
                let audioBase64 = body.audioSrc;
                if (audioBase64.includes(",")) {
                    audioBase64 = audioBase64.split(",")[1];
                }
                await s3Service.uploadBase64(audioBase64, config.exerciseAudioBasePath + exercise._id + ".mp3");
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Exercise updated successfully",
                    data: exercise.toJSON(),
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } catch (error) {
            await session.abortTransaction();
            console.error("Error updating exercise:", error);
            return new Response(
                JSON.stringify({
                    error: "Failed to update exercise",
                    message: error instanceof Error ? error.message : "Unknown error",
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } finally {
            session.endSession();
        }
    }
);
