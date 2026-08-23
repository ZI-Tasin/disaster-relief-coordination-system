import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://disaster-relief-coordination-system-0z00.onrender.com";

export default function CampaignAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // FETCH ANALYTICS
  // =====================================================

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(`${API_URL}/api/campaign-analytics`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load campaign analytics.");
      }

      setAnalytics(data);
    } catch (error) {
      console.error("Campaign analytics error:", error);

      setError(error.message || "Failed to load campaign analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // =====================================================
  // HELPERS
  // =====================================================

  const formatMoney = (value) =>
    `৳${Number(value || 0).toLocaleString("en-BD")}`;

  const formatNumber = (value) => Number(value || 0).toLocaleString("en-BD");

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (normalizedStatus === "paid") {
      return "bg-green-50 text-green-700 border-green-100";
    }

    if (normalizedStatus === "failed") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    if (normalizedStatus === "pending") {
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    }

    return "bg-gray-50 text-gray-600 border-gray-100";
  };

  const getCampaignStatus = (campaign) => {
    const progress = Number(campaign?.targetProgress || 0);

    if (progress >= 100) {
      return {
        label: "Target Reached",
        className: "bg-green-50 text-green-700 border-green-100",
      };
    }

    if (progress >= 75) {
      return {
        label: "Almost There",
        className: "bg-blue-50 text-blue-700 border-blue-100",
      };
    }

    if (progress >= 25) {
      return {
        label: "In Progress",
        className: "bg-yellow-50 text-yellow-700 border-yellow-100",
      };
    }

    return {
      label: "Needs Support",
      className: "bg-orange-50 text-orange-700 border-orange-100",
    };
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <div className="flex min-h-screen">
          <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="flex min-h-[70vh] items-center justify-center">
              <div className="text-center">
                <div
                  className="
                    mx-auto
                    h-11
                    w-11
                    animate-spin
                    rounded-full
                    border-4
                    border-gray-200
                    border-t-[#00ADB5]
                  "
                />

                <p className="mt-4 text-sm font-medium text-gray-600">
                  Loading campaign analytics...
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Preparing donation and campaign data
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <div className="flex min-h-screen">
          <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="
                mb-5
                rounded-xl
                bg-[#30475E]
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                md:hidden
              "
            >
              ☰ Menu
            </button>

            <div
              className="
                mx-auto
                max-w-3xl
                rounded-2xl
                border
                border-red-200
                bg-red-50
                p-6
                shadow-sm
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-red-100
                    text-lg
                    text-red-600
                  "
                >
                  !
                </div>

                <div>
                  <h2 className="text-lg font-bold text-red-800">
                    Unable to load campaign analytics
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-red-600">{error}</p>

                  <button
                    onClick={() => fetchAnalytics()}
                    className="
                      mt-5
                      rounded-xl
                      bg-[#30475E]
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-[#222831]
                    "
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const summary = analytics?.summary || {};

  const campaignBreakdown = analytics?.campaignBreakdown || [];

  const paymentStatusSummary = analytics?.paymentStatusSummary || [];

  const recentDonations = analytics?.recentDonations || [];

  // =====================================================
  // CALCULATED UI DATA
  // =====================================================

  const totalRaised = Number(summary.totalRaised || 0);

  const totalDonations = Number(summary.totalDonations || 0);

  const averageDonation = Number(summary.averageDonation || 0);

  const campaignCount = Number(summary.campaignCount || 0);

  const topCampaign =
    campaignBreakdown.length > 0
      ? [...campaignBreakdown].sort(
          (a, b) => Number(b.totalRaised || 0) - Number(a.totalRaised || 0),
        )[0]
      : null;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Navbar setSidebarOpen={setSidebarOpen} />

      <div className="flex min-h-screen">
        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {/* =================================================
              MOBILE MENU
          ================================================= */}

          <button
            onClick={() => setSidebarOpen(true)}
            className="
              mb-5
              rounded-xl
              bg-[#30475E]
              px-4
              py-2.5
              text-sm
              font-semibold
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

          <header
            className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="
                    rounded-full
                    bg-[#00ADB5]/10
                    px-3
                    py-1
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-[#008C93]
                  "
                >
                  Admin Analytics
                </span>
              </div>

              <h1
                className="
                  mt-3
                  text-2xl
                  font-bold
                  tracking-tight
                  text-[#222831]
                  sm:text-3xl
                "
              >
                Campaign Analytics
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-gray-500
                "
              >
                Monitor donation performance, campaign contributions, payment
                activity, and fundraising progress.
              </p>
            </div>

            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="
                flex
                w-fit
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-white
                px-5
                py-2.5
                text-sm
                font-semibold
                text-[#30475E]
                shadow-sm
                transition
                hover:border-[#00ADB5]
                hover:text-[#008C93]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <span className={refreshing ? "animate-spin" : ""}>↻</span>

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <section
            className="
              mt-8
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >
            {/* Total Raised */}

            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-6
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Raised
                  </p>

                  <p className="mt-3 text-2xl font-bold text-[#00ADB5] sm:text-3xl">
                    {formatMoney(totalRaised)}
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#00ADB5]/10
                    text-xl
                  "
                >
                  ৳
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                Successful donations only
              </p>
            </div>

            {/* Successful Donations */}

            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-6
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Successful Donations
                  </p>

                  <p className="mt-3 text-2xl font-bold text-[#30475E] sm:text-3xl">
                    {formatNumber(totalDonations)}
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#30475E]/10
                    text-lg
                  "
                >
                  ✓
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                Completed Stripe payments
              </p>
            </div>

            {/* Average Donation */}

            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-6
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Average Donation
                  </p>

                  <p className="mt-3 text-2xl font-bold text-blue-600 sm:text-3xl">
                    {formatMoney(averageDonation)}
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-lg
                    text-blue-600
                  "
                >
                  ↗
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                Average successful contribution
              </p>
            </div>

            {/* Campaign Count */}

            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-6
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Campaigns Receiving Funds
                  </p>

                  <p className="mt-3 text-2xl font-bold text-green-600 sm:text-3xl">
                    {formatNumber(campaignCount)}
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-green-50
                    text-lg
                    text-green-600
                  "
                >
                  #
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                Campaigns with paid donations
              </p>
            </div>
          </section>

          {/* =================================================
              TOP CAMPAIGN HIGHLIGHT
          ================================================= */}

          {topCampaign && (
            <section
              className="
                mt-6
                overflow-hidden
                rounded-2xl
                bg-[#30475E]
                p-6
                text-white
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-5
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Top Fundraising Campaign
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    {topCampaign.title}
                  </h2>

                  <p className="mt-1 text-sm text-white/60">
                    {topCampaign.location || "Location unavailable"}
                  </p>
                </div>

                <div className="lg:text-right">
                  <p className="text-2xl font-bold text-[#00ADB5]">
                    {formatMoney(topCampaign.totalRaised)}
                  </p>

                  <p className="mt-1 text-xs text-white/50">
                    {formatNumber(topCampaign.donationCount)} successful
                    donation
                    {Number(topCampaign.donationCount || 0) === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* =================================================
              CAMPAIGN BREAKDOWN
          ================================================= */}

          <section
            className="
              mt-6
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
                flex-col
                gap-2
                border-b
                border-gray-100
                p-6
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <h2 className="text-xl font-bold text-[#222831]">
                  Campaign Donation Breakdown
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Compare successful donations across campaigns.
                </p>
              </div>

              <span
                className="
                  w-fit
                  rounded-full
                  bg-gray-50
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-gray-500
                "
              >
                {formatNumber(campaignBreakdown.length)} campaign
                {campaignBreakdown.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Desktop Table */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Campaign
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Raised
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Donations
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Average
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Target Progress
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Share
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {campaignBreakdown.map((campaign) => {
                    const progress = Math.min(
                      Number(campaign.targetProgress || 0),
                      100,
                    );

                    const campaignStatus = getCampaignStatus(campaign);

                    return (
                      <tr
                        key={campaign.campaignId}
                        className="
                          border-b
                          border-gray-50
                          last:border-0
                          hover:bg-gray-50/70
                        "
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-[#222831]">
                            {campaign.title}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {campaign.disasterType ||
                              "Disaster type unavailable"}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {campaign.location || "Location unavailable"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-bold text-[#00ADB5]">
                            {formatMoney(campaign.totalRaised)}
                          </p>
                        </td>

                        <td className="px-6 py-5 font-medium text-gray-700">
                          {formatNumber(campaign.donationCount)}
                        </td>

                        <td className="px-6 py-5 font-medium text-gray-700">
                          {formatMoney(campaign.averageDonation)}
                        </td>

                        <td className="min-w-52.5 px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-[#00ADB5]"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>

                            <span className="w-12 text-right text-xs font-bold text-gray-600">
                              {Number(campaign.targetProgress || 0).toFixed(1)}%
                            </span>
                          </div>

                          <span
                            className={`
                              mt-2
                              inline-flex
                              rounded-full
                              border
                              px-2.5
                              py-1
                              text-[10px]
                              font-semibold
                              ${campaignStatus.className}
                            `}
                          >
                            {campaignStatus.label}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="font-semibold text-gray-700">
                            {Number(campaign.shareOfTotal || 0).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Campaign Cards */}

            <div className="space-y-4 p-4 md:hidden">
              {campaignBreakdown.map((campaign) => {
                const progress = Math.min(
                  Number(campaign.targetProgress || 0),
                  100,
                );

                const campaignStatus = getCampaignStatus(campaign);

                return (
                  <div
                    key={campaign.campaignId}
                    className="
                      rounded-xl
                      border
                      border-gray-100
                      p-4
                    "
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-[#222831]">
                          {campaign.title}
                        </h3>

                        <p className="mt-1 text-xs text-gray-400">
                          {campaign.location || "Location unavailable"}
                        </p>
                      </div>

                      <span
                        className="
                          shrink-0
                          rounded-full
                          bg-[#00ADB5]/10
                          px-2.5
                          py-1
                          text-xs
                          font-bold
                          text-[#008C93]
                        "
                      >
                        {Number(campaign.shareOfTotal || 0).toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Raised</p>

                        <p className="mt-1 font-bold text-[#00ADB5]">
                          {formatMoney(campaign.totalRaised)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Donations</p>

                        <p className="mt-1 font-bold text-gray-700">
                          {formatNumber(campaign.donationCount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Average</p>

                        <p className="mt-1 font-semibold text-gray-700">
                          {formatMoney(campaign.averageDonation)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Target Progress</p>

                        <p className="mt-1 font-semibold text-blue-600">
                          {Number(campaign.targetProgress || 0).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-[#00ADB5]"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <span
                        className={`
                          mt-3
                          inline-flex
                          rounded-full
                          border
                          px-2.5
                          py-1
                          text-[10px]
                          font-semibold
                          ${campaignStatus.className}
                        `}
                      >
                        {campaignStatus.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {campaignBreakdown.length === 0 && (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-400">
                  —
                </div>

                <p className="mt-3 text-sm font-semibold text-gray-600">
                  No successful campaign donations
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Campaign donation data will appear here after successful
                  payments.
                </p>
              </div>
            )}
          </section>

          {/* =================================================
              PAYMENT STATUS + RECENT DONATIONS
          ================================================= */}

          <section
            className="
              mt-6
              grid
              grid-cols-1
              gap-6
              xl:grid-cols-2
            "
          >
            {/* Payment Status */}

            <div
              className="
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-6
                shadow-sm
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#222831]">
                    Payment Status
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Donation payment activity.
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
                  Stripe
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {paymentStatusSummary.map((item) => (
                  <div
                    key={item.status}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      rounded-xl
                      border
                      border-gray-100
                      p-4
                      transition
                      hover:bg-gray-50
                    "
                  >
                    <div className="min-w-0">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          border
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          ${getStatusStyle(item.status)}
                        `}
                      >
                        {item.status}
                      </span>

                      <p className="mt-2 text-xs text-gray-400">
                        {formatNumber(item.count)} donation
                        {Number(item.count || 0) === 1 ? "" : "s"}
                      </p>
                    </div>

                    <p className="whitespace-nowrap font-bold text-[#222831]">
                      {formatMoney(item.amount)}
                    </p>
                  </div>
                ))}

                {paymentStatusSummary.length === 0 && (
                  <div className="rounded-xl bg-gray-50 p-8 text-center">
                    <p className="text-sm font-medium text-gray-500">
                      No payment status data available.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Donations */}

            <div
              className="
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-6
                shadow-sm
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#222831]">
                    Recent Donations
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Latest completed Stripe payments.
                  </p>
                </div>

                <span
                  className="
                    rounded-full
                    bg-green-50
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-green-700
                  "
                >
                  Paid
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {recentDonations.map((donation) => (
                  <div
                    key={donation._id}
                    className="
                      rounded-xl
                      border
                      border-gray-100
                      p-4
                      transition
                      hover:bg-gray-50
                    "
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#222831]">
                          {donation.campaign?.title || "Campaign unavailable"}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          {donation.donor?.name || "Anonymous donor"}
                        </p>
                      </div>

                      <p className="whitespace-nowrap font-bold text-[#00ADB5]">
                        {formatMoney(donation.amount)}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span>Stripe</span>

                      <span>•</span>

                      <span>{formatDate(donation.createdAt)}</span>

                      <span
                        className="
                          ml-auto
                          rounded-full
                          border
                          border-green-100
                          bg-green-50
                          px-2.5
                          py-1
                          font-semibold
                          text-green-700
                        "
                      >
                        Paid
                      </span>
                    </div>
                  </div>
                ))}

                {recentDonations.length === 0 && (
                  <div className="rounded-xl bg-gray-50 p-8 text-center">
                    <p className="text-sm font-medium text-gray-500">
                      No successful donations yet.
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Completed payments will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              FOOTER INFORMATION
          ================================================= */}

          <section
            className="
              mt-6
              rounded-2xl
              bg-[#30475E]
              p-6
              text-white
              shadow-sm
            "
          >
            <div
              className="
                flex
                flex-col
                gap-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00ADB5]" />

                  <h2 className="text-lg font-bold">Campaign Analytics</h2>
                </div>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
                  Analytics are calculated from recorded donation transactions.
                  Only successful Stripe payments are included in total raised
                  funds.
                </p>
              </div>

              <div
                className="
                  shrink-0
                  rounded-xl
                  bg-white/10
                  px-5
                  py-4
                "
              >
                <p className="text-xs text-gray-300">Campaigns</p>

                <p className="mt-1 text-2xl font-bold">
                  {formatNumber(campaignCount)}
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
