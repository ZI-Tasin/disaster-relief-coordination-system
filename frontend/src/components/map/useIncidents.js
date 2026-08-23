import { useState, useEffect, useCallback } from "react";

export function useIncidents(
  apiUrl = "https://disaster-relief-coordination-system-kmf2.onrender.com/api/reports",
) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [severityFilter, setSeverityFilter] = useState({
    Low: true,
    Medium: true,
    Critical: true,
  });
  const [crisisFilter, setCrisisFilter] = useState({
    Flood: true,
    Earthquake: true,
    Cyclone: true,
    Other: true,
  });

  const fetchIncidents = useCallback(async () => {
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const json = await response.json();

        // 1. Safely extract array from response wrapper
        const rawReports = Array.isArray(json) ? json : json.data || [];

        // 2. Case-insensitive status check & flexible coordinate conversion
        const active = rawReports
          .filter((item) => {
            const isVerified =
              item.status && item.status.toLowerCase() === "verified";
            const hasLat =
              item.latitude !== null &&
              item.latitude !== undefined &&
              !isNaN(Number(item.latitude));
            const hasLng =
              item.longitude !== null &&
              item.longitude !== undefined &&
              !isNaN(Number(item.longitude));
            return isVerified && hasLat && hasLng;
          })
          .map((item) => ({
            ...item,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
          }));

        setIncidents(active);
      }
    } catch (err) {
      console.error("Failed to fetch live incident map data:", err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 15000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  // Dedicated Resolve Route Handler
  const resolveIncident = async (incidentId) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken");

      // Calls the dedicated /:id/resolve endpoint
      const response = await fetch(`${apiUrl}/${incidentId}/resolve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        // Optimistically remove from state only when DB update succeeds
        setIncidents((prev) => prev.filter((item) => item._id !== incidentId));
      } else {
        alert(`Failed to resolve incident: ${data.message || "Server error"}`);
      }
    } catch (err) {
      console.error("Error resolving incident:", err);
      alert("Network error while resolving incident.");
    }
  };

  // Filtered dataset calculated on the fly
  const filteredIncidents = incidents.filter((item) => {
    const matchesSeverity = severityFilter[item.severity] ?? true;
    const matchesCrisis = crisisFilter[item.crisisType] ?? true;
    return matchesSeverity && matchesCrisis;
  });

  return {
    incidents: filteredIncidents,
    rawIncidents: incidents,
    loading,
    resolveIncident,
    severityFilter,
    setSeverityFilter,
    crisisFilter,
    setCrisisFilter,
  };
}
