import React, { useState } from "react";
import axios from "axios";

import AdminSidebar from "../../components/AdminSidebar";
import ShelterKpiCards from "../../components/shelter/ShelterKpiCards";
import ShelterFilterBar from "../../components/shelter/ShelterFilterBar";
import ShelterCard from "../../components/shelter/ShelterCard";
import CreateShelterModal from "../../components/shelter/CreateShelterModal";
import UpdateShelterModal from "../../components/shelter/UpdateShelterModal";

import { useToast } from "../../hooks/useToast";
import { useShelterOperations } from "../../hooks/useShelterOperations";
import { fetchCoordinatesOnSubmit } from "../../utils/osmgeocode";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://disaster-relief-coordination-system-0z00.onrender.com";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const SUPPLY_CATEGORIES = [
  "Drinking Water",
  "Dry Food / Rations",
  "Medical Supplies / First Aid",
  "Baby Food & Formula",
  "Blankets & Bedding",
  "Sanitation & Hygiene Kits",
  "Emergency Power / Fuel",
  "Other",
];

const INITIAL_FORM_STATE = {
  name: "",
  address: "",
  division: "",
  district: "",
  latitude: 23.685,
  longitude: 90.3563,
  managerName: "",
  contactPhone: "",
  emergencyAltPhone: "",
  occupantCount: 0,
  capacity: 100,
  criticalSupplies: SUPPLY_CATEGORIES.map((category) => ({
    category,
    status: "ADEQUATE",
    quantityNeeded: "",
  })),
};

export default function AdminShelterManagement() {
  const { toast, showNotification } = useToast();
  const {
    shelters,
    loading,
    metrics,
    filters,
    deleteShelter,
    refreshShelters,
  } = useShelterOperations(showNotification);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [selectedShelterId, setSelectedShelterId] = useState(null);

  const handleSupplyChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.criticalSupplies];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, criticalSupplies: updated };
    });
  };

  const handleMarkAllAdequate = () => {
    setFormData((prev) => ({
      ...prev,
      criticalSupplies: prev.criticalSupplies.map((sup) => ({
        ...sup,
        status: "ADEQUATE",
        quantityNeeded: "",
      })),
    }));
  };

  const handleLocationChange = async (loc) => {
    setFormData((prev) => ({
      ...prev,
      division: loc.division,
      district: loc.district,
    }));
    if (loc.district || loc.division) {
      const coords = await fetchCoordinatesOnSubmit({
        division: loc.division,
        district: loc.district,
        latitude: null,
        longitude: null,
      });
      setFormData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const coords = await fetchCoordinatesOnSubmit({
      ...formData,
      manualAddress: formData.address,
    });
    const payload = {
      ...formData,
      latitude: Number(coords.latitude),
      longitude: Number(coords.longitude),
      occupantCount: Number(formData.occupantCount),
      capacity: Number(formData.capacity),
      criticalSupplies: formData.criticalSupplies.map((s) => ({
        ...s,
        quantityNeeded: s.quantityNeeded?.trim() ? s.quantityNeeded : undefined,
      })),
    };

    try {
      await axios.post(
        `${API_BASE_URL}/api/shelters`,
        payload,
        getAuthHeaders(),
      );
      setIsCreateOpen(false);
      setFormData(INITIAL_FORM_STATE);
      showNotification("Shelter registered successfully!");
      refreshShelters();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to create shelter",
        "error",
      );
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      managerName: formData.managerName,
      contactPhone: formData.contactPhone,
      emergencyAltPhone: formData.emergencyAltPhone,
      occupantCount: Number(formData.occupantCount),
      capacity: Number(formData.capacity),
      criticalSupplies: formData.criticalSupplies.map((s) => ({
        ...s,
        quantityNeeded: s.quantityNeeded?.toString().trim()
          ? s.quantityNeeded
          : undefined,
      })),
    };

    try {
      await axios.put(
        `${API_BASE_URL}/api/shelters/${selectedShelterId}`,
        payload,
        getAuthHeaders(),
      );
      setIsUpdateOpen(false);
      setSelectedShelterId(null);
      showNotification("Shelter information updated");
      refreshShelters();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to update shelter",
        "error",
      );
    }
  };

  const openUpdateModal = (shelter) => {
    setSelectedShelterId(shelter._id);
    setFormData({
      managerName: shelter.managerName || "",
      contactPhone: shelter.contactPhone || "",
      emergencyAltPhone: shelter.emergencyAltPhone || "",
      occupantCount: shelter.occupantCount || 0,
      capacity: shelter.capacity || 100,
      criticalSupplies: SUPPLY_CATEGORIES.map((cat) => {
        const existing = shelter.criticalSupplies?.find(
          (s) => s.category === cat,
        );
        return existing
          ? { ...existing }
          : { category: cat, status: "ADEQUATE", quantityNeeded: "" };
      }),
    });
    setIsUpdateOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800 relative">
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-bold flex items-center gap-2 ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}
        >
          <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 w-full max-w-[100vw] md:max-w-none flex flex-col h-screen overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 bg-slate-200 rounded hover:bg-slate-300"
              >
                <svg
                  className="w-6 h-6 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Shelter Operations Dashboard
                </h1>
                <p className="text-sm text-slate-500">
                  Monitor live occupancy, manager contacts, and supply
                  shortages.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFormData(INITIAL_FORM_STATE);
                setIsCreateOpen(true);
              }}
              className="bg-[#00ADB5] hover:bg-[#0097A0] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
            >
              + Register Shelter
            </button>
          </div>

          <ShelterKpiCards metrics={metrics} />
          <ShelterFilterBar {...filters} />

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ADB5]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
              {shelters.map((shelter) => (
                <ShelterCard
                  key={shelter._id}
                  shelter={shelter}
                  onOpenUpdate={openUpdateModal}
                  onDelete={deleteShelter}
                />
              ))}
              {shelters.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                  <p className="text-base font-semibold text-slate-700">
                    No shelters match your filter selection.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try clearing search or filters.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateShelterModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateSubmit}
        onLocationChange={handleLocationChange}
        onSupplyChange={handleSupplyChange}
      />
      <UpdateShelterModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdateSubmit}
        onSupplyChange={handleSupplyChange}
        onMarkAllAdequate={handleMarkAllAdequate}
      />
    </div>
  );
}
