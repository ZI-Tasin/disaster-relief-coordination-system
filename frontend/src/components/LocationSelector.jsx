import React, { useState, useEffect } from "react";
import axios from "axios";

const LocationSelector = ({
  division = "",
  district = "",
  upazila = "",
  onLocationChange,
  showUpazila = true,
}) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        let response;
        try {
          response = await axios.get(
            "https://disaster-relief-coordination-system-0z00.onrender.com/api/locations/tree",
          );
        } catch (e) {
          response = await axios.get("/api/locations/tree");
        }

        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        setLocations(data);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const currentDivisionObj = locations.find((loc) => loc.name === division);
  const availableDistricts = Array.isArray(currentDivisionObj?.districts)
    ? currentDivisionObj.districts
    : [];

  const currentDistrictObj = availableDistricts.find(
    (dist) => dist.name === district,
  );
  const availableUpazilas = Array.isArray(currentDistrictObj?.subdistricts)
    ? currentDistrictObj.subdistricts
    : [];

  const handleDivisionChange = (e) => {
    onLocationChange?.({
      division: e.target.value,
      district: "",
      upazila: "",
      subdistrict: "",
    });
  };

  const handleDistrictChange = (e) => {
    onLocationChange?.({
      division,
      district: e.target.value,
      upazila: "",
      subdistrict: "",
    });
  };

  const handleUpazilaChange = (e) => {
    const val = e.target.value;
    onLocationChange?.({ division, district, upazila: val, subdistrict: val });
  };

  if (loading)
    return (
      <p className="text-sm text-gray-500 py-2">Loading location options...</p>
    );
  if (error)
    return (
      <p className="text-sm text-red-500 py-2">
        Error loading locations: {error}
      </p>
    );

  return (
    <div
      className={`grid grid-cols-1 ${
        showUpazila ? "sm:grid-cols-3" : "sm:grid-cols-2"
      } gap-3 mb-3`}
    >
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">
          Division
        </label>
        <select
          value={division}
          onChange={handleDivisionChange}
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#00b4d8]"
        >
          <option value="">-- Select Division --</option>
          {locations.map((loc) => (
            <option key={loc._id || loc.name} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">
          District *
        </label>
        <select
          value={district}
          onChange={handleDistrictChange}
          disabled={!division}
          className="w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#00b4d8] disabled:bg-gray-50"
        >
          <option value="">-- Select District --</option>
          {availableDistricts.map((dist) => (
            <option key={dist.name || dist} value={dist.name || dist}>
              {dist.name || dist}
            </option>
          ))}
        </select>
      </div>

      {showUpazila && (
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Sub-district / Upazila *
          </label>
          <select
            value={upazila}
            onChange={handleUpazilaChange}
            disabled={!district}
            className="w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#00b4d8] disabled:bg-gray-50"
          >
            <option value="">-- Select Upazila --</option>
            {availableUpazilas.map((sub, idx) => (
              <option key={`${sub}-${idx}`} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
