import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../components/AdminLayout";

const EmailLogs = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://disaster-relief-coordination-system-0z00.onrender.com/api";

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/notifications/email-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data.data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load email logs");
    } finally {
      setLoading(false);
    }
  };

  const retryEmail = async (log) => {
    try {
      const emailEntry = log.emailLog?.[0];
      if (!emailEntry) {
        toast.error("No email entry found");
        return;
      }

      const response = await axios.post(
        `${API_URL}/notifications/retry-email/${log._id}`,
        {
          donorEmail: emailEntry.donorEmail,
          donorName: "Donor",
          amount: 100,
          campaignTitle: "Campaign",
          donationId: emailEntry.donationId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Email retry sent successfully!");
      fetchLogs();
    } catch (error) {
      console.error("Error retrying email:", error);
      toast.error(error.response?.data?.message || "Failed to retry email");
    }
  };

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

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          📧 Email Delivery Logs
        </h1>
        <p className="text-gray-500 mb-8">
          View all donor thank-you email delivery statuses.
        </p>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              Email Logs ({logs.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-2">📭</p>
              <p>No email logs found.</p>
              <p className="text-sm">
                Email logs will appear here after donations are made.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donor Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => {
                    const emailEntry = log.emailLog?.[0];
                    return (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {emailEntry?.donorEmail || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                              emailEntry?.status,
                            )}`}
                          >
                            {emailEntry?.status || "pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {emailEntry?.timestamp
                            ? new Date(emailEntry.timestamp).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {emailEntry?.status === "failed" && (
                            <button
                              onClick={() => retryEmail(log)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              Retry
                            </button>
                          )}
                          {emailEntry?.status === "sent" && (
                            <span className="text-green-600 text-sm">
                              ✓ Sent
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmailLogs;
