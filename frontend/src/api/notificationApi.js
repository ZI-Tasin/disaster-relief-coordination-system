import axios from "axios";

const API_URL =
  import.meta.env.VITE_NOTIFICATION_API_URL ||
  "https://disaster-relief-coordination-system-kmf2.onrender.com/api/notifications";

const api = axios.create({
  baseURL: API_URL,
});

// Admin - Create alert configuration draft
export const createNotification = (data, token) =>
  api.post("/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export default api;
