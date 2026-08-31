import { useState, useEffect } from "react";
import api from "../api/axios";

// Real division -> district data from GET /api/locations/tree (seeded from
// backend/data/*Division.json), reshaped into FormSelect's group format.
export default function useDistricts() {
  const [districtGroups, setDistrictGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/locations/tree")
      .then(({ data }) => {
        const tree = Array.isArray(data) ? data : data?.data || [];
        setDistrictGroups(
          tree.map((division) => ({
            division: division.name,
            districts: (division.districts || []).map((d) => d.name),
          })),
        );
      })
      .catch(() => setDistrictGroups([]))
      .finally(() => setLoading(false));
  }, []);

  return { districtGroups, loading };
}
