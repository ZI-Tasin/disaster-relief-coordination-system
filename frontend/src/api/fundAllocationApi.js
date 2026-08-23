import api from "./axios";

export const getFundAllocationDashboard = () =>
  api.get("/fund-allocations/dashboard");

export const getFundAllocations = () => api.get("/fund-allocations");

export const getCampaignAllocations = (campaignId) =>
  api.get(`/fund-allocations/campaign/${campaignId}`);

export const createFundAllocation = (data) =>
  api.post("/fund-allocations", data);

export const updateFundAllocation = (id, data) =>
  api.put(`/fund-allocations/${id}`, data);

export const deleteFundAllocation = (id) =>
  api.delete(`/fund-allocations/${id}`);
