import api from "./axios";

// Volunteer active mission
export const getMyMission = async () => {
  const { data } = await api.get("/stage-updates/mine");
  return data;
};

// Alias (keeps compatibility with other components)
export const getMission = getMyMission;

// Submit next stage update
export const submitStageUpdate = async (payload) => {
  const { data } = await api.post("/stage-updates", payload);
  return data;
};

// Alias (keeps compatibility)
export const submitStage = submitStageUpdate;

// Volunteer completed mission history
export const getHistory = async () => {
  const { data } = await api.get("/stage-updates/history");
  return data;
};

// Admin live stage feed
export const getStageFeed = async () => {
  const { data } = await api.get("/stage-updates/feed");
  return data;
};

// GET /api/stage-updates (health/list endpoint you added)
export const getStageUpdates = async () => {
  const { data } = await api.get("/stage-updates");
  return data;
};

export default {
  getMyMission,
  getMission,
  submitStageUpdate,
  submitStage,
  getHistory,
  getStageFeed,
  getStageUpdates,
};
