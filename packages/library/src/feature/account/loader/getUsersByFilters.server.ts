import { LoaderFunctionArgs } from "react-router";
import User from "@/models/User";
import mongoose from "mongoose";
import { getUsersByFiltersSchema } from "../schemas/getUsersByFilters.schema";
import { IPagination } from "@/types";
import { RoleEnum } from "@/enum/RoleEnum";
import { teacherUserContext } from "@/middleware/teacherAuthMiddleware.server";
import { adminUserContext } from "@/middleware/adminAuthMiddleware.server";
/**
 * User filter type derived from the query parameters
 * This is the processed filter object used in the MongoDB query
 */
export type UserFilter = {
    status: string;
    classGroups: string[];
    keyword: string;
    grades: string[];
    schools: string[];
    subscriptions: string[];
};

/**
 * Pagination options type
 */
export type PaginationOptions = {
    page: number;
    limit: number;
};

/**
 * Find user summaries by various filters with pagination
 * @param filter - Filter parameters
 * @param options - Pagination options
 * @param currentUserId - Current user ID to exclude from results
 * @param currentUserRoles - Current user's roles to determine what roles to show
 * @returns Promise resolving to paginated user summaries in IPagination format
 */
async function findUserSummariesByFilters(
    filter: UserFilter,
    options: PaginationOptions,
    currentUserId?: string,
    currentUserRoles?: string[]
): Promise<IPagination<any>> {
    try {
        // PERFORMANCE OPTIMIZATION: Filter early with direct User collection queries
        const initialMatchConditions: any = {};

        // Role filtering based on current user's role:
        // - ADMIN can see TEACHER and USER roles
        // - TEACHER can see only USER role
        if (currentUserRoles?.includes(RoleEnum.ADMIN)) {
            // Admin sees teachers and users (not other admins)
            initialMatchConditions.roles = { $in: [RoleEnum.TEACHER, RoleEnum.USER] };
        } else if (currentUserRoles?.includes(RoleEnum.TEACHER)) {
            // Teacher sees only users
            initialMatchConditions.roles = RoleEnum.USER;
        } else {
            // Default: exclude admins
            initialMatchConditions.roles = { $nin: [RoleEnum.ADMIN] };
        }

        // Exclude current user from results
        if (currentUserId) {
            initialMatchConditions._id = { $ne: currentUserId };
        }

        if (filter.status) initialMatchConditions.status = filter.status;
        if (filter.grades && filter.grades.length > 0) initialMatchConditions.grade = { $in: filter.grades };
        if (filter.keyword) {
            initialMatchConditions.$or = [
                { username: { $regex: filter.keyword, $options: "i" } },
                { contact: { $regex: filter.keyword, $options: "i" } },
            ];
        }

        // Build pipeline with early filtering
        const pipeline: any[] = [{ $match: initialMatchConditions }];

        // Step 2: Add school filtering if needed
        if (filter.schools && filter.schools.length > 0) {
            pipeline.push(
                {
                    $lookup: {
                        from: "School",
                        localField: "schoolId",
                        foreignField: "_id",
                        as: "tempSchool",
                    },
                },
                {
                    $match: {
                        "tempSchool._id": {
                            $in: filter.schools.map((id) => new mongoose.mongo.ObjectId(id)),
                        },
                    },
                },
                { $project: { tempSchool: 0 } }
            );
        }

        // Step 3: Add class group filtering if needed
        if (filter.classGroups && filter.classGroups.length > 0) {
            pipeline.push(
                {
                    $lookup: {
                        from: "ClassGroup",
                        localField: "classGroupId",
                        foreignField: "_id",
                        as: "tempClassGroup",
                    },
                },
                {
                    $match: {
                        "tempClassGroup._id": { $in: filter.classGroups.map((id) => new mongoose.mongo.ObjectId(id)) },
                    },
                },
                { $project: { tempClassGroup: 0 } }
            );
        }

        // Step 4: Add subscription filtering if needed
        if (filter.subscriptions && filter.subscriptions.length > 0) {
            pipeline.push({
                $match: {
                    subscriptions: {
                        $elemMatch: {
                            status: { $in: ["active", "trialing", "wts_paid"] },
                            productIds: { $in: filter.subscriptions },
                        },
                    },
                },
            });
        }

        // Step 5: Get count efficiently before expensive operations
        const countPipeline = [...pipeline, { $count: "total" }];
        const countPromise = User.aggregate(countPipeline);

        // Step 6: Add pagination before expensive lookups
        // Sort by createdAt descending (newest first), fallback to _id if createdAt doesn't exist
        pipeline.push({ $sort: { createdAt: -1, _id: -1 } });
        pipeline.push({ $skip: (options.page - 1) * options.limit }, { $limit: options.limit });

        // Step 7: Now add the expensive homework lookup only for paginated results
        pipeline.push({
            $lookup: {
                from: "Homework",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$assignedStudentId", "$$userId"] },
                                    { $eq: [{ $type: "$submittedDate" }, "date"] },
                                ],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: "$assignedStudentId",
                            totalScore: { $sum: "$score" },
                            totalMaxScore: { $sum: "$maxScore" },
                            homeworkCount: { $sum: 1 },
                        },
                    },
                ],
                as: "homeworkStats",
            },
        });

        // Step 7b: Pending homework lookup (assigned but not submitted and not expired)
        pipeline.push({
            $lookup: {
                from: "Homework",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$assignedStudentId", "$$userId"] },
                                    { $ne: [{ $type: "$submittedDate" }, "date"] },
                                    { $gte: ["$expiryDate", "$$NOW"] },
                                ],
                            },
                        },
                    },
                    {
                        $count: "pendingCount",
                    },
                ],
                as: "pendingHomeworkStats",
            },
        });

        // Step 8: Add school and class group lookups for final data
        pipeline.push(
            {
                $lookup: {
                    from: "School",
                    localField: "schoolId",
                    foreignField: "_id",
                    as: "userSchool",
                },
            },
            {
                $unwind: {
                    path: "$userSchool",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "ClassGroup",
                    localField: "classGroupId",
                    foreignField: "_id",
                    as: "userClassGroup",
                },
            }
        );

        // Step 9: Final projection to match expected output format
        pipeline.push({
            $project: {
                id: "$_id",
                username: "$username",
                contact: "$contact",
                school: {
                    $cond: {
                        if: {
                            $or: [
                                { $eq: [{ $ifNull: ["$userSchool", null] }, null] },
                                { $eq: ["$userSchool._id", null] },
                            ],
                        },
                        then: null,
                        else: {
                            schoolId: { $toString: "$userSchool._id" },
                            name: "$userSchool.name",
                        },
                    },
                },
                grade: "$grade",
                classGroups: {
                    $map: {
                        input: { $ifNull: ["$userClassGroup", []] },
                        as: "group",
                        in: {
                            classGroupId: { $toString: "$$group._id" },
                            name: "$$group.name",
                        },
                    },
                },
                status: "$status",
                roles: "$roles",
                subscriptions: {
                    $map: {
                        input: {
                            $filter: {
                                input: "$subscriptions",
                                as: "sub",
                                cond: {
                                    $in: ["$$sub.status", ["active", "trialing", "wts_paid"]],
                                },
                            },
                        },
                        as: "sub",
                        in: {
                            productIds: "$$sub.productIds",
                            status: "$$sub.status",
                        },
                    },
                },
                submit_homework: {
                    $ifNull: [{ $arrayElemAt: ["$homeworkStats.homeworkCount", 0] }, 0],
                },
                pending_homework: {
                    $ifNull: [{ $arrayElemAt: ["$pendingHomeworkStats.pendingCount", 0] }, 0],
                },
                percentage_score: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: [{ $arrayElemAt: ["$homeworkStats.totalMaxScore", 0] }, 0] },
                                { $ne: [{ $arrayElemAt: ["$homeworkStats.totalMaxScore", 0] }, null] },
                            ],
                        },
                        then: {
                            $toInt: {
                                $multiply: [
                                    {
                                        $divide: [
                                            { $arrayElemAt: ["$homeworkStats.totalScore", 0] },
                                            { $arrayElemAt: ["$homeworkStats.totalMaxScore", 0] },
                                        ],
                                    },
                                    100,
                                ],
                            },
                        },
                        else: 0,
                    },
                },
            },
        });

        // Execute both count and main query
        const [countResult, results] = await Promise.all([countPromise, User.aggregate(pipeline)]);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        // Calculate pagination values
        const totalPages = Math.ceil(total / options.limit);
        const currentPageIndex = options.page - 1;
        const isFirst = options.page === 1;
        const isLast = options.page >= totalPages;
        const numberOfElements = results.length;
        const isEmpty = numberOfElements === 0;
        const offset = currentPageIndex * options.limit;

        // Return IPagination interface format
        return {
            content: results,
            pageable: {
                pageNumber: currentPageIndex,
                pageSize: options.limit,
                sort: { unsorted: true, sorted: false, empty: true },
                offset: offset,
                unpaged: false,
                paged: true,
            },
            totalPages: totalPages,
            totalElements: total,
            last: isLast,
            numberOfElements: numberOfElements,
            first: isFirst,
            size: options.limit,
            number: currentPageIndex,
            sort: { unsorted: true, sorted: false, empty: true },
            empty: isEmpty,
        };
    } catch (error) {
        console.error("Error in findUserSummariesByFilters:", error);
        throw error;
    }
}

