import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://disaster-relief-coordination-system-kmf2.onrender.com";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export function useShelterOperations(showNotification) {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSupplyNeed, setFilterSupplyNeed] = useState("ALL");

  const fetchShelters = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/shelters`, {
          ...getAuthHeaders(),
          params: { district: filterDistrict, search },
          signal,
        });
        setShelters(response.data.data || []);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Error loading shelters:", err);
          showNotification("Failed to load shelters", "error");
        }
      } finally {
        setLoading(false);
      }
    },
    [filterDistrict, search, showNotification],
  );

  useEffect(() => {
    const controller = new AbortController();
    const delayDebounce = setTimeout(() => {
      fetchShelters(controller.signal);
    }, 300);

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [fetchShelters]);

  const deleteShelter = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shelter?"))
      return;
    try {
      await axios.delete(
        `${API_BASE_URL}/api/shelters/${id}`,
        getAuthHeaders(),
      );
      showNotification("Shelter record deleted");
      fetchShelters();
    } catch (err) {
      showNotification("Failed to delete shelter", "error");
    }
  };

  const metrics = useMemo(() => {
    let criticalCount = 0;
    let lowCount = 0;
    let overcapacityCount = 0;
    let totalOccupants = 0;
    let totalCapacity = 0;

    shelters.forEach((s) => {
      totalOccupants += s.occupantCount || 0;
      totalCapacity += s.capacity || 0;

      if (s.criticalSupplies?.some((sup) => sup.status === "CRITICAL"))
        criticalCount++;
      else if (s.criticalSupplies?.some((sup) => sup.status === "LOW"))
        lowCount++;

      if ((s.occupantCount || 0) > (s.capacity || 0)) overcapacityCount++;
    });

    return {
      totalShelters: shelters.length,
      totalOccupants,
      totalCapacity,
      criticalCount,
      lowCount,
      overcapacityCount,
    };
  }, [shelters]);

  const displayedShelters = useMemo(() => {
    return shelters.filter((s) => {
      if (filterSupplyNeed === "CRITICAL_ONLY") {
        return s.criticalSupplies?.some((sup) => sup.status === "CRITICAL");
      }
      if (filterSupplyNeed === "SHORTAGE_ONLY") {
        return s.criticalSupplies?.some(
          (sup) => sup.status === "CRITICAL" || sup.status === "LOW",
        );
      }
      if (filterSupplyNeed === "OVERCAPACITY") {
        return (s.occupantCount || 0) > (s.capacity || 0);
      }
      return true;
    });
  }, [shelters, filterSupplyNeed]);

  return {
    shelters: displayedShelters,
    loading,
    metrics,
    filters: {
      search,
      setSearch,
      filterDivision,
      setFilterDivision,
      filterDistrict,
      setFilterDistrict,
      filterSupplyNeed,
      setFilterSupplyNeed,
    },
    deleteShelter,
    refreshShelters: fetchShelters,
  };
}
