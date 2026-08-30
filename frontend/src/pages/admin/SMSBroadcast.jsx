import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";

const SMSBroadcast = () => {
  const { token } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    "https://disaster-relief-coordination-system-kmf2.onrender.com/api";

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
  // FETCH DRAFTS + LOGS
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDrafts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching drafts:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/sms/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
        console.error("Failed to load draft:", error);
        toast.error("Failed to load draft");
      }
    } else {
      setMessageBody("");
      setDistrict("");
      setSeverity("");
      setPreviewVolunteers([]);
      setShowPreview(false);
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPreviewVolunteers(response.data.data || []);
      setShowPreview(true);
    } catch (error) {
      console.error("Error fetching volunteers:", error);

      setPreviewVolunteers([]);
      setShowPreview(false);
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
        messageBody,
        district,
        severity,
      };

      const response = await axios.post(`${API_URL}/sms/broadcast`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBroadcastResult(response.data.data);

      toast.success(response.data.message || "Broadcast sent successfully!");

      await fetchLogs();

      setSelectedDraft("");
      setMessageBody("");
      setDistrict("");
      setSeverity("");
      setPreviewVolunteers([]);
      setShowPreview(false);
    } catch (error) {
      console.error("Error sending broadcast:", error);

      toast.error(error.response?.data?.message || "Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // STATUS COLOR
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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F7FA]">
      {/* =====================================================
          NAVBAR
          KEEPING YOUR EXISTING NAVBAR UNCHANGED
      ===================================================== */}

      <div className="fixed left-0 right-0 top-0 z-50">
        <Navbar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className="
          fixed
          bottom-0
          left-0
          top-16
          z-40
          hidden
          w-64
          border-r
          border-gray-200
          bg-white
          md:block
        "
      >
        <div className="h-full overflow-y-auto">
          <AdminSidebar open={true} setOpen={setSidebarOpen} />
        </div>
      </aside>

      {/* =====================================================
          MOBILE SIDEBAR
          IMPORTANT:
          top-16 keeps it BELOW the navbar
          z-40 keeps navbar ABOVE sidebar
      ===================================================== */}

      {sidebarOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="
              absolute
              inset-0
              bg-black/40
            "
          />

          {/* Sidebar */}

          <div
            className="
              absolute
              bottom-0
              left-0
              top-0
              w-[min(82vw,320px)]
              overflow-y-auto
              bg-white
              shadow-2xl
            "
          >
            <AdminSidebar open={true} setOpen={setSidebarOpen} />
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main
        className="
          min-h-screen
          w-full
          pt-16
          md:ml-64
          md:w-[calc(100%-16rem)]
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1800px]
            px-3
            py-5
            sm:px-5
            sm:py-6
            lg:px-8
            lg:py-8
            xl:px-10
          "
        >
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <header className="mb-6 sm:mb-8">
            <div className="max-w-3xl">
              <div
                className="
                  mb-3
                  inline-flex
                  items-center
                  rounded-full
                  bg-red-50
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-red-700
                "
              >
                Emergency Communication
              </div>

              <h1
                className="
                  text-2xl
                  font-bold
                  leading-tight
                  text-[#222831]
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                📱 Emergency SMS Broadcast
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
                Send mass SMS alerts to volunteers in a specific district.
              </p>
            </div>
          </header>

          {/* =================================================
              FORM + LOGS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              gap-5
              xl:grid-cols-3
              xl:gap-6
            "
          >
            {/* =================================================
                COMPOSE BROADCAST
            ================================================= */}

            <div className="min-w-0 xl:col-span-2">
              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  shadow-sm
                "
              >
                <div
                  className="
                    border-b
                    border-gray-100
                    px-4
                    py-5
                    sm:px-6
                  "
                >
                  <h2 className="text-lg font-bold text-[#222831] sm:text-xl">
                    Compose Broadcast
                  </h2>

                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    Configure the emergency message and select its target
                    district.
                  </p>
                </div>

                <div className="p-4 sm:p-6">
                  <form
                    onSubmit={handleSendBroadcast}
                    className="space-y-5 sm:space-y-6"
                  >
                    {/* Draft */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Load from Alert Draft
                        <span className="ml-1 text-xs font-normal text-gray-400">
                          (Optional)
                        </span>
                      </label>

                      <select
                        value={selectedDraft}
                        onChange={handleDraftSelect}
                        className="
                          w-full
                          rounded-xl
                          border
                          border-gray-300
                          bg-white
                          px-3
                          py-3
                          text-sm
                          text-gray-700
                          outline-none
                          transition
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-100
                        "
                      >
                        <option value="">Select a draft...</option>

                        {drafts.map((draft) => (
                          <option key={draft._id} value={draft._id}>
                            {(draft.messageBody || "").substring(0, 50)}
                            ... ({draft.district}) - {draft.severity}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Target District *
                      </label>

                      <select
                        value={district}
                        onChange={handleDistrictChange}
                        required
                        className="
                          w-full
                          rounded-xl
                          border
                          border-gray-300
                          bg-white
                          px-3
                          py-3
                          text-sm
                          text-gray-700
                          outline-none
                          transition
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-100
                        "
                      >
                        <option value="">Select a district...</option>

                        {districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>

                      {showPreview && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span
                            className="
                              inline-flex
                              rounded-full
                              bg-green-50
                              px-2.5
                              py-1
                              font-semibold
                              text-green-700
                            "
                          >
                            {previewVolunteers.length} volunteers
                          </span>

                          <span>in {district}</span>
                        </div>
                      )}
                    </div>

                    {/* Severity */}

                    {severity && (
                      <div
                        className="
                          rounded-xl
                          border
                          border-blue-200
                          bg-blue-50
                          p-4
                        "
                      >
                        <p className="text-sm text-blue-700">
                          <span className="font-bold">Severity:</span>{" "}
                          {severity}
                        </p>
                      </div>
                    )}

                    {/* Message */}

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Message Body *
                        </label>

                        <span
                          className={`
                            shrink-0
                            text-xs
                            font-medium
                            ${
                              messageBody.length > 1500
                                ? "text-red-600"
                                : "text-gray-400"
                            }
                          `}
                        >
                          {messageBody.length}/1600
                        </span>
                      </div>

                      <textarea
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                        rows={6}
                        maxLength={1600}
                        required
                        className="
                          min-h-[150px]
                          w-full
                          resize-y
                          rounded-xl
                          border
                          border-gray-300
                          px-3
                          py-3
                          text-sm
                          leading-6
                          text-gray-700
                          outline-none
                          transition
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-100
                        "
                        placeholder="Enter your emergency alert message..."
                      />
                    </div>

                    {/* Submit */}

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={loading}
                        className="
                          flex
                          w-full
                          items-center
                          justify-center
                          rounded-xl
                          bg-red-600
                          px-6
                          py-3.5
                          text-sm
                          font-bold
                          text-white
                          shadow-sm
                          transition
                          hover:bg-red-700
                          active:scale-[0.99]
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                          sm:w-auto
                        "
                      >
                        {loading ? "Sending..." : "🚨 Send Broadcast"}
                      </button>
                    </div>
                  </form>

                  {/* Broadcast Result */}

                  {broadcastResult && (
                    <div
                      className="
                        mt-6
                        overflow-hidden
                        rounded-2xl
                        border
                        border-gray-200
                        bg-gray-50
                      "
                    >
                      <div className="border-b border-gray-200 px-4 py-4 sm:px-5">
                        <h3 className="text-sm font-bold text-gray-700">
                          Broadcast Result
                        </h3>
                      </div>

                      <div
                        className="
                          grid
                          grid-cols-1
                          divide-y
                          divide-gray-200
                          sm:grid-cols-3
                          sm:divide-x
                          sm:divide-y-0
                        "
                      >
                        <div className="p-4">
                          <span className="text-xs text-gray-500">Total</span>

                          <p className="mt-1 text-xl font-bold text-gray-800">
                            {broadcastResult.totalVolunteers}
                          </p>
                        </div>

                        <div className="p-4">
                          <span className="text-xs text-green-600">✓ Sent</span>

                          <p className="mt-1 text-xl font-bold text-green-700">
                            {broadcastResult.sentCount}
                          </p>
                        </div>

                        <div className="p-4">
                          <span className="text-xs text-red-600">✗ Failed</span>

                          <p className="mt-1 text-xl font-bold text-red-700">
                            {broadcastResult.failedCount}
                          </p>
                        </div>
                      </div>

                      {broadcastResult.mockMode && (
                        <div className="border-t border-gray-200 px-4 py-3 sm:px-5">
                          <p className="text-xs font-medium text-yellow-700">
                            ⚡ MOCK MODE: SMS were simulated, not actually sent.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                DELIVERY LOGS
            ================================================= */}

            <div className="min-w-0">
              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-gray-100
                    px-4
                    py-5
                    sm:px-6
                  "
                >
                  <div>
                    <h2 className="text-lg font-bold text-[#222831] sm:text-xl">
                      📋 Delivery Logs
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Latest SMS activity
                    </p>
                  </div>

                  <span
                    className="
                      shrink-0
                      rounded-full
                      bg-gray-100
                      px-2.5
                      py-1
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    {deliveryLogs.length}
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  {deliveryLogs.length === 0 ? (
                    <div className="rounded-xl bg-gray-50 p-6 text-center">
                      <div className="text-2xl">📋</div>

                      <p className="mt-2 text-sm font-medium text-gray-500">
                        No SMS logs yet.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="
                        max-h-[520px]
                        space-y-3
                        overflow-y-auto
                        pr-1
                      "
                    >
                      {deliveryLogs.slice(0, 10).map((log) => (
                        <div
                          key={log._id}
                          className="
                              overflow-hidden
                              rounded-xl
                              border
                              border-gray-100
                              bg-gray-50
                              p-3
                            "
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="break-words text-sm font-semibold leading-5 text-gray-800">
                                {(log.messageBody || "").substring(0, 80)}
                                {(log.messageBody || "").length > 80
                                  ? "..."
                                  : ""}
                              </p>

                              <p className="mt-1 break-words text-xs text-gray-500">
                                📍 {log.district || "Unknown"}
                              </p>
                            </div>

                            <span
                              className={`
                                  shrink-0
                                  rounded-full
                                  px-2
                                  py-1
                                  text-[10px]
                                  font-bold
                                  uppercase
                                  ${getStatusColor(log.status)}
                                `}
                            >
                              {log.status}
                            </span>
                          </div>

                          <div
                            className="
                                mt-3
                                flex
                                flex-col
                                gap-1
                                border-t
                                border-gray-200
                                pt-2
                                text-[11px]
                                text-gray-400
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                              "
                          >
                            <span>
                              {log.deliveryLog?.length || 0} recipients
                            </span>

                            <span>
                              {log.createdAt
                                ? new Date(log.createdAt).toLocaleString()
                                : "Date unavailable"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              VOLUNTEER PREVIEW
          ================================================= */}

          {showPreview && previewVolunteers.length > 0 && (
            <section
              className="
                mt-5
                overflow-hidden
                rounded-2xl
                border
                border-gray-100
                bg-white
                shadow-sm
                sm:mt-6
              "
            >
              <div
                className="
                  border-b
                  border-gray-100
                  px-4
                  py-5
                  sm:px-6
                "
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#222831]">
                      Volunteers in {district}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                      Showing up to 10 volunteers from this district.
                    </p>
                  </div>

                  <span
                    className="
                      w-fit
                      rounded-full
                      bg-green-50
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-green-700
                    "
                  >
                    {previewVolunteers.length} volunteers
                  </span>
                </div>
              </div>

              {/* Desktop Table */}

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6">
                        Name
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6">
                        Phone
                      </th>

                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {previewVolunteers.slice(0, 10).map((vol) => (
                      <tr key={vol._id} className="transition hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 sm:px-6">
                          {vol.fullName || "Unknown"}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-600 sm:px-6">
                          {vol.phone || "N/A"}
                        </td>

                        <td className="px-4 py-3 text-sm sm:px-6">
                          <span
                            className={`
                                inline-flex
                                rounded-full
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                ${
                                  vol.status === "available"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              `}
                          >
                            {vol.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {previewVolunteers.length > 10 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="
                            px-4
                            py-4
                            text-center
                            text-sm
                            text-gray-500
                          "
                        >
                          +{previewVolunteers.length - 10} more volunteers
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}

              <div className="space-y-3 p-4 md:hidden">
                {previewVolunteers.slice(0, 10).map((vol) => (
                  <div
                    key={vol._id}
                    className="
                        rounded-xl
                        border
                        border-gray-100
                        bg-gray-50
                        p-4
                      "
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-gray-800">
                          {vol.fullName || "Unknown"}
                        </p>

                        <p className="mt-1 break-all text-sm text-gray-500">
                          {vol.phone || "N/A"}
                        </p>
                      </div>

                      <span
                        className={`
                            shrink-0
                            rounded-full
                            px-2.5
                            py-1
                            text-[10px]
                            font-semibold
                            ${
                              vol.status === "available"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          `}
                      >
                        {vol.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                ))}

                {previewVolunteers.length > 10 && (
                  <div className="rounded-xl bg-gray-50 p-3 text-center text-xs text-gray-500">
                    +{previewVolunteers.length - 10} more volunteers
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="h-6 sm:h-8" />
        </div>
      </main>
    </div>
  );
};

export default SMSBroadcast;
