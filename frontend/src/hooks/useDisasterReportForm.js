import { useState } from "react";
import axios from "axios";
import { useGeolocation } from "./useGeolocation";

const INITIAL_FORM_STATE = {
  crisisType: "",
  description: "",
  division: "",
  district: "",
  subdistrict: "",
  manualAddress: "",
  latitude: null,
  longitude: null,
};

export const useDisasterReportForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const { getCurrentLocation, detectingLocation } = useGeolocation();

  const handleLocationChange = ({ division, district, upazila }) => {
    setFormData((prev) => ({
      ...prev,
      division,
      district,
      subdistrict: upazila,
    }));
  };

  const handleUseLocation = () => {
    setFeedback({ type: "", message: "" });
    getCurrentLocation(
      (data) => {
        setFormData((prev) => ({
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude,
          manualAddress: data.manualAddress,
          district: prev.district || data.detectedDistrict,
          subdistrict: prev.subdistrict || data.detectedSubdistrict,
        }));
        setFeedback({
          type: "success",
          message: `Location detected: ${
            data.detectedSubdistrict ? data.detectedSubdistrict + ", " : ""
          }${data.detectedDistrict}`,
        });
      },
      (errorMessage) => {
        setFeedback({ type: "error", message: errorMessage });
      },
    );
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setFeedback({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.crisisType) {
      setFeedback({
        type: "error",
        message:
          "Please explicitly click to select a Crisis Type before submitting.",
      });
      return;
    }

    if (!formData.district || !formData.subdistrict) {
      setFeedback({
        type: "error",
        message: "Please select both District and Sub-district.",
      });
      return;
    }

    setSubmitting(true);
    try {
      try {
        await axios.post(
          "https://disaster-relief-coordination-system-kmf2.onrender.com/api/reports",
          formData,
        );
      } catch (e) {
        await axios.post("/api/reports", formData);
      }

      setFeedback({
        type: "success",
        message: "Report submitted successfully! Pending verification.",
      });
      resetForm();
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message || "Submission failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    submitting,
    detectingLocation,
    feedback,
    setFeedback,
    handleLocationChange,
    handleUseLocation,
    handleSubmit,
    resetForm,
  };
};
