import api from "./axios";

export const registerRequest = (data) => {
  return api.post("/auth/register", data);
};

export const loginRequest = (data) => {
  return api.post("/auth/login", data);
};

export const logoutRequest = () => {
  return api.post("/auth/logout");
};

export default api;
