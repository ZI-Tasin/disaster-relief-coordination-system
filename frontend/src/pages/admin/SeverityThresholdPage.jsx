// src/pages/admin/SeverityThresholdPage.jsx

import React, { useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import { ThresholdsForm } from "../../components/ThresholdsForm.jsx";
import { useSeverityThresholds } from "../../hooks/useSeverityThresholds.js";

const SeverityThresholdPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    thresholds,
    loading,
    saving,
    feedback,
    setFeedback,
    handleInputChange,
    handleReset,
    handleSubmit,
  } = useSeverityThresholds();

  return (
    <div className="min-h-screen bg-slate-100 text-gray-800 font-sans">
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <div className="relative z-50">
        <Navbar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* =====================================================
          FIXED SIDEBAR
      ===================================================== */}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* =====================================================
          MAIN CONTENT
          IMPORTANT:
          md:ml-64 keeps the dashboard beside the fixed sidebar.
      ===================================================== */}
      <main
        className="
          min-h-[calc(100vh-64px)]
          w-full
          px-4
          py-6
          sm:px-6
          sm:py-8
          md:ml-64
          md:w-[calc(100%-16rem)]
          md:px-8
          md:py-10
          lg:px-10
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-5xl
          "
        >
          {/* =================================================
              PAGE HEADER / CARD
          ================================================= */}
          <div
            className="
              min-h-[500px]
              rounded-xl
              border
              border-gray-200
              bg-white
              p-5
              shadow-sm
              sm:p-8
              md:p-10
              lg:p-12
            "
          >
            <h1
              className="
                mb-6
                text-xl
                font-bold
                text-gray-900
                sm:mb-8
                sm:text-2xl
              "
            >
              Global Severity Thresholds
            </h1>

            {/* =================================================
                FEEDBACK
            ================================================= */}
            {feedback.message && (
              <div
                className={`
                  mb-6
                  flex
                  w-full
                  max-w-lg
                  items-center
                  justify-between
                  gap-4
                  rounded-lg
                  border
                  p-3.5
                  text-xs
                  font-medium
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
                    rounded
                    px-2
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
                THRESHOLDS FORM
            ================================================= */}
            <div className="w-full min-w-0">
              <ThresholdsForm
                thresholds={thresholds}
                loading={loading}
                saving={saving}
                onInputChange={handleInputChange}
                onReset={handleReset}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SeverityThresholdPage;
