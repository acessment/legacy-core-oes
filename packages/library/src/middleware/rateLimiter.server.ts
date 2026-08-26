/**
 * Simple in-memory rate limiter for critical endpoints
 * For production with multiple instances, consider Redis-based rate limiting
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Max requests per window
    keyPrefix?: string; // Optional prefix for the rate limit key
}

/**
 * Rate limiter middleware for React Router
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @returns Response if rate limited, null otherwise
 */
export function checkRateLimit(request: Request, config: RateLimitConfig): Response | null {
    const identifier = getClientIdentifier(request);
    const key = config.keyPrefix ? `${config.keyPrefix}:${identifier}` : identifier;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
        // Create new entry or reset expired entry
        entry = {
            count: 1,
            resetTime: now + config.windowMs,
        };
        rateLimitStore.set(key, entry);
        return null;
    }

    // Increment count
    entry.count++;

    if (entry.count > config.maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        return new Response(
            JSON.stringify({
                error: "Too many requests",
                message: "Rate limit exceeded. Please try again later.",
                retryAfter,
            }),
            {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    "Retry-After": retryAfter.toString(),
                    "X-RateLimit-Limit": config.maxRequests.toString(),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": new Date(entry.resetTime).toISOString(),
                },
            }
        );
    }

    return null;
}

/**
 * Get client identifier from request (IP address or fallback to user agent)
 */
function getClientIdentifier(request: Request): string {
    // Try to get real IP from various headers (proxy-aware)
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
        return realIp;
    }

    const cfConnectingIp = request.headers.get("cf-connecting-ip");
    if (cfConnectingIp) {
        return cfConnectingIp;
    }

    // Fallback to user agent (less reliable but better than nothing)
    return request.headers.get("user-agent") || "unknown";
}

/**
 * Preset rate limit configs for common use cases
 */
export const RateLimitPresets = {
    // Strict limits for sensitive operations (e.g., auth, webhooks)
    STRICT: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
    },
    // Moderate limits for API endpoints
    MODERATE: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
    },
    // Generous limits for general use
    GENEROUS: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 1000,
    },
    // Very strict for cron jobs (should only be called by scheduler)
    CRON: {
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 1,
    },
};
