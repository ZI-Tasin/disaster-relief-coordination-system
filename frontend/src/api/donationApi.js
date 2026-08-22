import axios from "axios";

const API_URL =
  import.meta.env.VITE_DONATION_API_URL ||
  "https://disaster-relief-coordination-system-0z00.onrender.com/api/donations";

const api = axios.create({
  baseURL: API_URL,
});

// =====================================================
// CREATE STRIPE CHECKOUT SESSION
// =====================================================

export const createCheckoutSession = (data, token) =>
  api.post("/checkout", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// =====================================================
// GET LOGGED-IN USER'S DONATION HISTORY
// =====================================================

export const getMyDonations = (token) =>
  api.get("/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// =====================================================
// GET DONATION RECEIPT
// =====================================================

export const getDonationReceipt = (sessionId, token) =>
  api.get(`/receipt/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// =====================================================
// MARK CANCELLED DONATION AS FAILED
// =====================================================

export const cancelDonation = (sessionId, token) =>
  api.put(
    `/cancel/${sessionId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

export default api;
