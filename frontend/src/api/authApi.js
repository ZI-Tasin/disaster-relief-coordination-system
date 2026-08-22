import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://disaster-relief-coordination-system-0z00.onrender.com/api";

const api = axios.create({
  baseURL: `${API_URL}/auth`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerRequest = (data) => {
  return api.post("/register", data);
};

export const loginRequest = (data) => {
  return api.post("/login", data);
};

export const logoutRequest = () => {
  return api.post("/logout");
};

export default api;
