import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";

const CertificatePreview = () => {
  const { token, user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [volunteerId, setVolunteerId] = useState("");
  const [missionId, setMissionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState([]);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://disaster-relief-coordination-system-kmf2.onrender.com/api";

  // =========================================================
  // FETCH CERTIFICATES
  // =========================================================

  useEffect(() => {
    if (token && (user?.role === "volunteer" || user?.role === "admin")) {
      fetchCertificates();
    }
  }, [token, user]);

  const fetchCertificates = async () => {
    try {
      const id = volunteerId || user?.id;

      if (!id || !token) {
        return;
      }

      const response = await axios.get(
        `${API_URL}/notifications/certificate/volunteer/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCertificates(response.data.data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  // =========================================================
  // DOWNLOAD CERTIFICATE
  // =========================================================

  const downloadCertificate = async (volId, missId) => {
    if (!volId || !missId) {
      toast.error("Volunteer ID and Mission ID are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/notifications/certificate/${volId}/${missId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `certificate-${volId}-${Date.now()}.pdf`);

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);

      toast.error(
        error.response?.data?.message || "Failed to download certificate",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GENERATE CERTIFICATE
  // =========================================================

  const handleGenerate = () => {
    if (!volunteerId || !missionId) {
      toast.error("Please enter both Volunteer ID and Mission ID");
      return;
    }

    downloadCertificate(volunteerId, missionId);
  };

  // =========================================================
  // CLOSE SIDEBAR AFTER NAVIGATION
  // =========================================================

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F7FA]">
      {/* =====================================================
          NAVBAR
          DO NOT CHANGE SHARED NAVBAR
      ===================================================== */}

      <div className="fixed inset-x-0 top-0 z-[60] w-full">
        <Navbar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* =====================================================
          SIDEBAR

          Desktop:
          - Fixed
          - Starts directly underneath navbar
          - 256px wide

          Mobile:
          - AdminSidebar controls drawer behavior
          - No separate mobile menu button
      ===================================================== */}

      <aside
        className="
          fixed
          left-0
          top-16
          z-50
          hidden
          h-[calc(100vh-4rem)]
          w-64
          overflow-hidden
          lg:block
        "
      >
        <AdminSidebar open={true} setOpen={handleSidebarClose} />
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main
        className="
          min-h-screen
          w-full
          pt-16
          lg:ml-64
          lg:w-[calc(100%-16rem)]
        "
      >
        <div
          className="
            w-full
            px-3
            py-5
            sm:px-5
            sm:py-6
            md:px-6
            lg:px-8
            lg:py-8
          "
        >
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-6 sm:mb-8">
            <h1
              className="
                text-2xl
                font-bold
                leading-tight
                text-gray-800
                sm:text-3xl
              "
            >
              🏅 Volunteer Completion Certificates
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-gray-500
                sm:text-base
              "
            >
              Download certificates for completed missions.
            </p>
          </div>

          {/* =================================================
              ADMIN GENERATE CERTIFICATE
          ================================================= */}

          {user?.role === "admin" && (
            <div
              className="
                mb-6
                w-full
                rounded-xl
                bg-white
                p-4
                shadow-lg
                sm:p-6
              "
            >
              <h2
                className="
                  mb-4
                  text-lg
                  font-semibold
                  text-gray-800
                "
              >
                Admin: Generate Certificate
              </h2>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-2
                "
              >
                {/* Volunteer ID */}

                <div className="min-w-0">
                  <label
                    className="
                      mb-1
                      block
                      text-sm
                      font-medium
                      text-gray-700
                    "
                  >
                    Volunteer ID
                  </label>

                  <input
                    type="text"
                    value={volunteerId}
                    onChange={(e) => setVolunteerId(e.target.value)}
                    className="
                      w-full
                      min-w-0
                      rounded-lg
                      border
                      border-gray-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-500/20
                    "
                    placeholder="Enter volunteer ID"
                  />
                </div>

                {/* Mission ID */}

                <div className="min-w-0">
                  <label
                    className="
                      mb-1
                      block
                      text-sm
                      font-medium
                      text-gray-700
                    "
                  >
                    Mission ID
                  </label>

                  <input
                    type="text"
                    value={missionId}
                    onChange={(e) => setMissionId(e.target.value)}
                    className="
                      w-full
                      min-w-0
                      rounded-lg
                      border
                      border-gray-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-500/20
                    "
                    placeholder="Enter mission ID"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!volunteerId || !missionId || loading}
                className="
                  mt-4
                  w-full
                  rounded-lg
                  bg-blue-600
                  px-6
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:w-auto
                "
              >
                {loading ? "Generating..." : "Generate Certificate"}
              </button>
            </div>
          )}

          {/* =================================================
              CERTIFICATES CARD
          ================================================= */}

          <div
            className="
              w-full
              overflow-hidden
              rounded-xl
              bg-white
              shadow-lg
            "
          >
            {/* Card Header */}

            <div
              className="
                border-b
                border-gray-200
                px-4
                py-4
                sm:px-6
              "
            >
              <h2
                className="
                  text-lg
                  font-semibold
                  text-gray-800
                  sm:text-xl
                "
              >
                Available Certificates ({certificates.length})
              </h2>
            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {certificates.length === 0 ? (
              <div
                className="
                  px-4
                  py-10
                  text-center
                  sm:px-8
                "
              >
                <p className="mb-2 text-4xl">📄</p>

                <p className="font-medium text-gray-500">
                  No certificates available.
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Complete a mission to earn a certificate.
                </p>
              </div>
            ) : (
              <>
                {/* =================================================
                    DESKTOP / TABLET TABLE
                ================================================= */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="
                            whitespace-nowrap
                            px-6
                            py-3
                            text-left
                            text-xs
                            font-medium
                            uppercase
                            tracking-wider
                            text-gray-500
                          "
                        >
                          Mission
                        </th>

                        <th
                          className="
                            whitespace-nowrap
                            px-6
                            py-3
                            text-left
                            text-xs
                            font-medium
                            uppercase
                            tracking-wider
                            text-gray-500
                          "
                        >
                          Serial Number
                        </th>

                        <th
                          className="
                            whitespace-nowrap
                            px-6
                            py-3
                            text-left
                            text-xs
                            font-medium
                            uppercase
                            tracking-wider
                            text-gray-500
                          "
                        >
                          Date
                        </th>

                        <th
                          className="
                            whitespace-nowrap
                            px-6
                            py-3
                            text-right
                            text-xs
                            font-medium
                            uppercase
                            tracking-wider
                            text-gray-500
                          "
                        >
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                      {certificates.map((cert) => (
                        <tr
                          key={cert.id}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {cert.missionName || "Unknown mission"}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            {cert.serialNumber || "N/A"}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            {cert.date || "N/A"}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() =>
                                downloadCertificate(cert.volunteerId, cert.id)
                              }
                              disabled={loading}
                              className="
                                inline-flex
                                items-center
                                justify-center
                                rounded-lg
                                bg-[#00ADB5]
                                px-4
                                py-2
                                text-sm
                                font-medium
                                text-white
                                transition
                                hover:bg-[#0097A0]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              {loading ? "..." : "⬇ Download"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    MOBILE CERTIFICATE CARDS
                ================================================= */}

                <div className="space-y-3 p-3 md:hidden">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        p-4
                        shadow-sm
                      "
                    >
                      {/* Mission */}

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Mission
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                          {cert.missionName || "Unknown mission"}
                        </p>
                      </div>

                      {/* Details */}

                      <div
                        className="
                          mt-4
                          grid
                          grid-cols-1
                          gap-3
                          sm:grid-cols-2
                        "
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Serial Number
                          </p>

                          <p className="mt-1 break-all text-sm text-gray-600">
                            {cert.serialNumber || "N/A"}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Date
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            {cert.date || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Download */}

                      <button
                        onClick={() =>
                          downloadCertificate(cert.volunteerId, cert.id)
                        }
                        disabled={loading}
                        className="
                          mt-4
                          flex
                          w-full
                          items-center
                          justify-center
                          rounded-lg
                          bg-[#00ADB5]
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-[#0097A0]
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {loading ? "Downloading..." : "⬇ Download Certificate"}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* =====================================================
          MOBILE SIDEBAR

          Keep the shared AdminSidebar responsible for its
          own mobile drawer. No extra menu button.
      ===================================================== */}

      <div className="lg:hidden">
        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>
    </div>
  );
};

export default CertificatePreview;
