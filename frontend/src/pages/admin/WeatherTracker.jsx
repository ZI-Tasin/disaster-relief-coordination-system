import { useEffect, useState } from "react";

import api from "../../api/axios";

import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";

export default function WeatherTracker() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [incidents, setIncidents] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD INCIDENTS
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadIncidents = async () => {
      try {
        const { data } = await api.get("/weather/incidents");

        if (mounted) {
          setIncidents(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        console.error("Failed to load weather incidents:", err);

        if (mounted) {
          setError(err.response?.data?.error || "Couldn't load incidents.");
        }
      } finally {
        if (mounted) {
          setLoadingIncidents(false);
        }
      }
    };

    loadIncidents();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // SELECT INCIDENT
  // =====================================================

  const handleSelect = async (e) => {
    const id = e.target.value;

    setSelectedId(id);
    setResult(null);
    setError("");

    const incident = incidents.find((item) => String(item.id) === String(id));

    if (!incident) {
      return;
    }

    setLoadingWeather(true);

    try {
      const { data } = await api.post("/weather/query", {
        lat: incident.lat,
        lng: incident.lng,
        incidentId: incident.id,
      });

      setResult(data);
    } catch (err) {
      console.error("Weather check failed:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Weather check failed.",
      );
    } finally {
      setLoadingWeather(false);
    }
  };

  // =====================================================
  // SELECTED INCIDENT
  // =====================================================

  const selectedIncident = incidents.find(
    (incident) => String(incident.id) === String(selectedId),
  );

  // =====================================================
  // SAFETY BADGES
  // =====================================================

  const badgeStyles = {
    "Safe to Deploy": "border-green-300 bg-green-100 text-green-800",

    "Exercise Caution": "border-amber-300 bg-amber-100 text-amber-800",

    "Do Not Deploy": "border-red-300 bg-red-100 text-red-800",
  };

  const recommendationStyle =
    badgeStyles[result?.recommendation] ||
    "border-gray-300 bg-gray-100 text-gray-700";

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
          lg:ml-64 prevents content from going underneath.
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
        <div className="mx-auto w-full max-w-1600px">
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-6 min-w-0 sm:mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00ADB5] sm:text-xs">
              Safety Operations
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#222831] sm:text-3xl">
              Weather Safety Tracker
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
              Check live weather conditions before deploying volunteers to an
              incident.
            </p>
          </div>

          {/* =================================================
              MAIN CARD
          ================================================= */}

          <section
            className="
              mx-auto
              w-full
              max-w-4xl
              overflow-hidden
              rounded-2xl
              border
              border-gray-100
              bg-white
              shadow-sm
              sm:rounded-3xl
            "
          >
            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div
              className="
                bg-linear-to-r
                from-[#30475E]
                to-[#3D5871]
                px-5
                py-6
                text-white
                sm:px-8
                sm:py-7
              "
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00ADB5] sm:text-xs">
                Deployment Safety
              </p>

              <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                Check Incident Weather
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-300 sm:text-sm">
                Select an active incident to retrieve current weather conditions
                and deployment guidance.
              </p>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <div className="p-5 sm:p-8">
              <label
                htmlFor="incident"
                className="mb-2 block text-sm font-semibold text-[#222831]"
              >
                Active Incident
              </label>

              <select
                id="incident"
                value={selectedId}
                onChange={handleSelect}
                disabled={loadingIncidents || loadingWeather}
                className="
                  min-h-12
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  px-4
                  py-3
                  text-sm
                  text-gray-700
                  outline-none
                  transition
                  focus:border-[#00ADB5]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-[#00ADB5]/10
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <option value="">
                  {loadingIncidents
                    ? "Loading incidents..."
                    : "Select an incident"}
                </option>

                {incidents.map((incident) => (
                  <option key={incident.id} value={incident.id}>
                    {incident.title} ({incident.district})
                  </option>
                ))}
              </select>

              {/* =================================================
                  INCIDENT LOCATION
              ================================================= */}

              {selectedIncident && (
                <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-500">
                        Selected Incident
                      </p>

                      <p className="mt-0.5 truncate text-sm font-semibold text-[#222831]">
                        {selectedIncident.title}
                      </p>
                    </div>

                    <div className="shrink-0 text-xs text-gray-400">
                      Lat: {selectedIncident.lat} · Lng: {selectedIncident.lng}
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* =================================================
                  LOADING WEATHER
              ================================================= */}

              {loadingWeather && (
                <div className="mt-6 flex items-center justify-center rounded-2xl bg-gray-50 px-4 py-10">
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
                      "
                    />

                    <p className="mt-4 text-sm font-medium text-[#30475E]">
                      Fetching live weather...
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Checking current conditions for the selected incident.
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  WEATHER RESULT
              ================================================= */}

              {result && !loadingWeather && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                  {/* Result header */}

                  <div className="border-b border-gray-100 bg-gray-50 px-4 py-4 sm:px-5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00ADB5]">
                      Current Conditions
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-[#222831]">
                      Weather Assessment
                    </h3>
                  </div>

                  {/* Weather stats */}

                  <div className="p-4 sm:p-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {/* Temperature */}

                      <div className="rounded-2xl bg-gray-50 p-4 text-center">
                        <p className="text-xs font-medium text-gray-400">
                          Temperature
                        </p>

                        <p className="mt-2 text-2xl font-bold text-[#30475E]">
                          {result.weatherSummary?.temperature ?? "—"}
                          °C
                        </p>
                      </div>

                      {/* Wind */}

                      <div className="rounded-2xl bg-gray-50 p-4 text-center">
                        <p className="text-xs font-medium text-gray-400">
                          Wind Speed
                        </p>

                        <p className="mt-2 text-2xl font-bold text-[#30475E]">
                          {result.weatherSummary?.windSpeed ?? "—"}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">km/h</p>
                      </div>

                      {/* Precipitation */}

                      <div className="rounded-2xl bg-gray-50 p-4 text-center">
                        <p className="text-xs font-medium text-gray-400">
                          Precipitation
                        </p>

                        <p className="mt-2 text-2xl font-bold text-[#30475E]">
                          {result.weatherSummary?.precipitation ?? "—"}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">mm</p>
                      </div>
                    </div>

                    {/* Condition */}

                    <div className="mt-4 rounded-2xl border border-gray-100 bg-white px-4 py-4 text-center">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Condition
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {result.weatherSummary?.condition || "Unavailable"}
                      </p>
                    </div>

                    {/* =================================================
                        DEPLOYMENT RECOMMENDATION
                    ================================================= */}

                    <div className="mt-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Deployment Recommendation
                      </p>

                      <div
                        className={`
                          rounded-2xl
                          border
                          px-4
                          py-4
                          text-center
                          text-sm
                          font-bold
                          sm:py-5
                          sm:text-base
                          ${recommendationStyle}
                        `}
                      >
                        {result.recommendation || "No recommendation available"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  NO INCIDENTS
              ================================================= */}

              {!loadingIncidents && incidents.length === 0 && !error && (
                <div className="mt-5 rounded-2xl bg-gray-50 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-gray-500">
                    No active incidents available.
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Verified incidents will appear here when available.
                  </p>
                </div>
              )}
            </div>
          </section>

          <div className="h-6 sm:h-10" />
        </div>
      </main>
    </div>
  );
}
