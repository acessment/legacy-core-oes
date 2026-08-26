/**
 * Server-only exports for @acessment/core-oes
 *
 * Import from "@acessment/core-oes/server" in server-side code only:
 * - React Router loaders and actions
 * - Server-side route modules
 * - Node.js environments
 *
 * DO NOT import this in client-side code!
 */

// Database utilities (server-only)
export { dbConnect, dbDisconnect } from "./database/mongoose.server";

// Server-side authentication utilities
export { requireAuth, requireRole, verifySession, isAuthenticated } from "./auth/auth.server";
export { getFirebaseAdmin } from "./auth/firebaseAdmin.server";

// PDF Library server exports
export { loader as pdfLibraryLoader } from "./feature/pdflibrary/loader/pdflibraryLoader.server";
export type { PDFLibraryLoaderData, PDFLibraryCardData } from "./feature/pdflibrary/loader/pdflibraryLoader.server";
export { singlePdfLoader } from "./feature/pdflibrary/loader/singlePdfLoader.server";
export type { SinglePDFLoaderData } from "./feature/pdflibrary/loader/singlePdfLoader.server";
export { audioAction } from "./feature/pdflibrary/action/audioAction.server";

// Payment server exports
export { subscriptionCheckLoader } from "./feature/payment/loader/subscriptionCheckLoader.server";
export { stripeWebhookHandler } from "./feature/payment/loader/stripeWebhook.server";
export type { WebhookResult } from "./feature/payment/loader/stripeWebhook.server";
export { PDFLibraryModel } from "./feature/pdflibrary/models/PDFLibrary";
export type { PDFLibraryDocument } from "./feature/pdflibrary/models/PDFLibrary";

// Payment/Subscription server exports
export { subscriptionLoader } from "./feature/payment/loader/subscriptionLoader.server";
export type { SubscriptionLoaderData } from "./feature/payment/loader/subscriptionLoader.server";
export { createCustomerSessionAction } from "./feature/payment/action/customerSession.server";
export { createCustomerPortalAction } from "./feature/payment/action/customerPortal.server";
export { syncRecentCheckouts, syncSingleCustomer } from "./feature/payment/utils/syncStripeMetadata.server";
export type { SyncResult } from "./feature/payment/utils/syncStripeMetadata.server";
export { initializeServer, initializeDB, initializeStripe } from "./feature/payment/utils/serverInit.server";

// Scheduler exports
export { initializeScheduler, triggerAutoAssignment } from "./config/scheduler.server";

// auth session actions
export { createSessionAction } from "./auth/createSession.server";
export { getSessionAction } from "./auth/getSession.server";
export { logoutAction } from "./auth/logout.server";

export {
    AutoAssignExercises,
    assignAutoExercisesForUser,
} from "./feature/homework/utils/autoHomeworkAssignment.server";
export type { AutoAssignmentResult } from "./feature/homework/utils/autoHomeworkAssignment.server";

// Rate limiting middleware
export { checkRateLimit, RateLimitPresets } from "./middleware/rateLimiter.server";
export type { RateLimitConfig } from "./middleware/rateLimiter.server";

// Input sanitization middleware (NoSQL injection prevention)
export {
    sanitizeObject,
    sanitizeMongoId,
    sanitizeSearchParams,
    sanitizeRouteParams,
    sanitizeRequestBody,
    sanitizeLoaderInput,
    sanitizeActionInput,
    withInputSanitization,
} from "./middleware/inputSanitizer.server";

// CSRF protection middleware (optional - for cookie-based auth)
export {
    generateCSRFToken,
    setCSRFCookie,
    getCSRFTokenFromCookie,
    getCSRFTokenFromRequest,
    verifyCSRFToken,
    withCSRFProtection,
    CSRF_CONFIG,
} from "./middleware/csrfProtection.server";

// Homework action/loader exports
export { updateExerciseAction } from "./feature/homework/action/updateExercise.server";
export type { UpdateExerciseInput } from "./feature/homework/action/updateExercise.server";
export { loader as getExercisesLoader } from "./feature/homework/loader/getExercises.server";

// Account action/loader exports
export { getUsersByFiltersLoader } from "./feature/account/loader/getUsersByFilters.server";
export { updateUserRoleAction } from "./feature/account/action/updateUserRole.server";
export type { UpdateUserRoleInput } from "./feature/account/action/updateUserRole.server";

// Subscription sync utilities
export {
    syncCreateSubscriptionToMongo,
    syncUpdateSubscriptionToMongo,
    deleteSubscriptionFromMongo,
    getActiveSubscriptionsFromMongo,
    syncRecentSubscriptions,
} from "./feature/payment/utils/syncSubscription.server";

// authorization middleware
export { adminAuthMiddleware } from "./middleware/adminAuthMiddleware.server";
export { authMiddleware } from "./middleware/authMiddleware.server";
export { teacherAuthMiddleware } from "./middleware/teacherAuthMiddleware.server";

export type { SubscriptionSyncResult } from "./feature/payment/utils/syncSubscription.server";
