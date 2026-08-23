import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://disaster-relief-coordination-system-0z00.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("API request timed out.");
    }

    if (!error.response) {
      console.error("Cannot connect to backend:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
