import axios from "axios";

const API_URL =
  import.meta.env.VITE_CAMPAIGN_API_URL ||
  "https://disaster-relief-coordination-system-0z00.onrender.com/api/campaigns";

const api = axios.create({
  baseURL: API_URL,
});

// Public
export const getCampaigns = () => api.get("/");
export const getCampaign = (id) => api.get(`/${id}`);

// Protected
export const createCampaign = (data, token) =>
  api.post("/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const updateCampaign = (id, data, token) =>
  api.put(`/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const deleteCampaign = (id, token) =>
  api.delete(`/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export default api;
