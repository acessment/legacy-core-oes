import { AutoAssignExercises } from "../feature/homework/utils/autoHomeworkAssignment.server.js";

/**
 * Initialize scheduler (placeholder - actual scheduling done via Fly.io cron)
 *
 * NOTE: This app uses Fly.io's cron feature for scheduling instead of in-app node-cron.
 * Configure cron jobs in fly.toml:
 *
 * [[services.http_checks]]
 *   interval = "1d"
 *   timeout = "5s"
 *   grace_period = "5s"
 *   method = "get"
 *   path = "/api/cron/auto-assign"
 *   schedule = "59 15 * * *"  # 23:59 HKT (15:59 UTC) daily
 *
 * Or use Fly.io Machines API with scheduled runs.
 */
export const initializeScheduler = () => {
    console.log("⚠️  Scheduler initialization skipped - using Fly.io cron");
    console.log("ℹ️  Configure cron jobs in fly.toml or via Fly.io Machines API");
    console.log("ℹ️  Auto-assignment endpoint: /api/cron/auto-assign");
};

/**
 * Manually trigger auto-assignment
 * This is exposed as an API endpoint for Fly.io cron to call
 *
 * Usage: Create an API route that calls this function
 * Example: /api/cron/auto-assign -> triggerAutoAssignment()
 */
export const triggerAutoAssignment = async () => {
    console.log("🚀 Manual trigger: Auto-assignment job");
    console.log("⏰ Starting auto-assignment at:", new Date().toISOString());

    try {
        const result = await AutoAssignExercises();

        if (result.success) {
            console.log(`✅ Auto-assignment completed successfully`, result);
        } else {
            console.log(`⚠️  Auto-assignment completed with issues`, result);
        }

        return result;
    } catch (error) {
        console.log(`❌ Auto-assignment failed:`, error);
        throw error;
    }
};
