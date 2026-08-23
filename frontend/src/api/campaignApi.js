import api from "./axios";

export const getCampaigns = () => {
  return api.get("/campaigns");
};

export const getCampaign = (id) => {
  return api.get(`/campaigns/${id}`);
};

export const createCampaign = (data, token) => {
  return api.post("/campaigns", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateCampaign = (id, data, token) => {
  return api.put(`/campaigns/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteCampaign = (id, token) => {
  return api.delete(`/campaigns/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default api;
