import api from "./axios";

export const createCheckoutSession = (data) => {
  return api.post("/donations/checkout", data);
};

export const getMyDonations = () => {
  return api.get("/donations/my");
};

export const getDonationReceipt = (sessionId) => {
  return api.get(`/donations/receipt/${sessionId}`);
};

export const cancelDonation = (sessionId) => {
  return api.put(`/donations/cancel/${sessionId}`);
};

export default api;