/**
 * React Router loader for getting users by filters
 * Validates and sanitizes query parameters using Zod
 * REQUIRES teacherAuthMiddleware or adminAuthMiddleware to be applied to the route
 */
export async function getUsersByFiltersLoader({ request, context }: LoaderFunctionArgs): Promise<Response> {
    try {
        // Get authenticated user from context (set by teacherAuthMiddleware or adminAuthMiddleware)
        // Try both contexts since either middleware could be used
        let currentUser;
        try {
            currentUser = context?.get(teacherUserContext);
        } catch {
            try {
                currentUser = context?.get(adminUserContext);
            } catch {
                // Both failed, currentUser will be undefined
            }
        }

        if (!currentUser) {
            console.error(
                "❌ [getUsersByFiltersLoader] No authenticated user in context. Did you apply teacherAuthMiddleware or adminAuthMiddleware?"
            );
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        console.log(
            `✅ [getUsersByFiltersLoader] Processing request for user ${currentUser.id} with roles: ${currentUser.roles.join(", ")}`
        );

        // Extract and validate query parameters
        const url = new URL(request.url);
        const rawParams = {
            status: url.searchParams.get("status") || undefined,
            classGroups: url.searchParams.get("classGroups") || undefined,
            keyword: url.searchParams.get("keyword") || undefined,
            grades: url.searchParams.get("grades") || undefined,
            schools: url.searchParams.get("schools") || undefined,
            subscriptions: url.searchParams.get("subscriptions") || undefined,
            page: url.searchParams.get("page") || undefined,
            limit: url.searchParams.get("limit") || undefined,
        };

        // Validate and sanitize using Zod
        const validationResult = getUsersByFiltersSchema.safeParse(rawParams);

        if (!validationResult.success) {
            console.warn("❌ [getUsersByFiltersLoader] Validation failed:", validationResult.error);
            return new Response(
                JSON.stringify({
                    error: "Invalid query parameters",
                    details: validationResult.error.format(),
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const params = validationResult.data;

        // Build filter object
        let classGroupsFilter = params.classGroups ? params.classGroups.split(",").filter(Boolean) : [];

        // TEACHER ROLE FILTERING: If user is TEACHER (not ADMIN), restrict to their assigned classgroups
        if (currentUser.roles.includes(RoleEnum.TEACHER)) {
            console.log(`🔒 [getUsersByFiltersLoader] Applying teacher classgroup filter for user ${currentUser.id}`);

            // Fetch teacher's assigned classgroups
            const teacherDoc = await User.findById(currentUser.id).select("classGroupId").lean();

            if (!teacherDoc || !teacherDoc.classGroupId || teacherDoc.classGroupId.length === 0) {
                console.warn(`⚠️ [getUsersByFiltersLoader] Teacher ${currentUser.id} has no assigned classgroups`);
                // Return empty result if teacher has no classgroups
                return new Response(
                    JSON.stringify({
                        content: [],
                        totalPages: 0,
                        totalElements: 0,
                        last: true,
                        numberOfElements: 0,
                        first: true,
                        size: params.limit,
                        number: params.page,
                        sort: { unsorted: true, sorted: false, empty: true },
                        empty: true,
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            const teacherClassGroupIds = teacherDoc.classGroupId.map((id: { toString: () => any }) => id.toString());
            console.log(
                `📚 [getUsersByFiltersLoader] Teacher assigned to ${teacherClassGroupIds.length} classgroup(s): ${teacherClassGroupIds.join(", ")}`
            );

            // If teacher provided classgroup filter in query, intersect it with their assigned classgroups
            if (classGroupsFilter.length > 0) {
                classGroupsFilter = classGroupsFilter.filter((id) => teacherClassGroupIds.includes(id));
                console.log(
                    `🔍 [getUsersByFiltersLoader] Intersected filter: ${classGroupsFilter.length} classgroup(s)`
                );
            } else {
                // No filter provided, use all teacher's classgroups
                classGroupsFilter = teacherClassGroupIds;
            }

            // If after intersection there are no classgroups, return empty
            if (classGroupsFilter.length === 0) {
                console.warn(
                    `⚠️ [getUsersByFiltersLoader] No classgroups match teacher's assigned classgroups - returning empty result`
                );
                return new Response(
                    JSON.stringify({
                        content: [],
                        totalPages: 0,
                        totalElements: 0,
                        last: true,
                        numberOfElements: 0,
                        first: true,
                        size: params.limit,
                        number: params.page,
                        sort: { unsorted: true, sorted: false, empty: true },
                        empty: true,
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }
        }

        const filter: UserFilter = {
            status: params.status,
            classGroups: classGroupsFilter,
            keyword: params.keyword,
            grades: params.grades ? params.grades.split(",").filter(Boolean) : [],
            schools: params.schools ? params.schools.split(",").filter(Boolean) : [],
            subscriptions: params.subscriptions ? params.subscriptions.split(",").filter(Boolean) : [],
        };

        // Pagination options (page is 0-indexed in frontend, 1-indexed in backend)
        const options: PaginationOptions = {
            page: params.page + 1,
            limit: params.limit,
        };

        // Fetch users
        const users = await findUserSummariesByFilters(filter, options, currentUser.id, currentUser.roles);

        return new Response(JSON.stringify(users), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("❌ [getUsersByFiltersLoader] Error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
