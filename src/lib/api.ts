import axios, { AxiosInstance } from "axios";
import { BASE_URL } from "@/services/config";

export { BASE_URL };

// Module-level token storage
// This avoids calling getSession() on every request
let currentAccessToken: string | null = null;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Function to set the current auth token
// Called by AuthContext when session changes
export function setApiAuthToken(token: string | null) {
  currentAccessToken = token;
}

// Request interceptor - add auth header from stored token (sync, no network call)
api.interceptors.request.use(
  (config) => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log 401 errors for debugging, but let the app handle redirects
    // NextAuth's session management will handle token refresh
    if (error.response?.status === 401) {
      console.warn("API request received 401 - session may need refresh");
    }
    return Promise.reject(error);
  }
);

export default api;
