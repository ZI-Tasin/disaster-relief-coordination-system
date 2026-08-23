import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";

import { getCampaigns, deleteCampaign } from "../../api/campaignApi";

export default function AdminCampaigns() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const response = await getCampaigns();
      setCampaigns(response.data);
    } catch (error) {
      console.error("Failed to load campaigns", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this campaign?",
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await deleteCampaign(id, token);

      setCampaigns((prev) => prev.filter((campaign) => campaign._id !== id));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* =====================================================
          FIXED NAVBAR
      ===================================================== */}

      <div className="fixed left-0 right-0 top-0 z-[60]">
        <Navbar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* =====================================================
          FIXED SIDEBAR
      ===================================================== */}

      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* =====================================================
          MAIN DASHBOARD
          - below navbar
          - beside sidebar on desktop
      ===================================================== */}

      <main
        className="
          min-h-screen
          pt-[64px]
          md:ml-64
        "
      >
        <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            {/* =================================================
                MOBILE MENU
            ================================================= */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="
                mb-5
                inline-flex
                items-center
                justify-center
                rounded-xl
                bg-[#30475E]
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-[#25384A]
                active:scale-[0.98]
                md:hidden
              "
            >
              ☰ Menu
            </button>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="min-w-0">
                <h1
                  className="
                    text-2xl
                    font-bold
                    leading-tight
                    text-[#222831]
                    sm:text-3xl
                  "
                >
                  Manage Campaigns
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Create and manage relief campaigns
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/campaigns/create")}
                className="
                  inline-flex
                  min-h-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#00ADB5]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#0097A0]
                  active:scale-[0.98]
                "
              >
                + Create Campaign
              </button>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div
                className="
                  mt-8
                  flex
                  min-h-[250px]
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  shadow-sm
                "
              >
                <div className="text-center">
                  <div
                    className="
                      mx-auto
                      h-9
                      w-9
                      animate-spin
                      rounded-full
                      border-4
                      border-[#00ADB5]/20
                      border-t-[#00ADB5]
                    "
                  />

                  <p className="mt-4 text-sm font-medium text-gray-500">
                    Loading campaigns...
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {!loading && campaigns.length === 0 && (
              <div
                className="
                  mt-8
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-8
                  text-center
                  shadow-sm
                "
              >
                <div className="mx-auto max-w-md">
                  <div
                    className="
                      mx-auto
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-[#00ADB5]/10
                      text-2xl
                    "
                  >
                    📋
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-[#222831]">
                    No campaigns found
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Create your first relief campaign to get started.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/campaigns/create")}
                    className="
                      mt-5
                      rounded-xl
                      bg-[#00ADB5]
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-[#0097A0]
                    "
                  >
                    + Create Campaign
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                CAMPAIGN GRID
            ================================================= */}

            {!loading && campaigns.length > 0 && (
              <div
                className="
                  mt-8
                  grid
                  grid-cols-1
                  gap-5
                  sm:gap-6
                  lg:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {campaigns.map((campaign) => (
                  <div
                    key={campaign._id}
                    className="
                      flex
                      min-w-0
                      flex-col
                      rounded-2xl
                      border
                      border-gray-100
                      bg-white
                      p-5
                      shadow-sm
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-md
                      sm:p-6
                    "
                  >
                    {/* Campaign title */}

                    <h2
                      className="
                        break-words
                        text-lg
                        font-bold
                        leading-snug
                        text-[#222831]
                        sm:text-xl
                      "
                    >
                      {campaign.title}
                    </h2>

                    {/* Description */}

                    <p
                      className="
                        mt-3
                        line-clamp-3
                        min-h-[60px]
                        text-sm
                        leading-relaxed
                        text-gray-600
                      "
                    >
                      {campaign.description}
                    </p>

                    {/* Campaign information */}

                    <div
                      className="
                        mt-5
                        space-y-3
                        rounded-xl
                        bg-gray-50
                        p-4
                        text-sm
                      "
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="shrink-0 text-gray-500">Location</span>

                        <span className="break-words text-right font-semibold text-[#222831]">
                          {campaign.location}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <span className="shrink-0 text-gray-500">Goal</span>

                        <span className="font-semibold text-[#222831]">
                          ৳ {campaign.targetAmount}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <span className="shrink-0 text-gray-500">Status</span>

                        <span
                          className={`
                            rounded-full
                            px-2.5
                            py-1
                            text-xs
                            font-bold
                            ${
                              campaign.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : campaign.status === "COMPLETED"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                            }
                          `}
                        >
                          {campaign.status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}

                    <div
                      className="
                        mt-6
                        grid
                        grid-cols-2
                        gap-3
                        pt-1
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/campaigns/edit/${campaign._id}`)
                        }
                        className="
                          rounded-xl
                          border
                          border-[#00ADB5]
                          px-3
                          py-2.5
                          text-sm
                          font-semibold
                          text-[#00ADB5]
                          transition
                          hover:bg-[#00ADB5]/5
                          active:scale-[0.98]
                        "
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(campaign._id)}
                        className="
                          rounded-xl
                          bg-red-500
                          px-3
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-red-600
                          active:scale-[0.98]
                        "
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom spacing */}

            <div className="h-8" />
          </div>
        </div>
      </main>
    </div>
  );
}
