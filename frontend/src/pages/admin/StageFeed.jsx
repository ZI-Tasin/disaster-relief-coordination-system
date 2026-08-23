import { useEffect, useState, useCallback } from "react";

import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";
import StageFeedItem from "../../components/StageFeedItem";

import { getStageFeed } from "../../api/stageApi";

export default function StageFeed() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH FEED
  // =====================================================

  const fetchFeed = useCallback(async () => {
    try {
      const { data } = await getStageFeed();

      setUpdates(data?.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load stage feed:", err);

      setError(err.response?.data?.message || "Failed to load feed.");
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {
    fetchFeed();

    const interval = setInterval(() => {
      fetchFeed();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchFeed]);

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#F4F7FA]">
      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar setSidebarOpen={setSidebarOpen} />

      {/* =================================================
          FIXED SIDEBAR
      ================================================= */}

      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* =================================================
          MAIN CONTENT

          Sidebar is fixed on desktop.
          lg:ml-64 keeps all content beside it.
      ================================================= */}

      <main
        className="
          min-h-[calc(100vh-60px)]
          min-w-0
          overflow-x-hidden
          p-4
          transition-all
          duration-300
          sm:p-6
          md:p-7
          lg:ml-64
          lg:p-8
          xl:p-10
        "
      >
        <div className="mx-auto w-full max-w-[1600px]">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-6 min-w-0 sm:mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00ADB5] sm:text-xs">
              Coordination
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#222831] sm:text-3xl">
              Relief Distribution Feed
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
              Live, reverse-chronological updates from all deployed volunteers.
            </p>

            {/* Live indicator */}

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm ring-1 ring-gray-100">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ADB5] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00ADB5]" />
              </span>
              Live updates · Refreshes every 15 seconds
            </div>
          </div>

          {/* =================================================
              FEED CARD
          ================================================= */}

          <section
            className="
              min-w-0
              overflow-hidden
              rounded-2xl
              border
              border-gray-100
              bg-white
              shadow-sm
              sm:rounded-3xl
            "
          >
            {/* Section header */}

            <div
              className="
                border-b
                border-gray-100
                px-4
                py-5
                sm:px-6
                sm:py-6
                lg:px-8
              "
            >
              <div className="flex min-w-0 items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00ADB5] sm:text-xs">
                    Activity
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-[#222831] sm:text-xl">
                    Distribution Updates
                  </h2>
                </div>

                <div className="shrink-0 rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
                  {updates.length} {updates.length === 1 ? "Update" : "Updates"}
                </div>
              </div>
            </div>

            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="p-4 sm:p-6 lg:p-8">
              {loading ? (
                <div className="flex min-h-55 items-center justify-center">
                  <div className="text-center">
                    <div
                      className="
                        mx-auto
                        h-10
                        w-10
                        animate-spin
                        rounded-full
                        border-4
                        border-gray-200
                        border-t-[#00ADB5]
                        sm:h-11
                        sm:w-11
                      "
                    />

                    <p className="mt-4 text-sm text-gray-400">
                      Loading distribution feed...
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-10 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-500">
                    !
                  </div>

                  <p className="mt-3 text-sm font-medium text-red-600">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={fetchFeed}
                    className="
                      mt-4
                      rounded-xl
                      bg-red-500
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      text-white
                      transition
                      hover:bg-red-600
                      active:scale-[0.98]
                    "
                  >
                    Try Again
                  </button>
                </div>
              ) : updates.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 px-4 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                    ✓
                  </div>

                  <p className="mt-4 text-sm font-semibold text-gray-600">
                    No progress updates yet.
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Updates will appear here when deployed volunteers submit
                    their distribution progress.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {updates.map((update) => (
                    <StageFeedItem key={update._id} update={update} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              BOTTOM SPACE
          ================================================= */}

          <div className="h-6 sm:h-10" />
        </div>
      </main>
    </div>
  );
}
