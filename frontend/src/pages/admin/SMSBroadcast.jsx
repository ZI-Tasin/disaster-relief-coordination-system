import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";

const SMSBroadcast = () => {
  const { token } = useAuth();

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [district, setDistrict] = useState("");
  const [severity, setSeverity] = useState("");
  const [districts, setDistricts] = useState([]);
  const [previewVolunteers, setPreviewVolunteers] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://disaster-relief-coordination-system-0z00.onrender.com/api";

  // =========================================================
  // FETCH DISTRICTS
  // =========================================================
  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/districts`);
      setDistricts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  // =========================================================
  // FETCH DRAFTS
  // =========================================================
  useEffect(() => {
    if (token) {
      fetchDrafts();
      fetchLogs();
    }
  }, [token]);

  const fetchDrafts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/notifications?status=draft`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDrafts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching drafts:", error);
    }
  };

  // =========================================================
  // FETCH LOGS
  // =========================================================
  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/sms/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveryLogs(response.data.data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  // =========================================================
  // HANDLE DRAFT SELECTION
  // =========================================================
  const handleDraftSelect = async (e) => {
    const draftId = e.target.value;
    setSelectedDraft(draftId);

    if (draftId) {
      try {
        const response = await axios.get(
          `${API_URL}/notifications/${draftId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const draft = response.data.data;
        setMessageBody(draft.messageBody || "");
        setDistrict(draft.district || "");
        setSeverity(draft.severity || "");

        if (draft.district) {
          fetchVolunteerPreview(draft.district);
        }
        toast.success("Draft loaded successfully");
      } catch (error) {
        toast.error("Failed to load draft");
      }
    } else {
      setMessageBody("");
      setDistrict("");
      setSeverity("");
      setPreviewVolunteers([]);
    }
  };

  // =========================================================
  // FETCH VOLUNTEER PREVIEW
  // =========================================================
  const fetchVolunteerPreview = async (selectedDistrict) => {
    try {
      const response = await axios.get(
        `${API_URL}/sms/volunteers/${encodeURIComponent(selectedDistrict)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPreviewVolunteers(response.data.data || []);
      setShowPreview(true);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      setPreviewVolunteers([]);
    }
  };

  // =========================================================
  // HANDLE DISTRICT CHANGE
  // =========================================================
  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setDistrict(selectedDistrict);
    if (selectedDistrict) {
      fetchVolunteerPreview(selectedDistrict);
    } else {
      setPreviewVolunteers([]);
      setShowPreview(false);
    }
  };

  // =========================================================
  // SEND BROADCAST
  // =========================================================
  const handleSendBroadcast = async (e) => {
    e.preventDefault();

    if (!messageBody.trim()) {
      toast.error("Please enter a message body");
      return;
    }

    if (!district) {
      toast.error("Please select a district");
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Are you sure you want to send this SMS broadcast to ${district}?\n\n` +
        `Message: ${messageBody.substring(0, 100)}...\n\n` +
        `This will send to volunteers in ${district}.`,
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setBroadcastResult(null);

      const payload = {
        notificationId: selectedDraft || undefined,
        messageBody: messageBody,
        district: district,
        severity: severity,
      };

      const response = await axios.post(`${API_URL}/sms/broadcast`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBroadcastResult(response.data.data);
      toast.success(response.data.message || "Broadcast sent successfully!");

      await fetchLogs();

      if (selectedDraft) {
        setSelectedDraft("");
        setMessageBody("");
        setDistrict("");
        setSeverity("");
        setPreviewVolunteers([]);
        setShowPreview(false);
      }
    } catch (error) {
      console.error("Error sending broadcast:", error);
      toast.error(error.response?.data?.message || "Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GET STATUS COLOR
  // =========================================================
  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "queued":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* =====================================================
          FIXED TOP NAVBAR
          ===================================================== */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* =====================================================
          FIXED ADMIN SIDEBAR
          ===================================================== */}
      <div
        className="
          fixed
          left-0
          top-16
          bottom-0
          z-40
          w-64
          bg-white
          border-r
          border-gray-200
          overflow-y-auto
        "
      >
        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}
      <main
        className="
          min-h-screen
          pt-16
          md:ml-64
        "
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="
              mb-5
              rounded-xl
              bg-[#30475E]
              px-4
              py-2
              font-medium
              text-white
              shadow-sm
              transition
              hover:bg-[#222831]
              md:hidden
            "
          >
            ☰ Menu
          </button>

          {/* =================================================
              PAGE HEADER
              ================================================= */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#222831]">
              📱 Emergency SMS Broadcast
            </h1>
            <p className="mt-2 text-gray-500">
              Send mass SMS alerts to volunteers in a specific district.
            </p>
          </div>

          {/* =================================================
              FORM + LOGS
              ================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* =================================================
                LEFT: COMPOSE BROADCAST
                ================================================= */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Compose Broadcast
                </h2>

                <form onSubmit={handleSendBroadcast} className="space-y-6">
                  {/* Select Draft */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Load from Alert Draft (Optional)
                    </label>
                    <select
                      value={selectedDraft}
                      onChange={handleDraftSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a draft...</option>
                      {drafts.map((draft) => (
                        <option key={draft._id} value={draft._id}>
                          {draft.messageBody.substring(0, 50)}... (
                          {draft.district}) - {draft.severity}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target District *
                    </label>
                    <select
                      value={district}
                      onChange={handleDistrictChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a district...</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    {showPreview && (
                      <p className="mt-1 text-sm text-gray-500">
                        {previewVolunteers.length} volunteers in this district
                      </p>
                    )}
                  </div>

                  {/* Severity Display */}
                  {severity && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <span className="font-semibold">Severity:</span>{" "}
                        {severity}
                      </p>
                    </div>
                  )}

                  {/* Message Body */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Body *
                    </label>
                    <textarea
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      rows={5}
                      maxLength={1600}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your emergency alert message..."
                      required
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {messageBody.length}/1600 characters
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "🚨 Send Broadcast"}
                    </button>
                  </div>
                </form>

                {/* Broadcast Result */}
                {broadcastResult && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Broadcast Result
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-2 font-medium">
                          {broadcastResult.totalVolunteers}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-600">✓ Sent:</span>
                        <span className="ml-2 font-medium">
                          {broadcastResult.sentCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-red-600">✗ Failed:</span>
                        <span className="ml-2 font-medium">
                          {broadcastResult.failedCount}
                        </span>
                      </div>
                    </div>
                    {broadcastResult.mockMode && (
                      <p className="mt-2 text-xs text-yellow-600">
                        ⚡ MOCK MODE: SMS were simulated, not actually sent.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                RIGHT: DELIVERY LOGS
                ================================================= */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">📋 Delivery Logs</h2>

                {deliveryLogs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No SMS logs yet.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {deliveryLogs.slice(0, 10).map((log) => (
                      <div
                        key={log._id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {log.messageBody.substring(0, 60)}...
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              📍 {log.district}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                          <span>{log.deliveryLog?.length || 0} recipients</span>
                          <span>
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              VOLUNTEER PREVIEW TABLE
              ================================================= */}
          {showPreview && previewVolunteers.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3">
                Volunteers in {district} ({previewVolunteers.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Phone
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewVolunteers.slice(0, 10).map((vol) => (
                      <tr key={vol._id}>
                        <td className="px-4 py-2 text-sm">{vol.fullName}</td>
                        <td className="px-4 py-2 text-sm">{vol.phone}</td>
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              vol.status === "available"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {vol.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {previewVolunteers.length > 10 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-2 text-sm text-gray-500 text-center"
                        >
                          +{previewVolunteers.length - 10} more volunteers
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SMSBroadcast;
