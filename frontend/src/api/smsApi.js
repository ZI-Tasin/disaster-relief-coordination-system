import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://disaster-relief-coordination-system-0z00.onrender.com/api/sms";

const api = axios.create({
  baseURL: API_URL,
});

// Send SMS broadcast
export const sendBroadcast = (data, token) =>
  api.post("/broadcast", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Get SMS logs
export const getSMSLogs = (token) =>
  api.get("/logs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Get SMS log by ID
export const getSMSLogById = (id, token) =>
  api.get(`/logs/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Get volunteers by district
export const getVolunteersByDistrict = (district, token) =>
  api.get(`/volunteers/${district}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export default api;
