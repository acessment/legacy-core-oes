import axios, { AxiosInstance } from "axios";
import { getFirebaseAuth } from "../config/firebase";
import { toast } from "react-toastify/unstyled";

// Configuration
const apiEndpoint = `/api`;

// Helper function to get CSRF token from cookie (client-side only)
function getCsrfToken(): string {
    if (typeof document === "undefined") return ""; // Server-side

    // Fallback to reading from cookie
    const allCookies = document.cookie;
    console.log("🍪 [reactRouterAxios] All cookies:", allCookies);

    const csrfToken =
        document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrf="))
            ?.split("=")[1] || "";

    console.log("🔑 [reactRouterAxios] CSRF token extracted:", csrfToken ? "[PRESENT]" : "[MISSING]");

    return csrfToken;
}

// Create axios instance
const reactRouterAxios: AxiosInstance = axios.create({
    baseURL: apiEndpoint,
    timeout: 300000,
    maxBodyLength: 10 * 1024 * 1024, // 10MB limit
    maxContentLength: 10 * 1024 * 1024, // 10MB limit
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add CSRF token dynamically
reactRouterAxios.interceptors.request.use(
    (config) => {
        // Add CSRF token on each request (only in browser)
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            config.headers["X-CSRF-Token"] = csrfToken;
        } else {
            console.warn("⚠️ No CSRF token found in cookies.");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

reactRouterAxios.interceptors.response.use(
    (r) => r,
    async (err) => {
        if (err.response?.status === 400) {
            if (err.response.data?.errors && Array.isArray(err.response.data.errors)) {
                err.response.data.errors.forEach((element: { defaultMessage?: string }) => {
                    if (element?.defaultMessage) {
                        toast.error(element.defaultMessage);
                    }
                });
            } else if (typeof err.response.data === "string") {
                toast.error(err.response.data);
            } else if (err.response.data?.message && typeof err.response.data.message === "string") {
                toast.error(err.response.data.message);
            } else {
                toast.error("An unexpected error occurred with the request (400).");
            }
        } else if (err.response?.status === 403) {
            if (typeof err.response.data === "string") {
                toast.error(err.response.data);
            } else if (err.response.data?.message && typeof err.response.data.message === "string") {
                toast.error(err.response.data.message);
            } else {
                toast.error("Please subscribe to access the resource.");
            }
        }
        return Promise.reject(err);
    }
);

export default reactRouterAxios;
