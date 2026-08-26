import axios, { AxiosInstance } from "axios";
import { getFirebaseAuth } from "../config/firebase";
import { toast } from "react-toastify/unstyled";

// Singleton instance
let customAxiosInstance: AxiosInstance | null = null;

// Configuration setter (called by ConfigProvider or app setup)
let apiEndpoint = "http://localhost:8080/api"; // Default

export const setAxiosConfig = (config: { apiEndpoint: string }) => {
    apiEndpoint = config.apiEndpoint;

    // Recreate instance with new config
    customAxiosInstance = axios.create({
        baseURL: apiEndpoint,
        timeout: 300000,
        maxBodyLength: 10 * 1024 * 1024, // 10MB limit
        maxContentLength: 10 * 1024 * 1024, // 10MB limit
        headers: {
            "Content-Type": "application/json",
        },
    });

    customAxiosInstance.interceptors.request.use(
        async function (config) {
            // Use firebase auth token if available
            const auth = getFirebaseAuth();
            if (auth) {
                const user = auth.currentUser;
                const token = user ? await user.getIdToken() : null;
                if (token) {
                    config.headers["Authorization"] = "Bearer " + token;
                }
            }
            return config;
        },
        function (error) {
            return Promise.reject(error);
        }
    );

    customAxiosInstance.interceptors.response.use(
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
};

// Get axios instance (create default if not configured)
const getCustomAxios = (): AxiosInstance => {
    if (!customAxiosInstance) {
        setAxiosConfig({ apiEndpoint }); // Initialize with default
    }
    return customAxiosInstance!;
};

// Export as default for backward compatibility
const customAxios = new Proxy({} as AxiosInstance, {
    get(target, prop) {
        return getCustomAxios()[prop as keyof AxiosInstance];
    },
});

export default customAxios;
