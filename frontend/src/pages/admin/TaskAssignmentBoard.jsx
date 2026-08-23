import { useState } from "react";

import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";
import VolunteerBoardCard from "../../components/VolunteerBoardCard";

import useVolunteerBoard from "../../hooks/useVolunteerBoard";

// =====================================================
// SEVERITY STYLES
// =====================================================

const severityStyles = {
  Critical: "bg-red-50 text-red-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-green-50 text-green-600",
};

// =====================================================
// INCIDENT LABEL
// =====================================================

const incidentLabel = (incident) =>
  incident
    ? `${incident.crisisType} — ${incident.subdistrict}, ${incident.district}`
    : "";

// =====================================================
// PAGE
// =====================================================

export default function TaskAssignmentBoard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState("");
  const [actionError, setActionError] = useState("");

  const { board, incidents, loading, error, assign, deploy, release } =
    useVolunteerBoard();

  const selectedIncident = incidents.find(
    (incident) => incident._id === selectedIncidentId,
  );

  // =====================================================
  // ASSIGN
  // =====================================================

  const handleAssign = async (volunteerId) => {
    setActionError("");

    if (!selectedIncidentId) {
      setActionError("Select an active disaster above before assigning.");
      return;
    }

    try {
      await assign(volunteerId, selectedIncidentId);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to assign volunteer.",
      );
    }
  };

  // =====================================================
  // DEPLOY
  // =====================================================

  const handleDeploy = async (volunteerId) => {
    setActionError("");

    try {
      await deploy(volunteerId);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to mark as deployed.",
      );
    }
  };

  // =====================================================
  // RELEASE
  // =====================================================

  const handleRelease = async (volunteerId) => {
    setActionError("");

    try {
      await release(volunteerId);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to release volunteer.",
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FA]">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <main
          className="
            min-h-[calc(100vh-60px)]
            min-w-0
            p-4
            transition-all
            duration-300
            sm:p-6
            lg:ml-64
            lg:p-8
          "
        >
          <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">
            <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#00ADB5]/20 border-t-[#00ADB5]" />
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar setSidebarOpen={setSidebarOpen} />

      {/* =================================================
          FIXED SIDEBAR
      ================================================= */}

      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* =================================================
          MAIN CONTENT

          IMPORTANT:
          Sidebar is fixed on desktop.
          Therefore the content gets lg:ml-64.
      ================================================= */}

      <main
        className="
          min-h-[calc(100vh-60px)]
          min-w-0
          overflow-x-hidden
          p-4
          transition-all
          duration-300
          sm:p-6
          md:p-7
          lg:ml-64
          lg:p-8
          xl:p-10
        "
      >
        <div className="mx-auto w-full max-w-[1600px]">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#00ADB5]">
              Dispatch
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#222831] sm:text-3xl">
              Volunteer Task Assignment Board
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
              Pick an active disaster below, then assign volunteers from the
              Available column.
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {(error || actionError) && (
            <div
              className="
                mt-5
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                font-medium
                text-red-600
              "
            >
              {error || actionError}
            </div>
          )}

          {/* =================================================
              ACTIVE DISASTERS
          ================================================= */}

          <section
            className="
              mt-6
              overflow-hidden
              rounded-3xl
              border
              border-gray-100
              bg-white
              p-4
              shadow-sm
              sm:p-6
            "
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#30475E]">
                  Active Disasters
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {incidents.length} active disaster
                  {incidents.length === 1 ? "" : "s"} available for volunteer
                  assignment.
                </p>
              </div>

              {selectedIncident && (
                <div
                  className="
                    rounded-xl
                    bg-[#00ADB5]/5
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-[#00ADB5]
                  "
                >
                  Selected: {incidentLabel(selectedIncident)}
                </div>
              )}
            </div>

            {/* Incident selector */}

            <div
              className="
                mt-4
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                2xl:grid-cols-5
              "
            >
              {incidents.map((incident) => (
                <button
                  key={incident._id}
                  type="button"
                  onClick={() => setSelectedIncidentId(incident._id)}
                  className={`
                    min-w-0
                    rounded-2xl
                    border
                    p-4
                    text-left
                    transition
                    ${
                      selectedIncidentId === incident._id
                        ? "border-[#00ADB5] bg-[#00ADB5]/5 shadow-sm"
                        : "border-gray-100 bg-white hover:border-[#00ADB5]/30 hover:bg-gray-50"
                    }
                  `}
                >
                  <span
                    className={`
                      inline-flex
                      rounded-full
                      px-2
                      py-0.5
                      text-[10px]
                      font-bold
                      ${severityStyles[incident.severity] || severityStyles.Low}
                    `}
                  >
                    {incident.severity}
                  </span>

                  <p className="mt-2 truncate font-semibold text-[#222831]">
                    {incident.crisisType}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-400">
                    {incident.subdistrict}, {incident.district}
                  </p>
                </button>
              ))}

              {incidents.length === 0 && (
                <div className="col-span-full py-8 text-center">
                  <p className="text-sm text-gray-400">
                    No verified disasters yet.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              BOARD
          ================================================= */}

          <div
            className="
              mt-6
              grid
              min-w-0
              grid-cols-1
              gap-5
              lg:grid-cols-2
              xl:grid-cols-3
              xl:gap-6
            "
          >
            {/* =================================================
                AVAILABLE
            ================================================= */}

            <section
              className="
                min-w-0
                overflow-hidden
                rounded-3xl
                border
                border-gray-100
                bg-white
                p-4
                shadow-sm
                sm:p-5
              "
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#30475E]">
                  Available
                </h2>

                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                  {board.available.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {board.available.map((volunteer) => (
                  <VolunteerBoardCard
                    key={volunteer._id}
                    volunteer={volunteer}
                    actions={[
                      {
                        label: "Assign",
                        onClick: () => handleAssign(volunteer._id),
                        disabled: !selectedIncidentId,
                      },
                    ]}
                  />
                ))}

                {board.available.length === 0 && (
                  <div className="rounded-2xl bg-gray-50 py-8 text-center">
                    <p className="text-sm text-gray-400">
                      No volunteers available.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                ASSIGNED
            ================================================= */}

            <section
              className="
                min-w-0
                overflow-hidden
                rounded-3xl
                border
                border-gray-100
                bg-white
                p-4
                shadow-sm
                sm:p-5
              "
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#30475E]">
                  Assigned
                </h2>

                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                  {board.assigned.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {board.assigned.map((volunteer) => (
                  <VolunteerBoardCard
                    key={volunteer._id}
                    volunteer={volunteer}
                    incidentLabel={incidentLabel(volunteer.assignedIncident)}
                    actions={[
                      {
                        label: "Mark Deployed",
                        onClick: () => handleDeploy(volunteer._id),
                      },
                      {
                        label: "Release",
                        onClick: () => handleRelease(volunteer._id),
                        variant: "secondary",
                      },
                    ]}
                  />
                ))}

                {board.assigned.length === 0 && (
                  <div className="rounded-2xl bg-gray-50 py-8 text-center">
                    <p className="text-sm text-gray-400">
                      No volunteers assigned yet.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                DEPLOYED
            ================================================= */}

            <section
              className="
                min-w-0
                overflow-hidden
                rounded-3xl
                border
                border-gray-100
                bg-white
                p-4
                shadow-sm
                sm:p-5
              "
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#30475E]">
                  Deployed
                </h2>

                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                  {board.deployed.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {board.deployed.map((volunteer) => (
                  <VolunteerBoardCard
                    key={volunteer._id}
                    volunteer={volunteer}
                    incidentLabel={incidentLabel(volunteer.assignedIncident)}
                    actions={[
                      {
                        label: "Release",
                        onClick: () => handleRelease(volunteer._id),
                        variant: "secondary",
                      },
                    ]}
                  />
                ))}

                {board.deployed.length === 0 && (
                  <div className="rounded-2xl bg-gray-50 py-8 text-center">
                    <p className="text-sm text-gray-400">
                      No volunteers deployed yet.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* =================================================
              BOTTOM SPACE
          ================================================= */}

          <div className="h-6 sm:h-10" />
        </div>
      </main>
    </div>
  );
}
