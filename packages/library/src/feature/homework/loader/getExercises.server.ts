import { z } from "zod";
import Exercise from "../../../models/Exercise";
import { validateRequest } from "../utils/zodRequestValidator.server";
import { withInputSanitization } from "../../../middleware/inputSanitizer.server";

// Zod schema for query validation
const getExercisesQuerySchema = z.object({
    categories: z.string().optional(),
    grades: z.string().optional(),
    createdStartedAt: z.string().optional(),
    createdEndedAt: z.string().optional(),
    assignStartedAt: z.string().optional(),
    assignEndedAt: z.string().optional(),
    keyword: z.string().optional(),
    welcomeExercise: z.string().optional(),
    uploadPDFLibrary: z.string().optional(),
    page: z.string().optional().default("0"),
    size: z.string().optional().default("25"),
});

/**
 * Loader to get exercises with pagination and filtering (Remix style)
 * Protected against NoSQL injection via input sanitization
 */
export const loader = withInputSanitization(async (args, sanitized) => {
    // Use sanitized search params (MongoDB operators already stripped)
    const reqQuery = sanitized.searchParams;
    const { query } = validateRequest({
        schema: { querySchema: getExercisesQuerySchema },
        reqQuery,
    });
    console.log("Loader - Get Exercises - Query Params:", query);

    // Parse query parameters
    const filter: any = {};
    if (query?.categories) filter.categories = query.categories.split(",");
    if (query?.grades) filter.grades = query.grades.split(",");
    if (query?.createdStartedAt) filter.createdStartedAt = new Date(query.createdStartedAt);
    if (query?.createdEndedAt) filter.createdEndedAt = new Date(query.createdEndedAt);
    if (query?.assignStartedAt) filter.assignStartedAt = new Date(query.assignStartedAt);
    if (query?.assignEndedAt) filter.assignEndedAt = new Date(query.assignEndedAt);
    if (query?.keyword) filter.keyword = query.keyword;
    if (query?.welcomeExercise) filter.welcomeExercise = query.welcomeExercise === "true";
    if (query?.uploadPDFLibrary !== undefined) filter.uploadPDFLibrary = query.uploadPDFLibrary === "true";

    // Build query
    const dbQuery: any = {};
    if (filter.categories?.length) dbQuery.category = { $in: filter.categories };
    if (filter.grades?.length) dbQuery.grade = { $in: filter.grades };
    if (filter.createdStartedAt) dbQuery.createdAt = { $gte: filter.createdStartedAt };
    if (filter.createdEndedAt) {
        dbQuery.createdAt = {
            ...dbQuery.createdAt,
            $lte: filter.createdEndedAt,
        };
    }
    if (filter.assignStartedAt) dbQuery.assignDate = { $gte: filter.assignStartedAt };
    if (filter.assignEndedAt) {
        dbQuery.assignDate = {
            ...dbQuery.assignDate,
            $lte: filter.assignEndedAt,
        };
    }
    if (filter.welcomeExercise) dbQuery.welcomeExercise = filter.welcomeExercise;
    if (filter.uploadPDFLibrary !== undefined) {
        // When false, include documents where the field is false OR doesn't exist
        dbQuery.uploadPDFLibrary = filter.uploadPDFLibrary ? true : { $in: [false, null] };
    }
    if (filter.keyword) dbQuery.title = { $regex: filter.keyword, $options: "i" };

    const page = Number(query?.page) || 0;
    const size = Number(query?.size) || 25;
    const skip = page * size;
    const totalCount = await Exercise.countDocuments(dbQuery);
    const exercises = await Exercise.find(dbQuery).sort({ createdAt: -1 }).skip(skip).limit(size);

    // Format response
    const totalPages = Math.ceil(totalCount / size);
    const response = {
        content: exercises.map((exercise: any) => ({
            id: exercise.id ?? exercise._id,
            title: exercise.title,
            grade: exercise.grade,
            category: exercise.category,
            createdAt: exercise.createdAt,
            assignDate: exercise.assignDate || null,
            uploadPDFLibrary: exercise.uploadPDFLibrary || false,
        })),
        pageable: {
            pageNumber: page,
            pageSize: size,
            sort: { unsorted: true, sorted: false, empty: true },
            offset: skip,
            unpaged: false,
            paged: true,
        },
        totalPages,
        totalElements: totalCount,
        last: page >= totalPages - 1,
        numberOfElements: exercises.length,
        first: page === 0,
        size,
        number: page,
        sort: { unsorted: true, sorted: false, empty: true },
        empty: exercises.length === 0,
    };

    return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
});
