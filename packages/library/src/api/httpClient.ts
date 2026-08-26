import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getFirebaseAuth } from "../config/firebase";
import { toast } from "react-toastify/unstyled";

// Singleton instance
let httpClientInstance: AxiosInstance | null = null;

// Configuration setter
let apiEndpoint = "http://localhost:8080/api"; // Default

export const setHttpClientConfig = (config: { apiEndpoint: string }) => {
    apiEndpoint = config.apiEndpoint;

    // Recreate instance with new config
    httpClientInstance = axios.create({
        baseURL: apiEndpoint,
        timeout: 300000,
        maxBodyLength: 10 * 1024 * 1024, // 10MB limit
        maxContentLength: 10 * 1024 * 1024, // 10MB limit
        headers: {
            "Content-Type": "application/json",
        },
    });

    // Request interceptor to add auth token
    httpClientInstance.interceptors.request.use(
        async function (config) {
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

    // Response interceptor for error handling
    httpClientInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (error.response?.data?.message) {
                error.message = error.response.data.message;
            }
            if (error.response?.status === 400) {
                toast.error("Bad request. Please check your input.");
            } else if (error.response?.status === 401) {
                toast.error("Unauthorized. Please login again.");
            } else if (error.response?.status === 500) {
                toast.error("Server error. Please try again later.");
            } else if (error.message === "Network Error") {
                toast.error("Network error. Please check your connection.");
            } else {
                toast.error("An error occurred. Please try again.");
            }
            return Promise.reject(error);
        }
    );
};

// Get http client instance
const getHttpClient = (): AxiosInstance => {
    if (!httpClientInstance) {
        setHttpClientConfig({ apiEndpoint }); // Initialize with default
    }
    return httpClientInstance!;
};

// Export as default using proxy for backward compatibility
const httpClient = new Proxy({} as AxiosInstance, {
    get(target, prop) {
        return getHttpClient()[prop as keyof AxiosInstance];
    },
});

// SWR-compatible fetchers
export const swrFetcher = {
    // GET requests
    get: async (url: string, config?: AxiosRequestConfig) => {
        const response = await getHttpClient().get(url, config);
        return response.data;
    },

    // POST requests (for SWR mutations)
    post: async (url: string, data: unknown, config?: AxiosRequestConfig) => {
        const response = await getHttpClient().post(url, data, config);
        return response.data;
    },

    // PUT requests
    put: async (url: string, data: unknown, config?: AxiosRequestConfig) => {
        const response = await getHttpClient().put(url, data, config);
        return response.data;
    },

    // DELETE requests
    delete: async (url: string, config?: AxiosRequestConfig) => {
        const response = await getHttpClient().delete(url, config);
        return response.data;
    },
};

export default httpClient;
