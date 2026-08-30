// frontend/src/utils/reportService.js
import API_BASE_URL from "../config/api";

const API_BASE = API_BASE_URL;

/**
 * Helper: Retrieve token and construct authorization headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Helper: Obtain browser geolocation wrapped in a Promise
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: Number(position.coords.latitude.toFixed(4)),
          longitude: Number(position.coords.longitude.toFixed(4)),
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
};

/**
 * Public: Submit a new disaster report
 */
export const createReport = async (reportData) => {
  const payload = {
    ...reportData,
    status: "unverified",
    createdAt: new Date().toISOString(),
  };

  const response = await fetch(`${API_BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Failed to submit disaster report");
  return response.json();
};

/**
 * Public Map: Fetch strictly VERIFIED reports for live map display
 */
export const fetchPublicReports = async () => {
  const response = await fetch(`${API_BASE}/reports?status=verified`);
  if (!response.ok) throw new Error("Failed to fetch public live map reports");
  return response.json();
};

/**
 * Admin Overview: Fetch ALL reports (Requires Auth)
 */
export const fetchAllReports = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_BASE}/reports?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Failed to fetch report overview list");
  return response.json();
};

/**
 * Admin Detail View: Fetch a single report by ID (Requires Auth)
 */
export const fetchReportById = async (reportId) => {
  const response = await fetch(`${API_BASE}/reports/${reportId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Failed to fetch report details");
  return response.json();
};

/**
 * Admin Action: Verify a report (Requires Auth)
 */
export const verifyReport = async (reportId) => {
  const response = await fetch(`${API_BASE}/reports/${reportId}/verify`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Failed to verify report");
  return response.json();
};

/**
 * Admin Action: Reject a report (Requires Auth)
 */
export const rejectReport = async (reportId) => {
  const response = await fetch(`${API_BASE}/reports/${reportId}/reject`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Failed to reject report");
  return response.json();
};

/**
 * Admin Action: General update report or severity override (Requires Auth)
 */
export const updateReport = async (reportId, updateData) => {
  const response = await fetch(`${API_BASE}/reports/${reportId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  if (!response.ok) throw new Error("Failed to update report");
  return response.json();
};

/**
 * Admin Settings: Fetch threshold settings (Requires Auth)
 */
export const fetchThresholdSettings = async () => {
  const response = await fetch(`${API_BASE}/settings/thresholds`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Failed to fetch threshold settings");
  return response.json();
};

/**
 * Admin Settings: Update threshold settings (Requires Auth)
 */
export const updateThresholdSettings = async (settingsData) => {
  const response = await fetch(`${API_BASE}/settings/thresholds`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(settingsData),
  });

  if (!response.ok) throw new Error("Failed to update threshold settings");
  return response.json();
};
