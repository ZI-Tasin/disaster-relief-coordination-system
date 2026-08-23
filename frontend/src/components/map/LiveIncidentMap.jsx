import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { SEVERITY_ICONS, SHELTER_ICON } from "./MapIcons.js";
import MapBoundsAdjuster from "./MapBoundsAdjuster.jsx";
import IncidentPopup from "./IncidentPopup.jsx";
import MapFilterOverlay from "./MapFilterOverlay.jsx";
import { useIncidents } from "./useIncidents.js";

const getAuthConfig = () => {
  let token = localStorage.getItem("token") || localStorage.getItem("jwt");
  if (!token) {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      token = user.token || user.jwt || user.accessToken;
    } catch (e) {
      /* ignore JSON parse error */
    }
  }
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

function LiveIncidentMap({ isCoordinator = true }) {
  const {
    incidents,
    rawIncidents,
    loading,
    resolveIncident,
    refetchIncidents,
    severityFilter,
    setSeverityFilter,
    crisisFilter,
    setCrisisFilter,
  } = useIncidents();

  const [shelters, setShelters] = useState([]);
  const [showShelters, setShowShelters] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://disaster-relief-coordination-system-0z00.onrender.com";

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/shelters`);
        setShelters(res.data.data || []);
      } catch (err) {
        console.error("Failed to load shelters on map:", err);
      }
    };
    fetchShelters();
  }, [API_BASE_URL]);

  const handleBatchResolve = async (reportIds) => {
    if (!reportIds || reportIds.length === 0) return;
    setBatchLoading(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/reports/batch-resolve`,
        { reportIds },
        getAuthConfig(),
      );
      if (typeof refetchIncidents === "function") {
        await refetchIncidents();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to batch resolve incidents:", err);
      alert("Failed to resolve selected incidents. Please try again.");
    } finally {
      setBatchLoading(false);
    }
  };

  const defaultCenter = [23.685, 90.3563];
  const coordCounts = {};

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden relative border shadow-md bg-white">
      {(loading || batchLoading) && (
        <div className="absolute inset-0 bg-white/80 z-[1001] flex items-center justify-center font-medium text-gray-600">
          {batchLoading
            ? "Batch resolving incidents..."
            : "Loading Incident Map..."}
        </div>
      )}

      <MapFilterOverlay
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        crisisFilter={crisisFilter}
        setCrisisFilter={setCrisisFilter}
        showShelters={showShelters}
        setShowShelters={setShowShelters}
        recentIncidents={rawIncidents}
      />

      <MapContainer
        center={defaultCenter}
        zoom={7}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {incidents.length > 0 && <MapBoundsAdjuster markers={incidents} />}

        {/* ================= INCIDENT MARKERS ================= */}
        {incidents
          .filter((incident) => {
            const lat = Number(incident.latitude);
            const lng = Number(incident.longitude);
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
          })
          .map((incident, index) => {
            let lat = Number(incident.latitude);
            let lng = Number(incident.longitude);

            if (lat > 85 || lat < -85) [lat, lng] = [lng, lat];

            // --- JITTERING LOGIC ---
            const coordKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
            const occurrence = coordCounts[coordKey] || 0;
            coordCounts[coordKey] = occurrence + 1;

            if (occurrence > 0) {
              const angle = occurrence * 0.8;
              const radius = 0.00025 * Math.sqrt(occurrence);
              lat += radius * Math.cos(angle);
              lng += radius * Math.sin(angle);
            }

            // --- CLUSTER ID COLLECTION ---
            // Find all active reports sharing the exact same district, subdistrict, and crisisType
            const clusterReportIds = incidents
              .filter(
                (item) =>
                  item.district === incident.district &&
                  item.subdistrict === incident.subdistrict &&
                  item.crisisType === incident.crisisType,
              )
              .map((item) => item._id);

            return (
              <Marker
                key={incident._id || `incident-${index}`}
                position={[lat, lng]}
                icon={
                  SEVERITY_ICONS[incident.severity] || SEVERITY_ICONS.Medium
                }
              >
                <Popup>
                  <IncidentPopup
                    incident={incident}
                    clusterReportIds={clusterReportIds}
                    isCoordinator={isCoordinator}
                    onResolve={resolveIncident}
                    onBatchResolve={handleBatchResolve}
                  />
                </Popup>
              </Marker>
            );
          })}

        {/* ================= SHELTER MARKERS ================= */}
        {showShelters &&
          shelters
            .filter((s) => s.latitude && s.longitude)
            .map((shelter) => (
              <Marker
                key={shelter._id}
                position={[Number(shelter.latitude), Number(shelter.longitude)]}
                icon={SHELTER_ICON || SEVERITY_ICONS.Low}
              >
                <Popup>
                  <div className="p-2 space-y-1">
                    <h3 className="font-bold text-sm text-slate-800">
                      🏠 {shelter.name}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {shelter.address}, {shelter.district}
                    </p>
                    <div className="text-xs font-semibold text-sky-600 mt-1">
                      Occupancy: {shelter.occupantCount} / {shelter.capacity}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
      </MapContainer>
    </div>
  );
}

export default LiveIncidentMap;
