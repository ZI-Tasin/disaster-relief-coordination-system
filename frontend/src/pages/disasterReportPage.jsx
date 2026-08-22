// src/pages/DisasterReportPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { DisasterFormSteps } from "../components/DisasterFormSteps.jsx";
import { fetchCoordinatesOnSubmit } from "../utils/osmgeocode.js";

export default function DisasterReportPage() {
  const [submitting, setSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

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

  // Simple location change handler (No API calls triggered here)
  const handleLocationChange = (loc) => {
    setFormData((prev) => ({
      ...prev,
      division: loc.division,
      district: loc.district,
      subdistrict: loc.upazila || loc.subdistrict,
      // Reset lat/long if user changes dropdown selection after using GPS
      latitude: null,
      longitude: null,
    }));
  };

  // Browser Geolocation for "Use My Location" button
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setDetectingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setDetectingLocation(false);
        alert(
          "Could not retrieve your location. Please select it manually below.",
        );
      },
    );
  };

  // Submit Handler: Triggers OpenStreetMap geocoding ON SUBMIT only
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      let finalLat = formData.latitude;
      let finalLng = formData.longitude;

      // Only perform OpenStreetMap lookup if coordinates aren't already set via GPS button
      if (!finalLat || !finalLng) {
        const coords = await fetchCoordinatesOnSubmit(formData);
        finalLat = coords.latitude;
        finalLng = coords.longitude;
      }

      const payload = {
        ...formData,
        latitude: finalLat,
        longitude: finalLng,
      };

      // Send to your backend endpoint
      await axios.post(
        "https://disaster-relief-coordination-system-0z00.onrender.com/api/reports",
        payload,
      );

      setFeedback({
        type: "success",
        message: "Report submitted successfully!",
      });
    } catch (err) {
      console.error("Error submitting report:", err);
      setFeedback({
        type: "error",
        message: "Failed to submit report. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-2xl my-8">
      {/* Back Button */}
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
      >
        <span>←</span> Back to Home
      </Link>

      <h1 className="text-xl font-bold mb-6 text-gray-800">
        Report a Disaster Incident
      </h1>

      {feedback.message && (
        <div
          className={`p-3 mb-4 rounded-lg text-sm ${
            feedback.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <DisasterFormSteps
          formData={formData}
          setFormData={setFormData}
          detectingLocation={detectingLocation}
          handleUseLocation={handleUseLocation}
          handleLocationChange={handleLocationChange}
          feedback={feedback}
          setFeedback={setFeedback}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#00b4d8] text-white font-bold rounded-xl shadow-md hover:bg-[#0096c7] transition disabled:opacity-50"
        >
          {submitting
            ? "Resolving Coordinates & Submitting..."
            : "Submit Incident Report"}
        </button>
      </form>
    </div>
  );
}
