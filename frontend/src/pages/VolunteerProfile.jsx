import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import SkillChip from "../components/SkillChip";
import api from "../api/axios";
import { bloodTypes, skillOptions } from "../data/mockData";
import useDistricts from "../hooks/useDistricts";

// colors for the mission status pills -- add more here if new statuses show up later
const statusStyles = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-brand-accent-light text-brand-accent",
};

export default function VolunteerProfile() {
  const navigate = useNavigate();

  const [volunteer, setVolunteer] = useState(null); // saved profile from the server
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null); // draft copy while editing
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [missionHistory, setMissionHistory] = useState([]);

  const { districtGroups } = useDistricts();

  // pull "my" profile on mount -- backend figures out who "my" is from the JWT
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/volunteers/profile");
        setVolunteer(data);
        setForm(data);
      } catch (err) {
        // haven't finished the wizard yet -> bounce back there instead of showing a dead page
        if (err.response?.status === 404) {
          navigate("/register");
          return;
        }
        setError(err.response?.data?.error || "Couldn't load your profile.");
      } finally {
        setLoading(false);
      }
    })();

    // Fetch mission history
    (async () => {
      try {
        const { data } = await api.get("/stage-updates/history");
        setMissionHistory(data.data || []);
      } catch (err) {
        console.error("Failed to load mission history:", err);
        // Don't show error – it's okay if history is empty
      }
    })();
  }, [navigate]);

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    const phoneRegex = /^(\+8801|01)[3-9]\d{8}$/;
    const idRegex = /^\d+$/;

    if (!phoneRegex.test(form.phone)) {
      setError("Please enter a valid Bangladeshi phone number.");
      setIsSaving(false);
      return;
    }

    if (!idRegex.test(form.idNumber)) {
      setError("ID number must contain only digits.");
      setIsSaving(false);
      return;
    }
    try {
      // only send editable fields -- status is handled by the toggle button, not this form
      const { data } = await api.put("/volunteers/profile", {
        fullName: form.fullName,
        idNumber: form.idNumber,
        phone: form.phone,
        district: form.district,
        bloodType: form.bloodType,
        skills: form.skills,
      });
      setVolunteer(data);
      setForm(data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || "Save failed, try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailability = async () => {
    setIsToggling(true);
    try {
      const { data } = await api.patch(
        "/volunteers/profile/toggle-availability",
      );
      setVolunteer(data);
      setForm(data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't update availability.");
    } finally {
      setIsToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <Navbar />
        <p className="mt-16 text-center text-sm text-gray-500">
          Loading your profile…
        </p>
      </div>
    );
  }

  if (error && !volunteer) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <Navbar />
        <p className="mt-16 text-center text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />

      {volunteer.assignmentStage === "deployed" && (
        <div className="mx-auto mt-6 max-w-4xl px-4">
          <button
            onClick={() => navigate("/mission-tracker")}
            className="flex w-full items-center justify-between rounded-xl bg-brand-accent px-5 py-3 text-left text-white shadow-sm"
          >
            <span className="text-sm font-semibold">
              You have an active deployed mission -- log your stage progress
            </span>
            <span>→</span>
          </button>
        </div>
      )}

      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 px-4 md:grid-cols-[280px_1fr]">
        {/* LEFT: avatar + quick facts + availability switch, matches the Figma profile card */}
        <div className="h-fit rounded-xl bg-white p-6 text-center shadow-sm">
          <div className="mx-auto h-20 w-20 rounded-full bg-gray-200" />{" "}
          {/* avatar placeholder */}
          {!isEditing ? (
            <>
              <h2 className="mt-3 text-base font-bold text-gray-800">
                {volunteer.fullName}
              </h2>
              <p className="text-xs text-gray-500">
                {volunteer.district} · {volunteer.bloodType}
              </p>
            </>
          ) : (
            <p className="mt-3 text-xs text-gray-400">Editing on the right →</p>
          )}
          {/* availability switch -- green pill when available, matches the toggle in the design */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
            <span className="text-gray-500">Availability</span>
            <button
              type="button"
              onClick={handleToggleAvailability}
              disabled={isToggling}
              aria-pressed={volunteer.status === "available"}
              className={`relative h-5 w-9 rounded-full transition disabled:opacity-50 ${
                volunteer.status === "available"
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 block h-4 w-4 rounded-full bg-white transition-transform ${
                  volunteer.status === "available"
                    ? "translate-x-4"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="mt-4 w-full rounded-md border border-gray-300 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* RIGHT: edit form when editing, otherwise the mission history list */}
        {isEditing ? (
          <form
            onSubmit={handleSave}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <h3 className="text-sm font-bold text-gray-800">Edit Details</h3>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <FormInput
                label="Full Name"
                value={form.fullName}
                onChange={(v) => setForm({ ...form, fullName: v })}
              />
              <FormInput
                label="NID/Student ID"
                value={form.idNumber}
                onChange={(v) => setForm({ ...form, idNumber: v })}
              />
            </div>

            <div className="mt-4">
              <FormInput
                label="Phone Number"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
            </div>

            <div className="mt-4">
              <FormSelect
                label="Operational District"
                value={form.district}
                onChange={(v) => setForm({ ...form, district: v })}
                placeholder="Select a district"
                groups={districtGroups}
              />
            </div>

            <div className="mt-4">
              <FormSelect
                label="Blood Type"
                value={form.bloodType}
                onChange={(v) => setForm({ ...form, bloodType: v })}
                placeholder="Select blood type"
                options={bloodTypes}
              />
            </div>

            <div className="mt-4">
              <span className="mb-2 block text-xs font-medium text-gray-500">
                Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <SkillChip
                    key={skill}
                    label={skill}
                    selected={form.skills.includes(skill)}
                    onToggle={() => toggleSkill(skill)}
                  />
                ))}
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setForm(volunteer);
                  setError("");
                }}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-lg bg-brand-accent py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800">
                Mission History
              </h3>
              {missionHistory.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  No completed missions yet.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-gray-100">
                  {missionHistory.map((mission) => (
                    <li
                      key={mission.id}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <span className="text-gray-700">
                        {mission.incident?.crisisType || "Mission"} ·{" "}
                        {mission.incident?.district || "Unknown"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles["Completed"]}`}
                      >
                        Completed
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(mission.endDate).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
