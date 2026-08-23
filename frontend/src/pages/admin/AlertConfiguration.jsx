import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";
import { useAuth } from "../../context/AuthContext";

const AlertConfigurationMatrix = () => {
  const { token } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    messageBody: "",
    district: "",
    severity: "Advisory",
    targetGroups: [],
  });

  const [districts, setDistricts] = useState([]);
  const [drafts, setDrafts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filter, setFilter] = useState({
    status: "draft",
    district: "",
    severity: "",
  });

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://disaster-relief-coordination-system-0z00.onrender.com/api";

  // =========================================================
  // FETCH DISTRICTS
  // Only run once when page loads
  // =========================================================
  useEffect(() => {
    fetchDistricts();
  }, []);

  // =========================================================
  // FETCH DRAFTS
  // Run whenever filters change
  // =========================================================
  useEffect(() => {
    fetchDrafts();
  }, [filter]);

  // =========================================================
  // FETCH DISTRICT LIST
  // =========================================================
  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/districts`);

      setDistricts(response.data.data);
    } catch (error) {
      console.error("Error fetching districts:", error);

      toast.error("Failed to load districts");
    }
  };

  // =========================================================
  // FETCH ALERT DRAFTS
  // =========================================================
  const fetchDrafts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filter.status) {
        params.append("status", filter.status);
      }

      if (filter.district) {
        params.append("district", filter.district);
      }

      if (filter.severity) {
        params.append("severity", filter.severity);
      }

      const response = await axios.get(
        `${API_URL}/notifications?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDrafts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching drafts:", error);

      toast.error(
        error.response?.data?.message || "Failed to load alert drafts",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HANDLE FORM INPUT
  // =========================================================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Target group checkbox
    if (type === "checkbox" && name === "targetGroups") {
      setFormData((previous) => {
        if (checked) {
          return {
            ...previous,
            targetGroups: [...previous.targetGroups, value],
          };
        }

        return {
          ...previous,
          targetGroups: previous.targetGroups.filter(
            (group) => group !== value,
          ),
        };
      });

      return;
    }

    // Normal input/select
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // CREATE / UPDATE ALERT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.messageBody.trim()) {
      toast.error("Please enter a message body");
      return;
    }

    if (!formData.district) {
      toast.error("Please select a district");
      return;
    }

    if (!formData.severity) {
      toast.error("Please select severity");
      return;
    }

    if (formData.targetGroups.length === 0) {
      toast.error("Please select at least one target group");
      return;
    }

    try {
      setLoading(true);

      const url = editingId
        ? `${API_URL}/notifications/${editingId}`
        : `${API_URL}/notifications`;

      const method = editingId ? "patch" : "post";

      await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(
        editingId
          ? "Alert updated successfully!"
          : "Alert draft created successfully!",
      );

      // Reset form
      resetForm();

      // Refresh drafts
      await fetchDrafts();
    } catch (error) {
      console.error("Error saving alert:", error);

      toast.error(error.response?.data?.message || "Failed to save alert");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EDIT ALERT
  // =========================================================
  const handleEdit = (draft) => {
    setFormData({
      messageBody: draft.messageBody || "",
      district: draft.district || "",
      severity: draft.severity || "Advisory",

      // Make sure old data doesn't break if targetGroups
      // somehow comes as a string
      targetGroups: Array.isArray(draft.targetGroups)
        ? draft.targetGroups
        : draft.targetGroups
          ? [draft.targetGroups]
          : [],
    });

    setEditingId(draft._id);

    // Scroll to form
    setTimeout(() => {
      const formElement = document.getElementById("alertForm");

      if (formElement) {
        formElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // =========================================================
  // DELETE ALERT
  // =========================================================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this alert draft?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Alert draft deleted successfully");

      await fetchDrafts();
    } catch (error) {
      console.error("Error deleting alert:", error);

      toast.error(error.response?.data?.message || "Failed to delete alert");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================
  const resetForm = () => {
    setFormData({
      messageBody: "",
      district: "",
      severity: "Advisory",
      targetGroups: [],
    });

    setEditingId(null);
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================
  const handleCancel = () => {
    resetForm();
  };

  // =========================================================
  // SEVERITY BADGE
  // =========================================================
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800";

      case "Warning":
        return "bg-yellow-100 text-yellow-800";

      case "Advisory":
        return "bg-blue-100 text-blue-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================
  const getStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-700";

      case "sent":
        return "bg-green-100 text-green-800";

      case "failed":
        return "bg-red-100 text-red-800";

      case "cancelled":
        return "bg-gray-100 text-gray-500";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
          Navbar + Sidebar remain fixed
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
              Alert Configuration Matrix
            </h1>

            <p className="mt-2 text-gray-500">
              Create, manage, and review emergency alert configurations for
              disaster response.
            </p>
          </div>

          {/* =================================================
              ALERT FORM
              ================================================= */}
          <div
            id="alertForm"
            className="
              mb-8
              max-w-5xl
              rounded-2xl
              bg-white
              p-6
              shadow-sm
              sm:p-8
            "
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#222831]">
                {editingId ? "Edit Alert Draft" : "Create Alert Draft"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Configure the alert message, affected district, severity, and
                target recipient groups.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message */}
              <div>
                <label
                  htmlFor="messageBody"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[#222831]
                  "
                >
                  Alert Message *
                </label>

                <textarea
                  id="messageBody"
                  name="messageBody"
                  value={formData.messageBody}
                  onChange={handleInputChange}
                  rows={5}
                  maxLength={1600}
                  required
                  placeholder="Enter emergency alert message..."
                  className="
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-[#00ADB5]
                    focus:ring-2
                    focus:ring-[#00ADB5]/20
                  "
                />

                <div className="mt-1 text-right text-xs text-gray-500">
                  {formData.messageBody.length}/1600 characters
                </div>
              </div>

              {/* District + Severity */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* District */}
                <div>
                  <label
                    htmlFor="district"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-[#222831]
                    "
                  >
                    District *
                  </label>

                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-300
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#00ADB5]
                      focus:ring-2
                      focus:ring-[#00ADB5]/20
                    "
                  >
                    <option value="">Select a district</option>

                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severity */}
                <div>
                  <label
                    htmlFor="severity"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-[#222831]
                    "
                  >
                    Severity *
                  </label>

                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-300
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-[#00ADB5]
                      focus:ring-2
                      focus:ring-[#00ADB5]/20
                    "
                  >
                    <option value="Advisory">Advisory</option>

                    <option value="Warning">Warning</option>

                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Target Groups */}
              <div>
                <label
                  className="
                    mb-3
                    block
                    text-sm
                    font-semibold
                    text-[#222831]
                  "
                >
                  Target Recipient Groups *
                </label>

                <div className="flex flex-wrap gap-4">
                  {["Volunteers", "Donors", "All"].map((group) => (
                    <label
                      key={group}
                      className="
                        flex
                        cursor-pointer
                        items-center
                        rounded-xl
                        border
                        border-gray-200
                        px-4
                        py-3
                        transition
                        hover:bg-gray-50
                      "
                    >
                      <input
                        type="checkbox"
                        name="targetGroups"
                        value={group}
                        checked={formData.targetGroups.includes(group)}
                        onChange={handleInputChange}
                        className="
                          h-4
                          w-4
                          rounded
                          border-gray-300
                          text-[#00ADB5]
                          focus:ring-[#00ADB5]
                        "
                      />

                      <span className="ml-2 text-sm text-gray-700">
                        {group}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-t
                  border-gray-200
                  pt-6
                  sm:flex-row
                  sm:justify-end
                "
              >
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="
                      rounded-xl
                      border
                      border-gray-300
                      px-6
                      py-3
                      font-semibold
                      text-gray-700
                      transition
                      hover:bg-gray-100
                    "
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    rounded-xl
                    bg-[#00ADB5]
                    px-6
                    py-3
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#0097A0]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading
                    ? "Saving..."
                    : editingId
                      ? "Update Draft"
                      : "Create Alert Draft"}
                </button>
              </div>
            </form>
          </div>

          {/* =================================================
              FILTERS
              ================================================= */}
          <div
            className="
              mb-6
              max-w-5xl
              rounded-2xl
              bg-white
              p-6
              shadow-sm
            "
          >
            <h2 className="mb-4 text-lg font-bold text-[#222831]">
              Filter Alert Drafts
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  value={filter.status}
                  onChange={(e) =>
                    setFilter((previous) => ({
                      ...previous,
                      status: e.target.value,
                    }))
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#00ADB5]
                    focus:ring-2
                    focus:ring-[#00ADB5]/20
                  "
                >
                  <option value="">All Statuses</option>

                  <option value="draft">Draft</option>

                  <option value="sent">Sent</option>

                  <option value="failed">Failed</option>

                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* District */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  District
                </label>

                <select
                  value={filter.district}
                  onChange={(e) =>
                    setFilter((previous) => ({
                      ...previous,
                      district: e.target.value,
                    }))
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#00ADB5]
                    focus:ring-2
                    focus:ring-[#00ADB5]/20
                  "
                >
                  <option value="">All Districts</option>

                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Severity
                </label>

                <select
                  value={filter.severity}
                  onChange={(e) =>
                    setFilter((previous) => ({
                      ...previous,
                      severity: e.target.value,
                    }))
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#00ADB5]
                    focus:ring-2
                    focus:ring-[#00ADB5]/20
                  "
                >
                  <option value="">All Severities</option>

                  <option value="Advisory">Advisory</option>

                  <option value="Warning">Warning</option>

                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* =================================================
              DRAFT LIST
              ================================================= */}
          <div
            className="
              mb-8
              max-w-7xl
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-sm
            "
          >
            {/* Header */}
            <div
              className="
                flex
                flex-col
                gap-2
                border-b
                border-gray-200
                px-6
                py-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <h2 className="text-xl font-bold text-[#222831]">
                  Alert Drafts
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Previously created alert configurations
                </p>
              </div>

              <span
                className="
                  w-fit
                  rounded-full
                  bg-[#00ADB5]/10
                  px-3
                  py-1
                  text-sm
                  font-semibold
                  text-[#008F96]
                "
              >
                {drafts.length} draft
                {drafts.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="p-10 text-center text-gray-500">
                Loading alert drafts...
              </div>
            ) : drafts.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mb-2 text-4xl">📭</div>

                <p className="font-medium text-gray-700">
                  No alert drafts found
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Create a new alert configuration above.
                </p>
              </div>
            ) : (
              /* =================================================
                 TABLE
                 ================================================= */
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Message
                      </th>

                      <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        District
                      </th>

                      <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Severity
                      </th>

                      <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Target Groups
                      </th>

                      <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Created
                      </th>

                      <th className="whitespace-nowrap px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {drafts.map((draft) => (
                      <tr
                        key={draft._id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* Message */}
                        <td className="max-w-sm px-6 py-5">
                          <div
                            className="
                              max-w-xs
                              truncate
                              text-sm
                              font-medium
                              text-gray-800
                            "
                            title={draft.messageBody}
                          >
                            {draft.messageBody}
                          </div>
                        </td>

                        {/* District */}
                        <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-700">
                          {draft.district}
                        </td>

                        {/* Severity */}
                        <td className="whitespace-nowrap px-6 py-5">
                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              ${getSeverityColor(draft.severity)}
                            `}
                          >
                            {draft.severity}
                          </span>
                        </td>

                        {/* Target Groups */}
                        <td className="px-6 py-5 text-sm text-gray-700">
                          {Array.isArray(draft.targetGroups)
                            ? draft.targetGroups.join(", ")
                            : draft.targetGroups}
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-6 py-5">
                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              ${getStatusBadge(draft.status)}
                            `}
                          >
                            {draft.status}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
                          {draft.createdAt
                            ? new Date(draft.createdAt).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap px-6 py-5 text-right">
                          {draft.status === "draft" ? (
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(draft)}
                                className="
                                  rounded-lg
                                  px-3
                                  py-2
                                  text-sm
                                  font-semibold
                                  text-[#008F96]
                                  transition
                                  hover:bg-[#00ADB5]/10
                                "
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(draft._id)}
                                className="
                                  rounded-lg
                                  px-3
                                  py-2
                                  text-sm
                                  font-semibold
                                  text-red-600
                                  transition
                                  hover:bg-red-50
                                "
                              >
                                Delete
                              </button>
                            </div>
                          ) : draft.status === "sent" ? (
                            <span className="text-sm text-gray-400">
                              ✓ Sent
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
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

export default AlertConfigurationMatrix;
