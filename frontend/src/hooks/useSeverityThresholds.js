import { useState, useEffect } from "react";
import axios from "axios";

const API_URL =
  "https://disaster-relief-coordination-system-kmf2.onrender.com/api/thresholds";

const DEFAULT_THRESHOLDS = {
  windowHours: 1,
  mediumThreshold: 5,
  criticalThreshold: 10,
};

export const useSeverityThresholds = () => {
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [initialData, setInitialData] = useState(DEFAULT_THRESHOLDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchThresholds();
  }, []);

  const fetchThresholds = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      const data = res.data?.data || res.data || DEFAULT_THRESHOLDS;
      setThresholds(data);
      setInitialData(data);
    } catch (err) {
      // Fallback to defaults if backend endpoint is not yet seeded
      setThresholds(DEFAULT_THRESHOLDS);
      setInitialData(DEFAULT_THRESHOLDS);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setThresholds((prev) => ({
      ...prev,
      [field]: value === "" ? "" : Number(value),
    }));
    if (feedback.type === "error") setFeedback({ type: "", message: "" });
  };

  const handleReset = () => {
    setThresholds(initialData);
    setFeedback({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const time = Number(thresholds.windowHours);
    const med = Number(thresholds.mediumThreshold);
    const crit = Number(thresholds.criticalThreshold);

    // Validation Guards
    if (!time || time < 1 || time > 72) {
      setFeedback({
        type: "error",
        message: "Rolling Time Window must be between 1 and 72 hours.",
      });
      return;
    }

    if (med >= crit) {
      setFeedback({
        type: "error",
        message:
          "Medium Severity Threshold must be strictly less than Critical Severity Threshold.",
      });
      return;
    }

    setSaving(true);
    try {
      await axios.put(API_URL, thresholds);
      setInitialData(thresholds);
      setFeedback({
        type: "success",
        message: "Severity thresholds updated successfully!",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message || "Failed to save threshold settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    thresholds,
    loading,
    saving,
    feedback,
    setFeedback,
    handleInputChange,
    handleReset,
    handleSubmit,
  };
};
