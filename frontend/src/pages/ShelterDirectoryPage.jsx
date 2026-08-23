import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://disaster-relief-coordination-system-0z00.onrender.com";

export default function PublicShelterDirectory() {
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
          params: { district: filterDistrict, search },
          signal,
        });
        setShelters(response.data.data || []);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Error fetching public shelter directory:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    [filterDistrict, search],
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

  const metrics = useMemo(() => {
    const totalShelters = shelters.length;
    const totalOccupants = shelters.reduce(
      (sum, s) => sum + (s.occupantCount || 0),
      0,
    );
    const totalCapacity = shelters.reduce(
      (sum, s) => sum + (s.capacity || 0),
      0,
    );
    const availableSpace = Math.max(0, totalCapacity - totalOccupants);

    return { totalShelters, totalOccupants, totalCapacity, availableSpace };
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
      return true;
    });
  }, [shelters, filterSupplyNeed]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Emergency Shelter Directory
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Find active emergency shelters, current occupancy rates, and direct
            helpline numbers.
          </p>
        </div>

        {/* Public KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Active Shelters
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {metrics.totalShelters}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Current Occupants
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {metrics.totalOccupants}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Total Capacity
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {metrics.totalCapacity}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Available Space
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${metrics.availableSpace > 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {metrics.availableSpace}
            </p>
          </div>
        </div>

        {/* Search & Location Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by shelter name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
          />

          <input
            type="text"
            placeholder="Filter by District (e.g. Feni, Sylhet)"
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
          />

          <select
            value={filterSupplyNeed}
            onChange={(e) => setFilterSupplyNeed(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
          >
            <option value="ALL">All Statuses</option>
            <option value="CRITICAL_ONLY">Needs Urgent Supplies</option>
            <option value="SHORTAGE_ONLY">Any Shortage</option>
          </select>
        </div>

        {/* Shelter List */}
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ADB5]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedShelters.map((shelter) => {
              const occupancyPct = Math.round(
                ((shelter.occupantCount || 0) / (shelter.capacity || 1)) * 100,
              );
              const isFull = occupancyPct >= 100;

              return (
                <div
                  key={shelter._id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {shelter.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {shelter.address ||
                            `${shelter.district}, ${shelter.division}`}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isFull
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isFull ? "Full" : "Space Available"}
                      </span>
                    </div>

                    {/* Occupancy Bar */}
                    <div className="mt-4 mb-4">
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>Occupancy</span>
                        <span>
                          {shelter.occupantCount || 0} /{" "}
                          {shelter.capacity || 100} ({occupancyPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${isFull ? "bg-red-500" : "bg-[#00ADB5]"}`}
                          style={{ width: `${Math.min(100, occupancyPct)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="border-t border-slate-100 pt-3 text-xs text-slate-600 space-y-1">
                      {shelter.managerName && (
                        <p>
                          <span className="font-semibold">Manager:</span>{" "}
                          {shelter.managerName}
                        </p>
                      )}
                      {shelter.contactPhone && (
                        <p>
                          <span className="font-semibold">Phone:</span>{" "}
                          <a
                            href={`tel:${shelter.contactPhone}`}
                            className="text-[#00ADB5] hover:underline font-bold"
                          >
                            {shelter.contactPhone}
                          </a>
                        </p>
                      )}
                      {shelter.emergencyAltPhone && (
                        <p>
                          <span className="font-semibold">Alt Phone:</span>{" "}
                          <a
                            href={`tel:${shelter.emergencyAltPhone}`}
                            className="text-slate-700 hover:underline"
                          >
                            {shelter.emergencyAltPhone}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Urgent Supply Shortages */}
                  {shelter.criticalSupplies?.some(
                    (s) => s.status === "CRITICAL" || s.status === "LOW",
                  ) && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Needed Supplies
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {shelter.criticalSupplies
                          .filter(
                            (s) =>
                              s.status === "CRITICAL" || s.status === "LOW",
                          )
                          .map((sup, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                sup.status === "CRITICAL"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {sup.category}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {displayedShelters.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                <p className="text-base font-semibold text-slate-700">
                  No shelters found matching your criteria.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try resetting your location filter or search term.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
