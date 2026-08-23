import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";

const EmailLogs = () => {
  const { token } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://disaster-relief-coordination-system-kmf2.onrender.com/api";

  // =========================================================
  // FETCH EMAIL LOGS
  // =========================================================

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/notifications/email-logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogs(response.data.data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load email logs");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RETRY EMAIL
  // =========================================================

  const retryEmail = async (log) => {
    try {
      const emailEntry = log.emailLog?.[0];

      if (!emailEntry) {
        toast.error("No email entry found");
        return;
      }

      await axios.post(
        `${API_URL}/notifications/retry-email/${log._id}`,
        {
          donorEmail: emailEntry.donorEmail,
          donorName: "Donor",
          amount: 100,
          campaignTitle: "Campaign",
          donationId: emailEntry.donationId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Email retry sent successfully!");

      await fetchLogs();
    } catch (error) {
      console.error("Error retrying email:", error);

      toast.error(error.response?.data?.message || "Failed to retry email");
    }
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadge = (status) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";

      case "failed":
        return "bg-red-100 text-red-800";

      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* =====================================================
          NAVBAR
          DO NOT CHANGE NAVBAR
      ===================================================== */}

      <div className="fixed left-0 right-0 top-0 z-50">
        <Navbar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* =====================================================
          DESKTOP SIDEBAR
          Hidden on mobile so it does not cover the navbar.
      ===================================================== */}

      <aside
        className="
          fixed
          left-0
          top-16
          bottom-0
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
          <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        </div>
      </aside>

      {/* =====================================================
          MOBILE SIDEBAR
          AdminSidebar controls its mobile open/close behavior.
      ===================================================== */}

      <div className="md:hidden">
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
        <div className="w-full p-4 sm:p-6 lg:p-8">
          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            onClick={() => setSidebarOpen(true)}
            className="
              mb-5
              rounded-xl
              bg-[#30475E]
              px-4
              py-2.5
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
            <h1
              className="
                text-2xl
                font-bold
                text-gray-800
                sm:text-3xl
              "
            >
              📧 Email Delivery Logs
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              View all donor thank-you email delivery statuses.
            </p>
          </div>

          {/* =================================================
              LOGS CARD
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
                flex
                flex-col
                gap-2
                border-b
                border-gray-200
                px-4
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-6
              "
            >
              <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
                Email Logs ({logs.length})
              </h2>

              <button
                onClick={fetchLogs}
                disabled={loading}
                className="
                  w-fit
                  rounded-lg
                  border
                  border-gray-200
                  bg-gray-50
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-gray-600
                  transition
                  hover:bg-gray-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading ? "Loading..." : "↻ Refresh"}
              </button>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div
                  className="
                    mx-auto
                    h-8
                    w-8
                    animate-spin
                    rounded-full
                    border-4
                    border-gray-200
                    border-t-[#00ADB5]
                  "
                />

                <p className="mt-3 text-sm">Loading email logs...</p>
              </div>
            ) : logs.length === 0 ? (
              /* =================================================
                  EMPTY STATE
              ================================================= */

              <div className="p-8 text-center text-gray-500 sm:p-12">
                <p className="mb-3 text-4xl">📭</p>

                <p className="font-medium">No email logs found.</p>

                <p className="mt-1 text-sm">
                  Email logs will appear here after donations are made.
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
                          Donor Email
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
                          Status
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
                          Timestamp
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
                      {logs.map((log) => {
                        const emailEntry = log.emailLog?.[0];

                        return (
                          <tr
                            key={log._id}
                            className="transition hover:bg-gray-50"
                          >
                            {/* Email */}

                            <td className="max-w-md px-6 py-4 text-sm text-gray-900">
                              <div className="break-all">
                                {emailEntry?.donorEmail || "N/A"}
                              </div>
                            </td>

                            {/* Status */}

                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`
                                  rounded-full
                                  px-2.5
                                  py-1
                                  text-xs
                                  font-semibold
                                  ${getStatusBadge(emailEntry?.status)}
                                `}
                              >
                                {emailEntry?.status || "pending"}
                              </span>
                            </td>

                            {/* Timestamp */}

                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {emailEntry?.timestamp
                                ? new Date(
                                    emailEntry.timestamp,
                                  ).toLocaleString()
                                : "N/A"}
                            </td>

                            {/* Action */}

                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              {emailEntry?.status === "failed" && (
                                <button
                                  onClick={() => retryEmail(log)}
                                  className="
                                    text-sm
                                    font-medium
                                    text-blue-600
                                    transition
                                    hover:text-blue-800
                                  "
                                >
                                  Retry
                                </button>
                              )}

                              {emailEntry?.status === "sent" && (
                                <span className="text-sm text-green-600">
                                  ✓ Sent
                                </span>
                              )}

                              {!emailEntry?.status ||
                              emailEntry?.status === "pending" ? (
                                <span className="text-sm text-yellow-600">
                                  Pending
                                </span>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    MOBILE CARDS
                ================================================= */}

                <div className="space-y-3 p-4 md:hidden">
                  {logs.map((log) => {
                    const emailEntry = log.emailLog?.[0];

                    return (
                      <div
                        key={log._id}
                        className="
                          rounded-xl
                          border
                          border-gray-100
                          bg-white
                          p-4
                          shadow-sm
                        "
                      >
                        {/* Email + Status */}

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-3
                          "
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Donor Email
                            </p>

                            <p
                              className="
                                mt-1
                                break-all
                                text-sm
                                font-semibold
                                text-gray-900
                              "
                            >
                              {emailEntry?.donorEmail || "N/A"}
                            </p>
                          </div>

                          <span
                            className={`
                              shrink-0
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              ${getStatusBadge(emailEntry?.status)}
                            `}
                          >
                            {emailEntry?.status || "pending"}
                          </span>
                        </div>

                        {/* Timestamp */}

                        <div className="mt-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Timestamp
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            {emailEntry?.timestamp
                              ? new Date(emailEntry.timestamp).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>

                        {/* Action */}

                        <div
                          className="
                            mt-4
                            flex
                            items-center
                            justify-between
                            border-t
                            border-gray-100
                            pt-3
                          "
                        >
                          <span className="text-xs text-gray-400">
                            Email delivery
                          </span>

                          {emailEntry?.status === "failed" && (
                            <button
                              onClick={() => retryEmail(log)}
                              className="
                                rounded-lg
                                bg-blue-50
                                px-3
                                py-2
                                text-sm
                                font-semibold
                                text-blue-600
                                transition
                                hover:bg-blue-100
                              "
                            >
                              Retry
                            </button>
                          )}

                          {emailEntry?.status === "sent" && (
                            <span className="text-sm font-medium text-green-600">
                              ✓ Sent
                            </span>
                          )}

                          {!emailEntry?.status ||
                          emailEntry?.status === "pending" ? (
                            <span className="text-sm font-medium text-yellow-600">
                              Pending
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailLogs;
