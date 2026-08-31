import { useState } from "react";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import SkillChip from "./SkillChip";
import { bloodTypes, skillOptions } from "../data/mockData";
import useDistricts from "../hooks/useDistricts";

// Step 2 of the wizard: the OCR-prefilled confirmation form.
// `ocrData` = { fullName, idNumber } handed down from the upload step.
export default function VolunteerDetailsForm({
  ocrData,
  onSubmit,
  isSubmitting = false,
}) {
  // form state, seeded with the OCR result
  const [fullName, setFullName] = useState(ocrData.fullName);
  const [idNumber, setIdNumber] = useState(ocrData.idNumber);
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [skills, setSkills] = useState([]); // array of selected skill labels

  const { districtGroups } = useDistricts();

  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const phoneRegex = /^(\+8801|01)[3-9]\d{8}$/;
  const isValid =
    fullName.trim() &&
    idNumber.trim() &&
    phoneRegex.test(phone) &&
    district &&
    bloodType;

  const handleSubmit = (e) => {
    e.preventDefault();
    // mock submission -- no backend call yet, just pass the payload up
    onSubmit({
      fullName,
      idNumber,
      phone,
      district,
      bloodType,
      skills,
      status: "available",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-16 w-full max-w-md rounded-xl bg-white p-6 shadow-sm"
    >
      <h1 className="text-lg font-bold text-gray-800">Confirm Your Details</h1>

      {/* OCR notice banner */}
      <div className="mt-3 flex items-start gap-2 rounded-md bg-brand-accent-light px-3 py-2 text-xs text-gray-700">
        <span>✨</span>
        <span>
          Auto-filled from your ID via OCR. Please review it before confirming.
        </span>
      </div>

      {/* Full name + ID number, side by side, highlighted since auto-filled */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <FormInput
          label="Full Name"
          value={fullName}
          onChange={setFullName}
          highlighted
        />
        <FormInput
          label="NID/Student ID"
          value={idNumber}
          onChange={setIdNumber}
          highlighted
        />
      </div>

      <div className="mt-4">
        <FormInput
          label="Phone Number"
          value={phone}
          onChange={setPhone}
          placeholder="+880 1XXX-XXXXXX"
        />
      </div>

      <div className="mt-4">
        <FormSelect
          label="Operational District"
          value={district}
          onChange={setDistrict}
          placeholder="Select a district"
          groups={districtGroups}
        />
      </div>

      <div className="mt-4">
        <FormSelect
          label="Blood Type"
          value={bloodType}
          onChange={setBloodType}
          placeholder="Select blood type"
          options={bloodTypes}
        />
      </div>

      {/* Skills -- toggle chips, functions as a multi-select checkbox group */}
      <div className="mt-4">
        <span className="mb-2 block text-xs font-medium text-gray-500">
          Skills
        </span>
        <div className="flex flex-wrap gap-2">
          {skillOptions.map((skill) => (
            <SkillChip
              key={skill}
              label={skill}
              selected={skills.includes(skill)}
              onToggle={() => toggleSkill(skill)}
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="mt-6 w-full rounded-lg bg-brand-accent py-2.5 text-sm font-semibold text-white
          transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-brand-accent/90"
      >
        {isSubmitting ? "Submitting…" : "Complete Registration"}
      </button>
    </form>
  );
}
