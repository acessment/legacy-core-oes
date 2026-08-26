import { type RouteConfig, route, layout, index } from "@react-router/dev/routes";
//deploying catherine
export default [
    // Root index - Auth page
    index("routes/page/index-route.tsx"),

    // Catch Chrome DevTools and other well-known requests
    route(".well-known/*", "routes/page/well-known.tsx"),

    // Admin routes - layout first, then auth wrapper
    layout("routes/layout/adminLayout.tsx", [
        route("admin", "routes/layout/adminAuth.tsx", [
            index("routes/page/admin/home.tsx"),
            route("student/:id", "routes/page/admin/student-single.tsx"),
            route("document/:id", "routes/page/admin/document-single.tsx"),
            route("exercises", "routes/page/admin/exercises.tsx"),
            route("homework", "routes/page/admin/homework.tsx"),
            route("marking", "routes/page/admin/marking.tsx"),
            route("marking/:id/panel", "routes/page/admin/marking-panel.tsx"),
            route("settings", "routes/page/admin/settings.tsx"),
            route("generator", "routes/page/admin/generator.tsx"),
            route("accounts", "routes/page/admin/accounts.tsx"),
            route("audit-trail", "routes/page/admin/audit-trail.tsx"),
        ]),
    ]),

    // Teacher routes - layout first, then auth wrapper
    layout("routes/layout/teacherLayout.tsx", [
        route("teacher", "routes/layout/teacherAuth.tsx", [
            index("routes/page/teacher/index-route.tsx"),
            route("student/:id", "routes/page/teacher/student-single.tsx"),
            route("document/:id", "routes/page/teacher/document-single.tsx"),
            route("marking/:id/panel", "routes/page/teacher/marking-panel.tsx"),
            route("settings", "routes/page/teacher/settings.tsx"),
        ]),
    ]),

    // User routes - layout first, then auth wrapper
    layout("routes/layout/userLayout.tsx", [
        route("user", "routes/layout/userAuth.tsx", [
            index("routes/page/user/home.tsx"),
            route("homework", "routes/page/user/homework.tsx"),
            route("homework/:id", "routes/page/user/homework-single.tsx"),
            route("settings", "routes/page/user/settings.tsx"),
        ]),
    ]),

    // Admin API routes - admin role required
    //1

    route("api/exercise/:exerciseId", "routes/api/api.exercise.$exerciseId.tsx"),

    // Health check endpoint
    route("api/health", "routes/api/health.tsx"),

    route("api/auth/session", "routes/api/api.get-session.tsx"),
    route("api/auth/create-session", "routes/api/api.create-session.tsx"),
    route("api/auth/logout", "routes/api/api.logout.tsx"),

    // Update User Role
    route("api/users/role", "routes/api/api.user.role.tsx"),
] satisfies RouteConfig;
