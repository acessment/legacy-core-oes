import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext, RouterContextProvider } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import { initializeDB } from "@/feature/payment/utils/serverInit.server";

// Initialize server on module load (runs once on startup)
if (typeof process !== "undefined") {
    // Initialize database only (no Stripe for catherine)
    initializeDB().catch((error) => {
        console.error("❌ Database initialization failed:", error);
    });
}

export const streamTimeout = 5_000;

// CORS configuration - Use server-side env vars (not VITE_ prefixed)
const ALLOWED_ORIGINS = [process.env.REACT_BASE_URL || "http://localhost:3000"];

function setSecurityHeaders(headers: Headers, origin: string | null) {
    // CORS headers - Only allow specific origins
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Access-Control-Allow-Credentials", "true");
    }
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Max-Age", "86400"); // 24 hours

    // Build connect-src based on environment
    const isDevelopment = process.env.NODE_ENV === "development";
    const apiEndpoint = (process.env.API_ENDPOINT || process.env.VITE_API_ENDPOINT || "")
        .trim()
        .replace(/[\r\n\t]/g, "");

    const connectSrc = [
        "'self'",
        isDevelopment ? "http://localhost:8080" : "", // Local API server
        isDevelopment ? "ws://localhost:*" : "", // WebSocket for HMR
        "https://firebase.googleapis.com",
        "https://identitytoolkit.googleapis.com", // Firebase Auth
        "https://securetoken.googleapis.com", // Firebase tokens
        apiEndpoint, // Production/Development API
    ]
        .filter(Boolean)
        .join(" ");

    // Security headers
    headers.set(
        "Content-Security-Policy",
        "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://js.stripe.com; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: https: blob:; " +
            "media-src 'self' data: blob: https://inst-acessment-dev.s3.us-west-2.amazonaws.com https://inst-acessment-uat.s3.us-west-2.amazonaws.com https://inst-acessment.s3.us-west-2.amazonaws.com; " +
            `connect-src ${connectSrc}; ` +
            "frame-src 'self' https://js.stripe.com;"
    );
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("X-XSS-Protection", "1; mode=block");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    // Remove server information
    headers.delete("X-Powered-By");
}

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    entryContext: EntryContext,
    routerContext: RouterContextProvider
    // loadContext: AppLoadContext
    // If you have middleware enabled:
    // loadContext: RouterContextProvider
) {
    const origin = request.headers.get("origin");

    // Set security and CORS headers
    setSecurityHeaders(responseHeaders, origin);

    // Request size validation (10MB limit)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: "Request payload too large" }), {
            status: 413,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Handle OPTIONS preflight requests
    if (request.method.toUpperCase() === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: responseHeaders,
        });
    }

    // https://httpwg.org/specs/rfc9110.html#HEAD
    if (request.method.toUpperCase() === "HEAD") {
        return new Response(null, {
            status: responseStatusCode,
            headers: responseHeaders,
        });
    }

    return new Promise((resolve, reject) => {
        let shellRendered = false;
        let userAgent = request.headers.get("user-agent");

        // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
        // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
        let readyOption: keyof RenderToPipeableStreamOptions =
            (userAgent && isbot(userAgent)) || entryContext.isSpaMode ? "onAllReady" : "onShellReady";

        const { pipe, abort } = renderToPipeableStream(<ServerRouter context={entryContext} url={request.url} />, {
            [readyOption]() {
                shellRendered = true;
                const body = new PassThrough();
                const stream = createReadableStreamFromReadable(body);

                responseHeaders.set("Content-Type", "text/html");

                resolve(
                    new Response(stream, {
                        headers: responseHeaders,
                        status: responseStatusCode,
                    })
                );

                pipe(body);
            },
            onShellError(error: unknown) {
                reject(error);
            },
            onError(error: unknown) {
                responseStatusCode = 500;
                // Log streaming rendering errors from inside the shell. Don't log
                // errors encountered during initial shell rendering since they'll
                // reject and get logged in handleDocumentRequest.
                if (shellRendered) {
                    console.error(error);
                }
            },
        });
    });
}
