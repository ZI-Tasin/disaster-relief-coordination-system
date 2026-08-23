// src/pages/admin/AdminVerificationPage.jsx

import React, { useState } from "react";

import Navbar from "../../components/Navbar.jsx";
import AdminSidebar from "../../components/AdminSidebar.jsx";

import { useReports } from "../../hooks/useReports.js";

import { DetailedReportView } from "../../components/DetailedReportView.jsx";
import { VerificationTable } from "../../components/VerificationTable.jsx";

const AdminVerificationPage = () => {
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    reports,
    loading,
    actionLoading,
    feedback,
    setFeedback,
    searchQuery,
    setSearchQuery,
    sortField,
    sortOrder,
    handleSort,
    verifyReport,
    rejectReport,
    setSeverity,
  } = useReports();

  const selectedReport = reports.find(
    (report) => report._id === selectedReportId,
  );

  // =====================================================
  // VERIFY REPORT
  // =====================================================

  const handleVerify = async (id) => {
    await verifyReport(id);
    setSelectedReportId(null);
  };

  // =====================================================
  // REJECT REPORT
  // =====================================================

  const handleReject = async (id) => {
    await rejectReport(id);
    setSelectedReportId(null);
  };

  // =====================================================
  // CLOSE MOBILE SIDEBAR
  // =====================================================

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100 text-gray-800">
      {/* =====================================================
          NAVBAR
          IMPORTANT:
          Navbar stays at the very top.
      ===================================================== */}

      <div className="relative z-50">
        <Navbar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* =====================================================
          PAGE BODY
      ===================================================== */}

      <div className="relative min-h-[calc(100vh-60px)] w-full">
        {/* ===================================================
            ADMIN SIDEBAR

            Desktop:
            Fixed directly below navbar.

            Mobile:
            Opens from the left.
        =================================================== */}

        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* ===================================================
            MAIN CONTENT

            IMPORTANT:
            md:ml-64 reserves space for the fixed sidebar.

            Therefore the dashboard/report page can NEVER
            go underneath the sidebar on desktop.
        =================================================== */}

        <main
          className="
            relative
            z-0
            min-h-[calc(100vh-60px)]
            min-w-0
            w-full
            overflow-x-hidden
            px-3
            py-4

            sm:px-5
            sm:py-6

            md:ml-64
            md:w-[calc(100%-16rem)]
            md:px-6
            md:py-7

            lg:px-8
            lg:py-8

            xl:px-10
          "
        >
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-5 flex min-w-0 items-center justify-between gap-4 sm:mb-6">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00ADB5] sm:text-xs">
                Administration
              </p>

              <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
                Report Verification
              </h1>

              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                Review, verify, reject, and manage submitted disaster reports.
              </p>
            </div>

            {/* Desktop sidebar is already visible.
                Mobile sidebar is controlled from Navbar. */}
            <div className="hidden shrink-0 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Reports
              </p>

              <p className="mt-1 text-lg font-bold text-[#30475E]">
                {reports?.length || 0}
              </p>
            </div>
          </div>

          {/* =================================================
              MOBILE SIDEBAR CLOSE SUPPORT

              Navbar controls the sidebar, but this page does
              not create another competing mobile menu.
          ================================================= */}

          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={handleCloseSidebar}
              className="
                fixed
                inset-0
                z-30
                bg-black/30
                md:hidden
              "
            />
          )}

          {/* =================================================
              FEEDBACK ALERT
          ================================================= */}

          {feedback.message && (
            <div
              className={`
                mb-5
                flex
                items-start
                justify-between
                gap-3
                rounded-xl
                border
                p-3.5
                text-sm
                font-medium
                shadow-sm
                sm:mb-6
                sm:p-4
                ${
                  feedback.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }
              `}
            >
              <span className="min-w-0 break-words">{feedback.message}</span>

              <button
                type="button"
                onClick={() =>
                  setFeedback({
                    type: "",
                    message: "",
                  })
                }
                className="
                  shrink-0
                  rounded-md
                  px-1.5
                  py-1
                  font-bold
                  transition
                  hover:bg-black/5
                "
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          )}

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="min-w-0 w-full">
            {selectedReport ? (
              <DetailedReportView
                report={selectedReport}
                actionLoading={actionLoading}
                onBack={() => setSelectedReportId(null)}
                onVerify={handleVerify}
                onReject={handleReject}
                onSetSeverity={setSeverity}
              />
            ) : (
              <VerificationTable
                reports={reports}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                onSelectReport={(report) => setSelectedReportId(report._id)}
                onVerify={handleVerify}
                onReject={handleReject}
                onSetSeverity={setSeverity}
              />
            )}
          </div>

          {/* =================================================
              BOTTOM SPACE
          ================================================= */}

          <div className="h-6 sm:h-8" />
        </main>
      </div>
    </div>
  );
};

export default AdminVerificationPage;
