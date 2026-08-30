// src/pages/disasterReportPage.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { DisasterFormSteps } from "../components/DisasterFormSteps.jsx";
import { fetchCoordinatesOnSubmit } from "../utils/osmgeocode.js";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://disaster-relief-coordination-system-kmf2.onrender.com/api";

const REPORTS_URL = `${API_URL}/reports`;

export default function DisasterReportPage() {
  const [submitting, setSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    crisisType: "",
    description: "",
    division: "",
    district: "",
    subdistrict: "",
    manualAddress: "",
    latitude: null,
    longitude: null,
  });

  // =========================================================
  // CLEAR FEEDBACK
  // =========================================================

  const clearFeedback = () => {
    if (feedback.message) {
      setFeedback({
        type: "",
        message: "",
      });
    }
  };

  // =========================================================
  // MANUAL LOCATION CHANGE
  // =========================================================

  const handleLocationChange = (loc) => {
    clearFeedback();

    setFormData((prev) => ({
      ...prev,

      division: loc?.division || "",
      district: loc?.district || "",
      subdistrict: loc?.upazila || loc?.subdistrict || "",

      // Manual location selection should replace GPS coordinates.
      latitude: null,
      longitude: null,
    }));
  };

  // =========================================================
  // REVERSE GEOCODE GPS LOCATION
  // =========================================================

  const reverseGeocodeLocation = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            lat: latitude,
            lon: longitude,
            format: "json",
            addressdetails: 1,
            zoom: 18,
          },
          headers: {
            Accept: "application/json",
          },
          timeout: 15000,
        },
      );

      const address = response.data?.address || {};

      /*
       * Nominatim uses slightly different address fields depending
       * on the exact location.
       *
       * Bangladesh examples can contain:
       * - state
       * - state_district
       * - county
       * - city
       * - town
       * - municipality
       * - village
       */

      const division =
        address.state || address.region || address.state_district || "";

      const district =
        address.state_district || address.district || address.county || "";

      const subdistrict =
        address.county ||
        address.municipality ||
        address.city_district ||
        address.upazila ||
        address.city ||
        address.town ||
        address.village ||
        "";

      const detectedAddress =
        response.data?.display_name ||
        [
          address.road,
          address.neighbourhood,
          address.suburb,
          address.village,
          address.town,
          address.city,
          address.county,
          address.state_district,
          address.state,
        ]
          .filter(Boolean)
          .join(", ");

      return {
        division,
        district,
        subdistrict,
        detectedAddress,
      };
    } catch (error) {
      console.error("Reverse geocoding failed:", error);

      return {
        division: "",
        district: "",
        subdistrict: "",
        detectedAddress: "",
      };
    }
  };

  // =========================================================
  // USE MY LOCATION
  // =========================================================

  const handleUseLocation = () => {
    clearFeedback();

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setFeedback({
        type: "error",
        message:
          "Location access requires a secure HTTPS connection. Please open the deployed website using HTTPS.",
      });

      return;
    }

    if (!navigator.geolocation) {
      setFeedback({
        type: "error",
        message:
          "Geolocation is not supported by this browser. Please select your location manually.",
      });

      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = Number(position.coords.latitude);
          const longitude = Number(position.coords.longitude);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw new Error("Invalid GPS coordinates received.");
          }

          console.log("GPS location detected:", {
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
          });

          /*
           * Immediately save coordinates.
           * This means even if reverse geocoding fails, we still
           * have the user's actual GPS position.
           */
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));

          // Try to determine Bangladesh administrative location.
          const location = await reverseGeocodeLocation(latitude, longitude);

          console.log("Reverse geocoded location:", location);

          setFormData((prev) => ({
            ...prev,

            latitude,
            longitude,

            division: location.division || prev.division,
            district: location.district || prev.district,
            subdistrict: location.subdistrict || prev.subdistrict,

            // Only automatically replace address when we have one.
            manualAddress: location.detectedAddress || prev.manualAddress,
          }));

          if (location.district && location.subdistrict) {
            setFeedback({
              type: "success",
              message: `Location detected successfully: ${location.district}, ${location.subdistrict}.`,
            });
          } else if (location.district) {
            setFeedback({
              type: "success",
              message:
                "GPS location detected. Please select the Upazila manually if it was not detected.",
            });
          } else {
            setFeedback({
              type: "success",
              message:
                "GPS coordinates detected. Please verify your district and Upazila below.",
            });
          }
        } catch (error) {
          console.error("Location processing error:", error);

          setFeedback({
            type: "error",
            message:
              "Your GPS location was detected, but the area could not be identified automatically. Please select your district and Upazila manually.",
          });
        } finally {
          setDetectingLocation(false);
        }
      },

      (error) => {
        console.error("Geolocation error:", error);

        let message =
          "Could not retrieve your location. Please select your location manually.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Location permission was denied. Please allow location access in your browser and try again.";
            break;

          case error.POSITION_UNAVAILABLE:
            message =
              "Your location is currently unavailable. Please check your device location settings and try again.";
            break;

          case error.TIMEOUT:
            message =
              "Location detection timed out. Please try again or select your location manually.";
            break;

          default:
            message =
              "Could not retrieve your location. Please select your location manually.";
        }

        setFeedback({
          type: "error",
          message,
        });

        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  };

  // =========================================================
  // SUBMIT REPORT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    clearFeedback();

    // ---------------------------------------------------------
    // Validate crisis type
    // ---------------------------------------------------------

    if (!formData.crisisType) {
      setFeedback({
        type: "error",
        message: "Please select the type of emergency.",
      });

      return;
    }

    // ---------------------------------------------------------
    // Validate description
    // ---------------------------------------------------------

    if (!formData.description?.trim()) {
      setFeedback({
        type: "error",
        message: "Please describe the emergency situation.",
      });

      return;
    }

    // ---------------------------------------------------------
    // Validate district
    // ---------------------------------------------------------

    if (!formData.district?.trim()) {
      setFeedback({
        type: "error",
        message:
          "Please select your district or use My Location to detect it automatically.",
      });

      return;
    }

    // ---------------------------------------------------------
    // Validate subdistrict
    // ---------------------------------------------------------

    if (!formData.subdistrict?.trim()) {
      setFeedback({
        type: "error",
        message: "Please select your Upazila/Sub-district before submitting.",
      });

      return;
    }

    setSubmitting(true);

    try {
      let finalLat = formData.latitude;
      let finalLng = formData.longitude;

      // -------------------------------------------------------
      // If GPS coordinates don't exist, geocode manual location
      // -------------------------------------------------------

      if (
        finalLat === null ||
        finalLat === undefined ||
        finalLng === null ||
        finalLng === undefined ||
        !Number.isFinite(Number(finalLat)) ||
        !Number.isFinite(Number(finalLng))
      ) {
        const coords = await fetchCoordinatesOnSubmit(formData);

        finalLat = coords?.latitude;
        finalLng = coords?.longitude;
      }

      // -------------------------------------------------------
      // Validate final coordinates
      // -------------------------------------------------------

      if (
        finalLat === null ||
        finalLat === undefined ||
        finalLng === null ||
        finalLng === undefined ||
        !Number.isFinite(Number(finalLat)) ||
        !Number.isFinite(Number(finalLng))
      ) {
        throw new Error("Could not determine the incident coordinates.");
      }

      // -------------------------------------------------------
      // Build clean payload
      // -------------------------------------------------------

      const payload = {
        crisisType: formData.crisisType,
        description: formData.description.trim(),

        division: formData.division?.trim() || "",
        district: formData.district.trim(),
        subdistrict: formData.subdistrict.trim(),

        manualAddress: formData.manualAddress?.trim() || "",

        latitude: Number(finalLat),
        longitude: Number(finalLng),
      };

      console.log("Submitting disaster report:", payload);

      // -------------------------------------------------------
      // Submit
      // -------------------------------------------------------

      const response = await axios.post(REPORTS_URL, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      console.log("Report submitted:", response.data);

      setFeedback({
        type: "success",
        message:
          response.data?.message || "Emergency report submitted successfully!",
      });

      // -------------------------------------------------------
      // Reset form
      // -------------------------------------------------------

      setFormData({
        crisisType: "",
        description: "",
        division: "",
        district: "",
        subdistrict: "",
        manualAddress: "",
        latitude: null,
        longitude: null,
      });

      // Scroll to top so user sees success message.
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Error submitting report:", error);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

      setFeedback({
        type: "error",
        message:
          backendMessage ||
          "Failed to submit the emergency report. Please try again.",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#F5F7FA] px-3 py-4 sm:px-5 sm:py-8">
      <div className="mx-auto w-full max-w-3xl">
        {/* =====================================================
            BACK
        ===================================================== */}

        <Link
          to="/"
          className="
            mb-4
            inline-flex
            items-center
            gap-2
            rounded-lg
            px-2
            py-2
            text-sm
            font-semibold
            text-gray-500
            transition
            hover:bg-white
            hover:text-[#222831]
          "
        >
          <span className="text-lg">←</span>
          Back to Home
        </Link>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 rounded-3xl bg-gradient-to-br from-[#222831] to-[#30475E] p-5 text-white shadow-lg sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/20 text-2xl sm:h-14 sm:w-14">
              🚨
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00ADB5]">
                Emergency Response
              </p>

              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                Report an Emergency
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
                Report a disaster incident so emergency coordinators can review
                and respond as quickly as possible.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            FEEDBACK
        ===================================================== */}

        {feedback.message && (
          <div
            className={`
              mb-6
              rounded-2xl
              border
              p-4
              shadow-sm
              ${
                feedback.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">
                {feedback.type === "success" ? "✓" : "⚠️"}
              </span>

              <p className="min-w-0 flex-1 text-sm font-semibold leading-6">
                {feedback.message}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            FORM
        ===================================================== */}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <DisasterFormSteps
            formData={formData}
            setFormData={setFormData}
            detectingLocation={detectingLocation}
            handleUseLocation={handleUseLocation}
            handleLocationChange={handleLocationChange}
            feedback={feedback}
            setFeedback={setFeedback}
          />

          {/* ===================================================
              SUBMIT
          =================================================== */}

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <button
              type="submit"
              disabled={submitting || detectingLocation}
              className="
                flex
                min-h-[56px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#00ADB5]
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-md
                transition
                hover:bg-[#0097A0]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {submitting ? (
                <>
                  <span
                    className="
                      h-5
                      w-5
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                  Submitting Emergency Report...
                </>
              ) : (
                <>🚨 Submit Emergency Report</>
              )}
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-gray-400">
              Please verify the emergency type and location before submitting.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
