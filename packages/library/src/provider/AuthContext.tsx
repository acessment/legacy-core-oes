// AuthProvider.js
import {
    onAuthStateChanged,
    signInWithCustomToken,
    signInWithEmailAndPassword,
    signOut,
    UserCredential,
} from "firebase/auth";
import { createContext, useEffect, useMemo, useState, ReactNode, useRef } from "react";
import { getFirebaseAuth } from "../config/firebase";
import { ICurrentUser } from "./types";
import { removeJwt } from "../utils/JwtHandler";
import { getCurrentUser, logout } from "../api/Api";
import { toast } from "react-toastify/unstyled";
import axios from "axios";
import { useConfig } from "@/provider/ConfigProvider";
import reactRouterAxios from "@/api/reactRouterAxios";

// Helper to read a cookie by name (returns empty string if not found)
function getCookie(name: string) {
    if (typeof document === "undefined") return "";

    const cookies = document.cookie.split("; ");
    const cookie = cookies.find((row) => row.startsWith(`${name}=`));

    if (!cookie) {
        console.log(`🍪 [getCookie] Cookie '${name}' not found. Available cookies:`, document.cookie);
        return "";
    }

    const value = cookie.split("=")[1];
    return value ? decodeURIComponent(value) : "";
}

// Helper to clear a cookie by setting it to empty with past expiration
function clearCookie(name: string, domain?: string) {
    if (typeof document === "undefined") return;

    const isProduction = window.location.hostname.includes("acessment.ai");
    const secureFlag = isProduction ? "Secure; " : "";
    const hostname = window.location.hostname;

    console.log(`🧹 [clearCookie] Clearing cookie '${name}' from current subdomain: ${hostname}`);

    // Clear cookie for current subdomain only (no domain attribute)
    // This clears cookies set without a domain attribute
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${secureFlag}SameSite=Lax`;
}

// Helper to clear all session-related cookies
function clearSessionCookies() {
    const cookiesToClear = [
        "session",
        "connect.sid",
        "sessionId",
        "csrf",
        "XSRF-TOKEN",
        "auth",
        "token",
        "access_token",
        "refresh_token",
        "id_token",
        "__session",
    ];

    // Clear for current domain
    cookiesToClear.forEach((name) => clearCookie(name));

    // For production, also clear explicitly for .acessment.ai domain
    const isProduction = typeof window !== "undefined" && window.location.hostname.includes("acessment.ai");
    if (isProduction) {
        cookiesToClear.forEach((name) => clearCookie(name, ".acessment.ai"));
    }

    // Clear localStorage and sessionStorage
    try {
        if (typeof window !== "undefined") {
            // Clear auth-related items from localStorage
            const authKeys = ["authToken", "jwt", "user", "firebaseUser", "session"];
            authKeys.forEach((key) => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });
        }
    } catch (error) {
        console.warn("Error clearing local/session storage:", error);
    }
}

// Helper to create a hash/fingerprint of session cookies
function getCookieHash(): string {
    if (typeof document === "undefined") return "";

    // Get critical session cookies
    const csrf = getCookie("csrf") || getCookie("XSRF-TOKEN");
    const session = getCookie("session") || getCookie("connect.sid");

    // Create a simple hash/fingerprint
    return `${csrf}|${session}`;
}

// Credentials type
type ICredentials = {
    email: string;
    password: string;
};

// Exported interface for the auth context — keep this stable so multiple
// implementations can satisfy the same contract.
export interface IAuthContext {
    createUser: (data: ICredentials) => Promise<UserCredential> | Promise<undefined>;
    loginUser: (data: ICredentials) => Promise<void> | Promise<undefined>;
    logOut: () => Promise<void> | Promise<undefined>;
    user: ICurrentUser | null;
    loading: boolean;
}

export const AuthContext = createContext<IAuthContext>({} as IAuthContext);

const SessionAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<ICurrentUser | null>(null);
    const [loading, setLoading] = useState(true); // Start as true until auth check completes
    const appConfigs = useConfig();

    // Track cookie state for detecting session changes
    const cookieHashRef = useRef<string>("");
    const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // no real user creation; session is handled server-side
    const createUser = async (data: ICredentials) => {
        // Mock doesn't create real users; return undefined-compatible promise
        console.warn("Mock createUser called", data);
        return Promise.resolve(undefined as unknown as UserCredential);
    };

    // catherine version login
    const loginUser = async (data: ICredentials) => {
        const { email, password } = data;
        try {
            // Clear all old session cookies BEFORE login to ensure clean state
            console.log("🧹 [loginUser] Clearing old session cookies before login...");

            await reactRouterAxios.post(`/auth/logout`);

            const auth = getFirebaseAuth();
            if (!auth) throw new Error("Firebase not configured");

            await signInWithEmailAndPassword(auth, email, password);

            const firebaseUser = auth.currentUser;
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                //create session on server side using the token
                // Session cookies are set by the server in response to this request
                const requestBody = {
                    username: email,
                    idToken: token,
                };
                const sessionres = await reactRouterAxios.post(`/auth/create-session`, requestBody);

                console.log("✅ [loginUser] Session created, new CSRF token:", sessionres.data.csrfToken);

                //check session then auth the firebase
                // Use the new CSRF token explicitly in the header
                const sessionRes = await reactRouterAxios.post(
                    `/auth/session`,
                    {},
                    {
                        headers: {
                            "X-CSRF-Token": sessionres.data.csrfToken,
                        },
                    }
                );

                if (sessionRes.status !== 200 || !sessionRes.data?.token) {
                    throw new Error("Session creation failed");
                }

                const customToken = sessionRes.data.token;
                await signInWithCustomToken(auth, customToken);

                const res = await getCurrentUser();
                setUser(res.data);
            } else {
                console.error("No user is currently signed in.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            
            // Extract error details
            const errorCode = (error as any)?.code;
            const errorMessage = (error as any)?.message;
            const status = (error as any)?.response?.status;
            
            // Provide specific error messages based on error type
            let userMessage = "Login failed. Please try again.";
            
            // Firebase Authentication errors
            if (errorCode) {
                switch (errorCode) {
                    case "auth/invalid-email":
                        userMessage = "Invalid email address format.";
                        break;
                    case "auth/user-disabled":
                        userMessage = "This account has been disabled. Please contact support.";
                        break;
                    case "auth/user-not-found":
                        userMessage = "No account found with this email.";
                        break;
                    case "auth/wrong-password":
                        userMessage = "Incorrect password.";
                        break;
                    case "auth/invalid-credential":
                        userMessage = "Invalid email or password.";
                        break;
                    case "auth/too-many-requests":
                        userMessage = "Too many failed login attempts. Please try again later.";
                        break;
                    case "auth/network-request-failed":
                        userMessage = "Network error. Please check your connection.";
                        break;
                    case "ECONNREFUSED":
                    case "ETIMEDOUT":
                    case "ENOTFOUND":
                        userMessage = `Connection error (${errorCode}). Please try again.`;
                        break;
                    default:
                        if (errorCode.startsWith("auth/")) {
                            userMessage = `Authentication error: ${errorCode.replace("auth/", "")}`;
                        } else {
                            userMessage = `Error: ${errorCode}. Please try again.`;
                        }
                }
            }
            // Session creation or server errors
            else if (status) {
                switch (status) {
                    case 401:
                        userMessage = "Authentication failed. Please check your credentials.";
                        break;
                    case 403:
                        userMessage = "Access forbidden. Your account may not have permission to log in.";
                        break;
                    case 500:
                        userMessage = "Server error. Please try again later.";
                        break;
                    case 502:
                    case 503:
                    case 504:
                        userMessage = `Service temporarily unavailable (${status}). Please try again in a moment.`;
                        break;
                    default:
                        userMessage = `Login failed (${status}). Please try again.`;
                }
            }
            // Session creation failed
            else if (errorMessage?.includes("Session creation failed")) {
                userMessage = "Failed to create session. Please try logging in again.";
            }
            // Firebase not configured
            else if (errorMessage?.includes("Firebase not configured")) {
                userMessage = "Authentication system error. Please contact support.";
            }
            
            toast.error(userMessage);
            setUser(null); // Clear user if fetching extended data fails
            removeJwt(); // Clear JWT if there's an error
        }
    };

    const logOut = async () => {
        console.log("Logging out from session auth provider");

        // Always clear user state first
        setUser(null);

        try {
            // Step 1: Call backend logout API FIRST (while CSRF cookie still exists)
            try {
                await reactRouterAxios.post(`/auth/logout`);
                console.log("✅ Backend logout successful");
            } catch (logoutError) {
                console.warn("⚠️ Backend logout failed:", logoutError);
                // Continue with cleanup even if backend logout fails
            }

            // Step 2: Clear cookies on client side
            clearSessionCookies();

            const auth = getFirebaseAuth();

            // Step 3: Sign out from Firebase (if configured)
            if (auth) {
                try {
                    await signOut(auth);
                    console.log("✅ Firebase signout successful");
                } catch (firebaseError) {
                    console.warn("⚠️ Firebase signout failed:", firebaseError);
                    // Continue with cleanup even if Firebase fails
                }
            }

            // // Step 4: Redirect to auth domain
            // const returnUrl = encodeURIComponent(window.location.href);
            // window.location.href = `${appConfigs.viteAuthDomain}?redirectTo=${returnUrl}`;
        } catch (error) {
            console.error("❌ Error during logout process:", error);

            // Ensure cleanup happens even if other steps fail
            clearSessionCookies();

            // Still attempt redirect as fallback
            try {
                const returnUrl = encodeURIComponent(window.location.href);
                window.location.href = `${appConfigs.viteAuthDomain}?redirectTo=${returnUrl}`;
            } catch (redirectError) {
                console.error("❌ Failed to redirect to auth domain:", redirectError);
            }
        }
    };

    const authValue: IAuthContext = useMemo(
        () => ({
            createUser,
            loginUser,
            logOut,
            user,
            loading,
        }),
        [user, loading]
    );

    useEffect(() => {
        const auth = getFirebaseAuth();
        if (!auth) {
            setLoading(false);
            return;
        }

        // Setup axios interceptor to handle token expiry (401 errors)
        // const interceptorId = axios.interceptors.response.use(
        //     (response) => response,
        //     async (error) => {
        //         if (error.response?.status === 401) {
        //             console.warn("⚠️ 401 error detected - Session expired, triggering re-authentication");
        //             // Sign out to trigger onAuthStateChanged and let useAuthRedirect handle redirect
        //             setUser(null);
        //             await signOut(auth);
        //         }
        //         return Promise.reject(error);
        //     }
        // );

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("🔔 onAuthStateChanged triggered");
            // handling the case where firebaseUser is null, or redirecting from auth page (3in1app and app)
            if (!firebaseUser) {
                try {
                    setLoading(true);
                    console.log("📡 No Firebase user, checking session with backend...");

                    // Check user session with server
                    const sessionRes = await reactRouterAxios.post(`/auth/session`);

                    if (sessionRes.status === 200 && sessionRes.data?.token) {
                        const token = sessionRes.data.token;
                        console.log("🔑 Got custom token, signing in with Firebase...");
                        // Sign in with custom token - this will trigger onAuthStateChanged again with firebaseUser
                        await signInWithCustomToken(auth, token);
                        console.log("✅ signInWithCustomToken completed");
                        // Don't set user here - let the next onAuthStateChanged call handle it
                    } else {
                        // No valid session - just set state, let useAuthRedirect handle redirect
                        console.warn("❌ No valid session found - no token in response");
                        setUser(null);
                        setLoading(false);
                        return;
                    }
                } catch (error) {
                    // Session check failed - just set state, let useAuthRedirect handle redirect
                    console.error("❌ Session check failed:", error);
                    console.error("Error details:", {
                        message: error instanceof Error ? error.message : "Unknown error",
                        response: (error as any)?.response?.data,
                    });
                    setUser(null);
                    setLoading(false);
                    return;
                }
            } else {
                // Firebase user exists (either from persistence or after signInWithCustomToken)
                console.log("✅ Firebase user exists, checking session cookies...");

                try {
                    // Check for session cookies first to ensure they're still valid
                    const csrf = getCookie("csrf") || getCookie("XSRF-TOKEN");

                    console.log("🍪 Session cookie check with Firebase user:", {
                        csrf: csrf ? "Found" : "Not found",
                    });

                    // If no session-related cookies are present, Firebase user might be stale
                    if (!csrf) {
                        console.warn("❌ Firebase user exists but no session cookies found - signing out");
                        await signOut(auth);
                        setUser(null);
                        setLoading(false);
                        return;
                    }

                    // Validate session with server
                    const sessionRes = await reactRouterAxios.post(`/auth/session`);

                    console.log("📡 Session validation with Firebase user:", {
                        status: sessionRes.status,
                        hasToken: !!sessionRes.data?.token,
                        uid: firebaseUser.uid,
                        sessionUid: sessionRes.data?.uid,
                    });

                    if (sessionRes.status !== 200 || !sessionRes.data?.token) {
                        console.warn("❌ Session validation failed with Firebase user - signing out");
                        await signOut(auth);
                        setUser(null);
                        setLoading(false);
                        return;
                    }

                    // Check if session user ID matches Firebase user ID
                    const sessionUserId = sessionRes.data?.uid;
                    if (sessionUserId && sessionUserId !== firebaseUser.uid) {
                        console.warn(
                            `❌ UID mismatch detected: Firebase=${firebaseUser.uid}, Session=${sessionUserId}`
                        );
                        await signOut(auth);
                        setUser(null);
                        setLoading(false);
                        return;
                    }

                    console.log("✅ Session validated, fetching user data from backend...");
                    const res = await getCurrentUser();
                    console.log("✅ getCurrentUser success:", {
                        hasData: !!res.data,
                        userId: res.data?.id,
                        hasRoles: Array.isArray(res.data?.roles),
                        roles: res.data?.roles,
                    });
                    setUser(res.data);

                    // Store cookie hash after successful auth
                    cookieHashRef.current = getCookieHash();
                } catch (error) {
                    console.error("❌ Error validating session or fetching current user:", error);
                    console.error("Error details:", {
                        message: error instanceof Error ? error.message : "Unknown error",
                        response: (error as any)?.response?.data,
                    });

                    const status = (error as any)?.response?.status;
                    const errorCode = (error as any)?.code; // Network errors have codes like ECONNREFUSED, ETIMEDOUT
                    const isTransientError = status === 502 || status === 503 || status === 504; // Gateway/service errors

                    // Only log out for authentication errors, not infrastructure issues
                    if (status === 401 || status === 403) {
                        console.warn("❌ Authentication error - signing out Firebase user");
                        toast.error("Session expired or invalid. Please log in again.");
                        await signOut(auth);
                        setUser(null);
                    } else if (errorCode || isTransientError) {                        
                        // Show user-friendly toast message
                        const errorMessage = errorCode 
                            ? `Temporary connection issue (${errorCode}). Your session is still active.`
                            : `Service temporarily unavailable (${status}). Your session is still active.`;
                        
                        toast.warning(errorMessage, {
                            autoClose: 5000,
                        });
                        
                        // Keep user logged in, they're still authenticated
                        // The app will retry on next request
                    } else if (status === 500) {
                        console.warn("⚠️ Server error (500) - keeping user logged in, but data fetch failed");
                        toast.warning("Server error. Your session is active but some data may not load. Try refreshing.", {
                            autoClose: 7000,
                        });
                        
                        // Keep user logged in - they can retry
                    } else {
                        // For truly unknown errors, log out to be safe
                        console.warn("❌ Unexpected error - logging out user");
                        toast.error(`Session error${status ? ` (${status})` : ""}. Please log in again.`);
                        //setUser(null);
                    }
                }
                setLoading(false);
            }
        });

        return () => {
            unsubscribe();
            // axios.interceptors.response.eject(interceptorId);
        };
    }, []);

    // Periodic cookie hash validation - detects session changes from other tabs/subdomains
    useEffect(() => {
        const auth = getFirebaseAuth();
        if (!auth) return;

        validationIntervalRef.current = setInterval(async () => {
            // Only check if we have a Firebase user
            if (!auth.currentUser) return;

            const currentHash = getCookieHash();
            const previousHash = cookieHashRef.current;

            // If hash changed, cookies changed - session switched
            if (currentHash !== previousHash && previousHash !== "") {
                console.warn("🍪 Cookie hash changed - session switched, forcing re-auth");
                console.log(`Previous hash: ${previousHash}`);
                console.log(`Current hash: ${currentHash}`);

                cookieHashRef.current = ""; // Clear to prevent double-trigger
                await signOut(auth); // Triggers onAuthStateChanged → re-auth with new session
            }
        }, 10000); // Check every 10 seconds

        return () => {
            if (validationIntervalRef.current) {
                clearInterval(validationIntervalRef.current);
            }
        };
    }, []);

    return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

// Top-level provider that selects the concrete implementation. Consumers
// only depend on the `IAuthContext` interface and don't need to know which
// implementation is active.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <SessionAuthProvider>{children}</SessionAuthProvider>;
};

export default AuthProvider;
