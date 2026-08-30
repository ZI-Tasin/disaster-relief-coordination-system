import React from "react";
import LocationSelector from "./LocationSelector.jsx";

const CRISIS_TYPES = [
  {
    id: "Flood",
    label: "Flood",
    description: "Flooding or water damage",
    icon: "🌊",
  },
  {
    id: "Cyclone",
    label: "Cyclone",
    description: "Cyclone or severe storm",
    icon: "🌀",
  },
  {
    id: "Earthquake",
    label: "Earthquake",
    description: "Earthquake or structural damage",
    icon: "🏚️",
  },
  {
    id: "Other",
    label: "Other",
    description: "Other emergency situation",
    icon: "🚨",
  },
];

export const DisasterFormSteps = ({
  formData,
  setFormData,
  detectingLocation,
  handleUseLocation,
  handleLocationChange,
  feedback,
  setFeedback,
}) => {
  const clearError = () => {
    if (feedback?.type === "error") {
      setFeedback({
        type: "",
        message: "",
      });
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    clearError();
  };

  return (
    <div className="space-y-7">
      {/* =========================================================
          STEP 1 — CRISIS TYPE
      ========================================================= */}

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg">
            🚨
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#00ADB5]">
              Step 1
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#222831]">
              What type of emergency?
            </h2>

            <p className="mt-1 text-sm leading-5 text-gray-500">
              Select the type that best describes the situation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CRISIS_TYPES.map((type) => {
            const selected = formData?.crisisType === type.id;

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  updateField("crisisType", type.id);
                }}
                className={`
                  group
                  relative
                  flex
                  min-h-[90px]
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  p-4
                  text-left
                  transition-all
                  duration-200
                  active:scale-[0.99]
                  ${
                    selected
                      ? "border-[#00ADB5] bg-[#00ADB5]/5 shadow-md ring-2 ring-[#00ADB5]/10"
                      : "border-gray-200 bg-white hover:border-[#00ADB5]/40 hover:bg-gray-50"
                  }
                `}
              >
                <div
                  className={`
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    text-2xl
                    transition
                    ${
                      selected
                        ? "bg-[#00ADB5]/10"
                        : "bg-gray-50 group-hover:bg-[#00ADB5]/5"
                    }
                  `}
                >
                  {type.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`
                        text-sm
                        font-bold
                        ${selected ? "text-[#008C93]" : "text-[#222831]"}
                      `}
                    >
                      {type.label}
                    </span>

                    {selected && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00ADB5] text-xs font-bold text-white">
                        ✓
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {type.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          STEP 2 — DESCRIPTION
      ========================================================= */}

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
            📝
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#00ADB5]">
              Step 2
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#222831]">
              Describe the situation
            </h2>

            <p className="mt-1 text-sm leading-5 text-gray-500">
              Give responders enough information to understand the emergency.
            </p>
          </div>
        </div>

        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Emergency Description <span className="text-red-500">*</span>
        </label>

        <textarea
          rows={6}
          required
          value={formData?.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe what happened, the current conditions, affected people, damage, and any urgent assistance needed..."
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            px-4
            py-3.5
            text-sm
            leading-6
            text-gray-800
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-[#00ADB5]
            focus:bg-white
            focus:ring-4
            focus:ring-[#00ADB5]/10
          "
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">Be as specific as possible.</p>

          <p className="text-xs font-medium text-gray-400">
            {(formData?.description || "").length} characters
          </p>
        </div>
      </section>

      {/* =========================================================
          STEP 3 — LOCATION
      ========================================================= */}

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-lg">
            📍
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#00ADB5]">
              Step 3
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#222831]">
              Where is the emergency?
            </h2>

            <p className="mt-1 text-sm leading-5 text-gray-500">
              Provide the location so responders can reach the affected area.
            </p>
          </div>
        </div>

        {/* Current location button */}

        <button
          type="button"
          onClick={handleUseLocation}
          disabled={detectingLocation}
          className="
            flex
            min-h-[52px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-[#00ADB5]/20
            bg-[#00ADB5]/5
            px-4
            py-3
            text-sm
            font-bold
            text-[#008C93]
            transition
            hover:border-[#00ADB5]/40
            hover:bg-[#00ADB5]/10
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {detectingLocation ? (
            <>
              <span
                className="
                  h-4
                  w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-[#00ADB5]/30
                  border-t-[#00ADB5]
                "
              />
              Detecting your location...
            </>
          ) : (
            <>
              <span className="text-lg">📍</span>
              Use My Current Location
            </>
          )}
        </button>

        {/* Divider */}

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-100" />

          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            or select manually
          </span>

          <div className="h-px flex-1 bg-gray-100" />
        </div>

        {/* Bangladesh location selector */}

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4">
          <LocationSelector
            division={formData?.division || ""}
            district={formData?.district || ""}
            upazila={formData?.subdistrict || ""}
            onLocationChange={handleLocationChange}
          />
        </div>

        {/* Manual address */}

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Address or Landmark
          </label>

          <input
            type="text"
            value={formData?.manualAddress || ""}
            onChange={(e) => updateField("manualAddress", e.target.value)}
            placeholder="Example: Near Kaliganj Bazar, beside the main road"
            className="
              w-full
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-4
              py-3.5
              text-sm
              text-gray-800
              outline-none
              transition
              placeholder:text-gray-400
              focus:border-[#00ADB5]
              focus:bg-white
              focus:ring-4
              focus:ring-[#00ADB5]/10
            "
          />

          <p className="mt-2 text-xs leading-5 text-gray-400">
            Adding a nearby landmark can help emergency teams locate the
            incident faster.
          </p>
        </div>

        {/* Location information */}

        {(formData?.division ||
          formData?.district ||
          formData?.subdistrict ||
          formData?.manualAddress) && (
          <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm">
                ✓
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-green-800">
                  Location information added
                </p>

                <div className="mt-1 space-y-0.5 text-xs leading-5 text-green-700">
                  {formData?.division && <p>Division: {formData.division}</p>}

                  {formData?.district && <p>District: {formData.district}</p>}

                  {formData?.subdistrict && (
                    <p>Upazila: {formData.subdistrict}</p>
                  )}

                  {formData?.manualAddress && (
                    <p className="break-words">
                      Address: {formData.manualAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================
          EMERGENCY NOTICE
      ========================================================= */}

      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-base">
            ⚠️
          </div>

          <div>
            <h3 className="text-sm font-bold text-orange-800">
              Please provide accurate information
            </h3>

            <p className="mt-1 text-xs leading-5 text-orange-700">
              Your report may be reviewed by emergency coordinators before
              appearing on the live incident map. False or misleading reports
              can delay assistance to people who need it.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          FEEDBACK
      ========================================================= */}

      {feedback?.message && (
        <div
          className={`
            rounded-2xl
            border
            p-4
            ${
              feedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : feedback.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
            }
          `}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">
              {feedback.type === "error"
                ? "❌"
                : feedback.type === "success"
                  ? "✓"
                  : "ℹ️"}
            </span>

            <p className="text-sm font-medium leading-6">{feedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterFormSteps;
