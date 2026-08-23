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
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("gontobbo_token");

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

const createInitialFormState = () => ({
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
});

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
  const [formData, setFormData] = useState(createInitialFormState);
  const [selectedShelterId, setSelectedShelterId] = useState(null);

  const handleSupplyChange = (index, field, value) => {
    setFormData((previous) => {
      const updatedSupplies = [...previous.criticalSupplies];

      updatedSupplies[index] = {
        ...updatedSupplies[index],
        [field]: value,
      };

      return {
        ...previous,
        criticalSupplies: updatedSupplies,
      };
    });
  };

  const handleMarkAllAdequate = () => {
    setFormData((previous) => ({
      ...previous,
      criticalSupplies: previous.criticalSupplies.map((supply) => ({
        ...supply,
        status: "ADEQUATE",
        quantityNeeded: "",
      })),
    }));
  };

  const handleLocationChange = async (location) => {
    setFormData((previous) => ({
      ...previous,
      division: location.division || "",
      district: location.district || "",
    }));

    if (location.district || location.division) {
      try {
        const coords = await fetchCoordinatesOnSubmit({
          division: location.division,
          district: location.district,
          latitude: null,
          longitude: null,
        });

        setFormData((previous) => ({
          ...previous,
          latitude: Number(coords.latitude),
          longitude: Number(coords.longitude),
        }));
      } catch (error) {
        console.error("Failed to fetch shelter coordinates:", error);
      }
    }
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    try {
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

        criticalSupplies: formData.criticalSupplies.map((supply) => ({
          ...supply,
          quantityNeeded: supply.quantityNeeded?.toString().trim()
            ? supply.quantityNeeded
            : undefined,
        })),
      };

      await axios.post(
        `${API_BASE_URL}/api/shelters`,
        payload,
        getAuthHeaders(),
      );

      setIsCreateOpen(false);
      setFormData(createInitialFormState());

      showNotification("Shelter registered successfully!");

      await refreshShelters();
    } catch (error) {
      console.error("Failed to create shelter:", error);

      showNotification(
        error.response?.data?.message || "Failed to create shelter",
        "error",
      );
    }
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    if (!selectedShelterId) {
      showNotification("No shelter selected", "error");
      return;
    }

    const payload = {
      managerName: formData.managerName,
      contactPhone: formData.contactPhone,
      emergencyAltPhone: formData.emergencyAltPhone,

      occupantCount: Number(formData.occupantCount),
      capacity: Number(formData.capacity),

      criticalSupplies: formData.criticalSupplies.map((supply) => ({
        ...supply,
        quantityNeeded: supply.quantityNeeded?.toString().trim()
          ? supply.quantityNeeded
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
      setFormData(createInitialFormState());

      showNotification("Shelter information updated");

      await refreshShelters();
    } catch (error) {
      console.error("Failed to update shelter:", error);

      showNotification(
        error.response?.data?.message || "Failed to update shelter",
        "error",
      );
    }
  };

  const openUpdateModal = (shelter) => {
    setSelectedShelterId(shelter._id);

    setFormData({
      name: shelter.name || "",
      address: shelter.address || "",
      division: shelter.division || "",
      district: shelter.district || "",

      latitude:
        shelter.latitude !== undefined && shelter.latitude !== null
          ? shelter.latitude
          : 23.685,

      longitude:
        shelter.longitude !== undefined && shelter.longitude !== null
          ? shelter.longitude
          : 90.3563,

      managerName: shelter.managerName || "",
      contactPhone: shelter.contactPhone || "",
      emergencyAltPhone: shelter.emergencyAltPhone || "",

      occupantCount: shelter.occupantCount || 0,
      capacity: shelter.capacity || 100,

      criticalSupplies: SUPPLY_CATEGORIES.map((category) => {
        const existingSupply = shelter.criticalSupplies?.find(
          (supply) => supply.category === category,
        );

        if (existingSupply) {
          return {
            ...existingSupply,
            quantityNeeded: existingSupply.quantityNeeded || "",
          };
        }

        return {
          category,
          status: "ADEQUATE",
          quantityNeeded: "",
        };
      }),
    });

    setIsUpdateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    setFormData(createInitialFormState());
  };

  const handleCloseUpdate = () => {
    setIsUpdateOpen(false);
    setSelectedShelterId(null);
    setFormData(createInitialFormState());
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* =====================================================
          FIXED TOP NAVBAR
          ===================================================== */}
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <Navbar setSidebarOpen={setSidebarOpen} />
      </div>

      {/* =====================================================
          FIXED ADMIN SIDEBAR
          Starts BELOW navbar
          ===================================================== */}
      <div
        className="
          fixed
          left-0
          top-16
          bottom-0
          z-50
          hidden
          w-64
          border-r
          border-slate-200
          bg-white
          md:block
          overflow-y-auto
        "
      >
        <AdminSidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />
      </div>

      {/* =====================================================
          MOBILE SIDEBAR
          ===================================================== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />

          <div
            className="
              absolute
              left-0
              top-16
              bottom-0
              w-72
              overflow-y-auto
              bg-white
              shadow-2xl
            "
          >
            <AdminSidebar
              open={sidebarOpen}
              setOpen={setSidebarOpen}
            />
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN CONTENT
          Starts BELOW navbar
          Leaves room for desktop sidebar
          ===================================================== */}
      <main className="min-h-screen pt-16 md:ml-64">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
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
                max-w-sm
                items-center
                gap-2
                rounded-xl
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-xl
                sm:right-5
                ${
                  toast.type === "error"
                    ? "bg-red-600"
                    : "bg-emerald-600"
                }
              `}
            >
              <span>
                {toast.type === "error" ? "⚠️" : "✅"}
              </span>

              <span>{toast.message}</span>
            </div>
          )}

          {/* =================================================
              PAGE HEADER
              ================================================= */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              {/* Mobile menu */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="
                  mt-1
                  rounded-xl
                  bg-[#30475E]
                  p-2.5
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#222831]
                  md:hidden
                "
                aria-label="Open admin menu"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Shelter Operations Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Monitor live occupancy, manager contacts, and supply
                  shortages.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormData(createInitialFormState());
                setSelectedShelterId(null);
                setIsCreateOpen(true);
              }}
              className="
                w-full
                rounded-xl
                bg-[#00ADB5]
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-[#0097A0]
                sm:w-auto
              "
            >
              + Register Shelter
            </button>
          </div>

          {/* =================================================
              KPI CARDS
              ================================================= */}
          <ShelterKpiCards metrics={metrics} />

          {/* =================================================
              FILTERS
              ================================================= */}
          <div className="mt-6">
            <ShelterFilterBar {...filters} />
          </div>

          {/* =================================================
              SHELTER LIST
              ================================================= */}
          <div className="mt-6">
            {loading ? (
              <div className="flex min-h-[250px] items-center justify-center rounded-2xl bg-white shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-b-[#00ADB5]" />

                  <p className="text-sm font-medium text-slate-500">
                    Loading shelters...
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 pb-12 xl:grid-cols-2">
                {shelters.map((shelter) => (
                  <ShelterCard
                    key={shelter._id}
                    shelter={shelter}
                    onOpenUpdate={openUpdateModal}
                    onDelete={deleteShelter}
                  />
                ))}

                {shelters.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                      🏠
                    </div>

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
        onClose={handleCloseCreate}
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
        onClose={handleCloseUpdate}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdateSubmit}
        onSupplyChange={handleSupplyChange}
        onMarkAllAdequate={handleMarkAllAdequate}
      />
    </div>
  );
}