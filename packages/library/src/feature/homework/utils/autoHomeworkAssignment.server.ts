import { PaymentStatusEnum } from "../../../enum/PaymentStatus.enum.js";
import mongoose from "mongoose";
import Exercise from "@/models/Exercise.js";
import Homework from "@/models/Homework.js";
import User from "@/models/User.js";
import AuditTrail from "@/models/AuditTrail.js";
import { AuditEntityType } from "@/enum/AuditEntityType.enum.ts";
import { AuditActionType } from "@/enum/AuditActionType.enum.ts";
import { getHKTStartAndEndOfDay, getSundayEndOfWeek } from "@/feature/homework/utils/timezoneUtils.server.js";

export interface AutoAssignmentResult {
    success: boolean;
    exercisesProcessed: number;
    homeworkCreated: number;
    usersAffected: number;
    errors: string[];
}

/**
 * Auto-assign exercises to subscribed users
 * Runs daily at 00:00
 */
export const AutoAssignExercises = async (): Promise<AutoAssignmentResult> => {
    const startTime = Date.now();
    const result: AutoAssignmentResult = {
        success: false,
        exercisesProcessed: 0,
        homeworkCreated: 0,
        usersAffected: 0,
        errors: [],
    };

    try {
        console.log("Starting auto-assignment job...");

        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            // Get today's date range in HKT (cron runs at 00:00, assigns today's exercises)
            const { startOfDay: todayStart, endOfDay: todayEnd } = getHKTStartAndEndOfDay();

            console.log(
                `Checking for exercises with assignDate between ${todayStart.toISOString()} and ${todayEnd.toISOString()}`
            );

            // Find exercises with assignDate set to TODAY
            const exercisesToAssign = await Exercise.find({
                assignDate: {
                    $gte: todayStart,
                    $lte: todayEnd,
                },
            }).session(session);

            result.exercisesProcessed = exercisesToAssign.length;

            if (exercisesToAssign.length === 0) {
                console.log("No exercises to auto-assign today");
                await session.commitTransaction();
                result.success = true;
                return result;
            }

            console.log(`Found ${exercisesToAssign.length} exercises to auto-assign`);

            // Find all active subscribed users
            const subscribedUsers = await User.find({
                "subscriptions.status": {
                    $in: [PaymentStatusEnum.ACTIVE, PaymentStatusEnum.TRIALING, PaymentStatusEnum.WTS_PAID],
                },
            })
                .select("_id username schoolId grade subscriptions")
                .lean()
                .session(session);

            // Build user map with active subscription check and grade
            const activeUsersMap = new Map<string, { username: string; grade: string; schoolId?: any }>();
            const threeInOnePlanId = process.env.THREE_IN_ONE_PLAN_ID!;
            subscribedUsers.forEach((user) => {
                const hasActiveSubscription = user.subscriptions?.some(
                    (sub: { productIds: (string | undefined)[]; status: PaymentStatusEnum }) =>
                        sub.productIds.includes(process.env.THREE_IN_ONE_PLAN_ID) &&
                        (sub.status === PaymentStatusEnum.ACTIVE ||
                            sub.status === PaymentStatusEnum.TRIALING ||
                            sub.status === PaymentStatusEnum.WTS_PAID)
                );
                if (hasActiveSubscription) {
                    activeUsersMap.set(String(user._id), {
                        username: user.username,
                        grade: user.grade || "",
                        schoolId: user.schoolId,
                    });
                }
            });

            result.usersAffected = activeUsersMap.size;

            if (activeUsersMap.size === 0) {
                console.log("No active subscribed users found");
                await session.commitTransaction();
                result.success = true;
                return result;
            }

            console.log(`Found ${activeUsersMap.size} active subscribed users`);

            // Create homework assignments with grade filtering
            const homeworkList: any[] = [];
            for (const exercise of exercisesToAssign) {
                // Filter users by matching grade
                for (const [userId, userData] of activeUsersMap.entries()) {
                    // Check if user's grade matches any of the exercise's grades
                    const gradeMatches = exercise.grade.includes(userData.grade as any);

                    if (!gradeMatches) {
                        continue; // Skip this user if grade doesn't match
                    }

                    homeworkList.push({
                        title: exercise.title,
                        assignedStudentId: userId,
                        assignedTeacherId: "system", // System-assigned
                        // today at 00:00 HKT
                        startDate: new Date(todayStart),
                        expiryDate: getSundayEndOfWeek(new Date(todayStart)), // Sunday of the same week at 23:59:59.999 HKT
                        exerciseId: String(exercise._id),
                        username: userData.username,
                        category: exercise.category,
                        grade: exercise.grade,
                        isDemoHomework: false,
                    });
                }
            }

            if (homeworkList.length > 0) {
                console.log(`Creating ${homeworkList.length} homework assignments...`);
                const insertedHomeworks = await Homework.insertMany(homeworkList, { session });
                result.homeworkCreated = insertedHomeworks.length;

                // Audit trail for bulk insert (one audit record for the batch)
                await AuditTrail.create(
                    [
                        {
                            actionBy: "system",
                            entityType: AuditEntityType.HOMEWORK,
                            actionType: AuditActionType.CREATE,
                            action: `Auto-assigned ${insertedHomeworks.length} homeworks to ${activeUsersMap.size} users`,
                        },
                    ],
                    { session }
                );
            }

            await session.commitTransaction();
            result.success = true;

            const duration = Date.now() - startTime;
            console.log(
                `Auto-assignment completed in ${duration}ms: ${result.exercisesProcessed} exercises, ${result.homeworkCreated} homework created for ${result.usersAffected} users`
            );
        } catch (error: any) {
            await session.abortTransaction();
            result.errors.push(error.message || String(error));
            console.error(`Auto-assignment transaction error: ${error}`);
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error: any) {
        result.errors.push(error.message || String(error));
        console.error(`Auto-assignment job failed: ${error}`);
    }

    return result;
};

