import { LoaderFunctionArgs } from "react-router";
import { getUsersByFiltersLoader, teacherAuthMiddleware } from "@/server";

/**
 * API endpoint for fetching filtered and paginated users
 * Protected by teacherAuthMiddleware - requires TEACHER or ADMIN role
 *
 * Query parameters:
 * - status: User status filter
 * - classGroups: Comma-separated class group IDs
 * - keyword: Search keyword for username/contact
 * - grades: Comma-separated grade values
 * - schools: Comma-separated school IDs
 * - subscriptions: Comma-separated subscription product IDs
 * - page: Page number (0-indexed)
 * - limit: Items per page
 */
export const middleware = [teacherAuthMiddleware];

export async function loader(args: LoaderFunctionArgs) {
    return getUsersByFiltersLoader(args);
}
