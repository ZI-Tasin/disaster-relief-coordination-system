import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

// Wizard steps: 'upload' -> 'confirm'. Redirects straight to /profile once
// the backend confirms the save (no more 'done' screen).
export default function moviePage() {
    const handleChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    const [form, setForm] = useState({
    title: "",
    genre: "",
    ReleaseYear: "",
    Status: "",
  });


  const [step, setStep] = useState("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrError, setOcrError] = useState("");
  const [ocrData, setOcrData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Step 1 -> runs real OCR now. If the card can't be read we stay on the
  // upload step and show why, instead of blowing up or silently advancing.
    

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />

      {step === "upload" && (
        <IdUploadStep
          onContinue={handleUploadContinue}
          isProcessing={isProcessing}
          ocrError={ocrError}
        />
      )}

      {step === "confirm" && ocrData && (
        <>
          <VolunteerDetailsForm
            ocrData={ocrData}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
          {submitError && (
            <p className="mx-auto mt-3 max-w-md text-center text-xs text-red-500">
              {submitError}
            </p>
          )}
        </>
      )}
    </div>
  );
}