/**
 * Assign auto-assigned exercises for a specific user (previous day and today)
 * Used when a new user subscribes or when manually triggering assignment
 *
 * @param userId - The user ID to assign exercises to
 * @param userGrade - The user's grade
 * @param username - The user's username
 * @returns AutoAssignmentResult
 */
export const assignAutoExercisesForUser = async (
    userId: string,
    userGrade: string,
    username: string
): Promise<AutoAssignmentResult> => {
    const startTime = Date.now();
    const result: AutoAssignmentResult = {
        success: false,
        exercisesProcessed: 0,
        homeworkCreated: 0,
        usersAffected: 1,
        errors: [],
    };

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        console.log(`Assigning auto-exercises for user ${userId} (${username}), grade: ${userGrade}`);

        // Get today and yesterday's date range in HKT
        // For new subscribers, we assign exercises from yesterday and today
        const { startOfDay: todayStart, endOfDay: todayEnd } = getHKTStartAndEndOfDay();
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1); // Yesterday 00:00

        console.log(`Checking for exercises from ${yesterdayStart.toISOString()} to ${todayEnd.toISOString()}`);

        // Find exercises with assignDate for yesterday and today
        const exercisesToAssign = await Exercise.find({
            assignDate: {
                $gte: yesterdayStart,
                $lte: todayEnd,
            },
            grade: userGrade, // Filter by user's grade
        }).session(session);

        result.exercisesProcessed = exercisesToAssign.length;

        if (exercisesToAssign.length === 0) {
            console.log(`No auto-assigned exercises found for user ${userId} (grade: ${userGrade})`);
            await session.commitTransaction();
            result.success = true;
            return result;
        }

        console.log(`Found ${exercisesToAssign.length} exercises to assign to user ${userId}`);

        // Create homework assignments
        const homeworkList: any[] = [];
        for (const exercise of exercisesToAssign) {
            // Check if homework already exists for this user and exercise
            const existingHomework = await Homework.findOne({
                assignedStudentId: userId,
                exerciseId: String(exercise._id),
            }).session(session);

            if (existingHomework) {
                console.log(`Homework already exists for user ${userId}, exercise ${exercise._id}`);
                continue; // Skip if already assigned
            }

            homeworkList.push({
                title: exercise.title,
                assignedStudentId: userId,
                assignedTeacherId: "system", // System-assigned
                // today at 00:00 HKT
                startDate: new Date(todayStart),
                expiryDate: getSundayEndOfWeek(new Date(todayStart)), // Sunday of the same week at 23:59:59.999 HKT
                exerciseId: String(exercise._id),
                username: username,
                category: exercise.category,
                grade: exercise.grade,
                isDemoHomework: false,
            });
        }

        if (homeworkList.length > 0) {
            console.log(`Creating ${homeworkList.length} homework assignments for user ${userId}...`);
            const insertedHomeworks = await Homework.insertMany(homeworkList, { session });

            // Audit trail for user assignment (one audit record per user assignment batch)
            await AuditTrail.create(
                [
                    {
                        actionBy: "system",
                        entityType: AuditEntityType.HOMEWORK,
                        actionType: AuditActionType.CREATE,
                        action: `Auto-assigned ${insertedHomeworks.length} homeworks to user ${userId} (${username})`,
                    },
                ],
                { session }
            );
        }

        await session.commitTransaction();
        result.success = true;

        const duration = Date.now() - startTime;
        console.log(
            `User assignment completed in ${duration}ms: ${result.exercisesProcessed} exercises found, ${result.homeworkCreated} homework created for user ${userId}`
        );
    } catch (error: any) {
        await session.abortTransaction();
        result.errors.push(error.message || String(error));
        console.error(`User assignment error for ${userId}: ${error}`);
    } finally {
        session.endSession();
    }

    return result;
};
