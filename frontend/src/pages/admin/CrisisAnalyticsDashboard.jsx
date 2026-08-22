import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AnalyticsSummaryCards from "../../components/AnalyticsSummaryCards.jsx";
import CrisisAnalyticsCharts from "../../components/CrisisAnalyticsCharts.jsx";
import AdminSidebar from "../../components/AdminSidebar.jsx";

export default function CrisisAnalyticsDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://disaster-relief-coordination-system-0z00.onrender.com";
  const token = localStorage.getItem("token");

  const fetchAnalytics = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`${API_BASE_URL}/api/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError(
          err.response?.data?.message || "Failed to fetch analytics data.",
        );
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL, token],
  );

  useEffect(() => {
    fetchAnalytics();

    // Auto-refresh quietly every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Navbar Header */}
        <div className="md:hidden flex items-center justify-between bg-[#30475E] text-white p-4 border-b border-white/10">
          <span className="font-bold">DRRCS Admin</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white/10 rounded-lg text-white"
          >
            ☰
          </button>
        </div>

        <main className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Regional Crisis Analytics
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time situational awareness (Auto-refreshes every 30s)
                {lastUpdated && (
                  <span className="ml-2 font-medium text-slate-400">
                    • Updated: {lastUpdated}
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={() => fetchAnalytics(false)}
              disabled={loading}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition shadow-sm disabled:opacity-50 self-start sm:self-auto flex items-center gap-1.5"
            >
              🔄 {loading ? "Refreshing..." : "Refresh Now"}
            </button>
          </div>

          {loading && !data ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500 font-medium">
              Loading operational analytics...
            </div>
          ) : error && !data ? (
            <div className="bg-rose-50 rounded-xl p-8 text-center border border-rose-200 text-rose-700 text-sm space-y-3">
              <p className="font-semibold">{error}</p>
              <button
                onClick={() => fetchAnalytics(false)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
              >
                Retry
              </button>
            </div>
          ) : data ? (
            <>
              <AnalyticsSummaryCards summary={data.summary} />

              <CrisisAnalyticsCharts
                crisisTypeDistribution={data.crisisTypeDistribution}
                severityByDistrict={data.severityByDistrict}
                incidentTrend={data.incidentTrend}
              />
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
