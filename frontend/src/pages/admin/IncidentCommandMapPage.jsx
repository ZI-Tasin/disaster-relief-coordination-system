import React, { useState } from "react";

import Navbar from "../../components/Navbar.jsx";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import LiveIncidentMap from "../../components/map/LiveIncidentMap.jsx";

export default function IncidentCommandMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen min-w-0 bg-gray-100">
      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <div className="relative z-1000">
        <Navbar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* =====================================================
          ADMIN SIDEBAR
          
          Sidebar is fixed by AdminSidebar.
          Main content therefore gets md:ml-64.
          ===================================================== */}

      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main
        className="
          min-h-[calc(100vh-60px)]
          min-w-0
          w-full
          transition-[margin]
          duration-300
          ease-in-out

          md:ml-64
          md:w-[calc(100%-16rem)]
        "
      >
        <div
          className="
            flex
            min-h-[calc(100vh-60px)]
            min-w-0
            flex-col
            px-3
            py-4

            sm:px-5
            sm:py-6

            md:px-6
            md:py-7

            lg:px-8
            lg:py-8
          "
        >
          {/* =================================================
              PAGE HEADER
              ================================================= */}

          <div className="mb-4 shrink-0 sm:mb-5 md:mb-6">
            <h1
              className="
                break-words
                text-xl
                font-bold
                leading-tight
                text-gray-900

                sm:text-2xl
                md:text-3xl
              "
            >
              Incident Map
            </h1>

            <p
              className="
                mt-1
                max-w-3xl
                text-xs
                leading-relaxed
                text-gray-500

                sm:text-sm
              "
            >
              Monitor active disasters and resolve verified incidents in
              real-time.
            </p>
          </div>

          {/* =================================================
              MAP
              ================================================= */}

          <div
            className="
              relative
              z-0
              min-h-100
              w-full
              flex-1
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-white
              shadow-sm

              sm:min-h-125
              md:min-h-150
              lg:min-h-160
            "
          >
            <LiveIncidentMap isCoordinator={true} />
          </div>

          {/* Bottom spacing */}

          <div className="h-4 shrink-0 sm:h-6" />
        </div>
      </main>
    </div>
  );
}
