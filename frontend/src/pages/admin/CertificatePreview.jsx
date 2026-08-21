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

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    if (user?.role === "volunteer" || user?.role === "admin") {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const id = volunteerId || user?.id;
      if (!id) return;

      const response = await axios.get(
        `${API_URL}/notifications/certificate/volunteer/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCertificates(response.data.data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const downloadCertificate = async (volId, missId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/notifications/certificate/${volId}/${missId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate-${volId}-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download certificate");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!volunteerId || !missionId) {
      toast.error("Please enter both Volunteer ID and Mission ID");
      return;
    }
    downloadCertificate(volunteerId, missionId);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar setSidebarOpen={setSidebarOpen} />
      </div>
      <div className="fixed left-0 top-16 bottom-0 z-40 w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>
      <main className="min-h-screen pt-16 md:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mb-5 rounded-xl bg-[#30475E] px-4 py-2 font-medium text-white shadow-sm transition hover:bg-[#222831] md:hidden"
          >
            ☰ Menu
          </button>

          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            🏅 Volunteer Completion Certificates
          </h1>
          <p className="text-gray-500 mb-8">
            Download certificates for completed missions.
          </p>

          {user?.role === "admin" && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Admin: Generate Certificate
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Volunteer ID
                  </label>
                  <input
                    type="text"
                    value={volunteerId}
                    onChange={(e) => setVolunteerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter volunteer ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mission ID
                  </label>
                  <input
                    type="text"
                    value={missionId}
                    onChange={(e) => setMissionId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter mission ID"
                  />
                </div>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!volunteerId || !missionId || loading}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Certificate"}
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                Available Certificates ({certificates.length})
              </h2>
            </div>

            {certificates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-4xl mb-2">📄</p>
                <p>No certificates available.</p>
                <p className="text-sm">Complete a mission to earn a certificate.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serial Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {cert.missionName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {cert.serialNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {cert.date}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              downloadCertificate(cert.volunteerId, cert.id)
                            }
                            disabled={loading}
                            className="px-4 py-2 bg-[#00ADB5] text-white rounded-lg text-sm hover:bg-[#0097A0] disabled:opacity-50"
                          >
                            {loading ? "..." : "⬇ Download"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CertificatePreview;