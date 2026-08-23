import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import Navbar from "../../components/Navbar.jsx";
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
    "https://disaster-relief-coordination-system-kmf2.onrender.com";

  const token = localStorage.getItem("token");

  const fetchAnalytics = useCallback(
    async (isSilent = false) => {
      if (!isSilent) {
        setLoading(true);
      }

      setError(null);

      try {
        const res = await axios.get(`${API_BASE_URL}/api/analytics/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return (
    <div className="min-h-screen min-w-0 bg-slate-50">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar setSidebarOpen={setSidebarOpen} />

      {/* =====================================================
          ADMIN SIDEBAR
      ===================================================== */}

      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* =====================================================
          MAIN PAGE
          
          IMPORTANT:
          Desktop sidebar is fixed, so the main content gets
          a left margin equal to the sidebar width.

          Mobile has no left margin because the sidebar becomes
          an overlay/drawer.
      ===================================================== */}

      <main
        className="
          min-w-0
          w-full
          pt-0
          transition-[margin]
          duration-300
          ease-in-out

          md:ml-64
          md:w-[calc(100%-16rem)]
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-7xl
            min-w-0
            flex-col
            space-y-5
            px-3
            py-5

            sm:space-y-6
            sm:px-5
            sm:py-6

            md:space-y-7
            md:px-6
            md:py-7

            lg:space-y-8
            lg:px-8
            lg:py-8
          "
        >
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div
            className="
              flex
              min-w-0
              flex-col
              gap-4

              sm:flex-row
              sm:items-start
              sm:justify-between
              sm:gap-5
            "
          >
            {/* TITLE */}

            <div className="min-w-0 flex-1">
              <h1
                className="
                  break-words
                  text-xl
                  font-bold
                  leading-tight
                  text-slate-900

                  sm:text-2xl
                  md:text-3xl
                "
              >
                Regional Crisis Analytics
              </h1>

              <p
                className="
                  mt-1
                  max-w-3xl
                  text-[11px]
                  leading-relaxed
                  text-slate-500

                  sm:text-xs
                "
              >
                Real-time situational awareness (Auto-refreshes every 30s)
                {lastUpdated && (
                  <span
                    className="
                      mt-1
                      block
                      font-medium
                      text-slate-400

                      sm:ml-2
                      sm:mt-0
                      sm:inline
                    "
                  >
                    • Updated: {lastUpdated}
                  </span>
                )}
              </p>
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() => fetchAnalytics(false)}
              disabled={loading}
              className="
                inline-flex
                min-h-10
                w-full
                shrink-0
                items-center
                justify-center
                gap-1.5
                rounded-lg
                border
                border-slate-200
                bg-white
                px-4
                py-2
                text-xs
                font-semibold
                text-slate-700
                shadow-sm
                transition

                hover:bg-slate-50
                active:scale-[0.98]

                disabled:cursor-not-allowed
                disabled:opacity-50

                sm:w-auto
                sm:self-start
              "
            >
              <span aria-hidden="true">🔄</span>

              <span>{loading ? "Refreshing..." : "Refresh Now"}</span>
            </button>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && !data ? (
            <div
              className="
                flex
                min-h-55
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-10
                text-center
                text-sm
                font-medium
                text-slate-500
                shadow-sm

                sm:min-h-65
                sm:px-8
              "
            >
              Loading operational analytics...
            </div>
          ) : error && !data ? (
            /* =================================================
               ERROR
            ================================================= */

            <div
              className="
                rounded-xl
                border
                border-rose-200
                bg-rose-50
                px-4
                py-8
                text-center
                text-sm
                text-rose-700
                shadow-sm

                sm:px-8
                sm:py-10
              "
            >
              <p className="font-semibold leading-relaxed">{error}</p>

              <button
                type="button"
                onClick={() => fetchAnalytics(false)}
                className="
                  mt-4
                  inline-flex
                  min-h-10
                  items-center
                  justify-center
                  rounded-lg
                  bg-rose-600
                  px-5
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  shadow-sm
                  transition

                  hover:bg-rose-700
                  active:scale-[0.98]
                "
              >
                Retry
              </button>
            </div>
          ) : data ? (
            <>
              {/* =================================================
                  SUMMARY CARDS
              ================================================= */}

              <section className="min-w-0 w-full overflow-hidden">
                <AnalyticsSummaryCards summary={data.summary} />
              </section>

              {/* =================================================
                  ANALYTICS CHARTS
              ================================================= */}

              <section
                className="
                  min-w-0
                  w-full
                  overflow-x-auto
                  overflow-y-visible
                  rounded-xl
                "
              >
                <div className="min-w-0">
                  <CrisisAnalyticsCharts
                    crisisTypeDistribution={data.crisisTypeDistribution}
                    severityByDistrict={data.severityByDistrict}
                    incidentTrend={data.incidentTrend}
                  />
                </div>
              </section>
            </>
          ) : null}

          {/* Bottom spacing */}

          <div className="h-5 sm:h-8" />
        </div>
      </main>
    </div>
  );
}
