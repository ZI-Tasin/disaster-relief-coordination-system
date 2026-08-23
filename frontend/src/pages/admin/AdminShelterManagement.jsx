import React, { useState } from "react";
import axios from "axios";

import Navbar from "../../components/Navbar";
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
  "https://disaster-relief-coordination-system-kmf2.onrender.com";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
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

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        criticalSupplies: updated,
      };
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
          : {
              category: cat,
              status: "ADEQUATE",
              quantityNeeded: "",
            };
      }),
    });

    setIsUpdateOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <div className="fixed left-0 right-0 top-0 z-[60]">
        <Navbar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* =====================================================
          MAIN DASHBOARD
          Starts BELOW navbar and BESIDE fixed sidebar
      ===================================================== */}

      <main
        className="
          min-h-screen
          pt-[64px]
          md:ml-64
        "
      >
        <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            {/* =================================================
                TOAST
            ================================================= */}

            {toast.show && (
              <div
                className={`
                  fixed
                  right-4
                  top-20
                  z-[100]
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-xl
                  sm:right-6
                  ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}
                `}
              >
                <span>{toast.type === "error" ? "⚠️" : "✅"}</span>

                <span>{toast.message}</span>
              </div>
            )}

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div
              className="
                mb-6
                flex
                flex-col
                gap-4
                sm:mb-8
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="min-w-0">
                <h1
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                    sm:text-2xl
                    lg:text-3xl
                  "
                >
                  Shelter Operations Dashboard
                </h1>

                <p
                  className="
                    mt-1
                    max-w-2xl
                    text-xs
                    leading-relaxed
                    text-slate-500
                    sm:text-sm
                  "
                >
                  Monitor live occupancy, manager contacts, and supply
                  shortages.
                </p>
              </div>

              {/* Register Shelter */}

              <button
                type="button"
                onClick={() => {
                  setFormData(INITIAL_FORM_STATE);
                  setIsCreateOpen(true);
                }}
                className="
                  inline-flex
                  min-h-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#00ADB5]
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#0097A0]
                  active:scale-[0.98]
                "
              >
                + Register Shelter
              </button>
            </div>

            {/* =================================================
                KPI CARDS
            ================================================= */}

            <section className="mb-6 min-w-0 sm:mb-8">
              <ShelterKpiCards metrics={metrics} />
            </section>

            {/* =================================================
                FILTER BAR
            ================================================= */}

            <section className="mb-6 min-w-0 sm:mb-8">
              <ShelterFilterBar {...filters} />
            </section>

            {/* =================================================
                SHELTERS
            ================================================= */}

            {loading ? (
              <div
                className="
                  flex
                  min-h-[300px]
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-sm
                "
              >
                <div
                  className="
                    h-9
                    w-9
                    animate-spin
                    rounded-full
                    border-4
                    border-[#00ADB5]/20
                    border-t-[#00ADB5]
                  "
                />
              </div>
            ) : (
              <div
                className="
                  grid
                  min-w-0
                  grid-cols-1
                  gap-5
                  pb-10
                  xl:grid-cols-2
                "
              >
                {shelters.map((shelter) => (
                  <ShelterCard
                    key={shelter._id}
                    shelter={shelter}
                    onOpenUpdate={openUpdateModal}
                    onDelete={deleteShelter}
                  />
                ))}

                {shelters.length === 0 && (
                  <div
                    className="
                      col-span-full
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      px-6
                      py-16
                      text-center
                    "
                  >
                    <p className="text-base font-semibold text-slate-700">
                      No shelters match your filter selection.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try clearing search or filters.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* =====================================================
          CREATE SHELTER MODAL
      ===================================================== */}

      <CreateShelterModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateSubmit}
        onLocationChange={handleLocationChange}
        onSupplyChange={handleSupplyChange}
      />

      {/* =====================================================
          UPDATE SHELTER MODAL
      ===================================================== */}

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
