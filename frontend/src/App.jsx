import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import VolunteerRegistration from "./pages/VolunteerRegistration";

import CampaignList from "./pages/CampaignList";
import CampaignDetails from "./pages/CampaignDetails";
import MyDonations from "./pages/MyDonations";

import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

import EmailLogs from "./pages/admin/EmailLogs";
import CertificatePreview from "./pages/admin/CertificatePreview";

import CampaignAnalytics from "./pages/CampaignAnalytics";

import AdminCampaigns from "./pages/admin/AdminCampaigns";
import CreateCampaign from "./pages/admin/CreateCampaign";
import EditCampaign from "./pages/admin/EditCampaign";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VolunteerProfile from "./pages/VolunteerProfile";
import MissionStageTracker from "./pages/MissionStageTracker";
import SMSBroadcast from "./pages/admin/SMSBroadcast";
import AlertConfiguration from "./pages/admin/AlertConfiguration";
import WeatherTracker from "./pages/admin/WeatherTracker";

// Public Disaster Reporting & Admin Verification Pages
import DisasterReportPage from "./pages/disasterReportPage.jsx";
import AdminVerificationPage from "./pages/admin/AdminVerificationPage";
import SeverityThresholdPage from "./pages/admin/SeverityThresholdPage";

// Map & GIS Pages
import HomePage from "./pages/HomePage.jsx";
import IncidentCommandMapPage from "./pages/admin/IncidentCommandMapPage";

import TaskAssignmentBoard from "./pages/admin/TaskAssignmentBoard";

import StageFeed from "./pages/admin/StageFeed";

// Shelter & Crisis Analytics Pages
import ShelterDirectoryPage from "./pages/ShelterDirectoryPage";
import AdminShelterManagement from "./pages/admin/AdminShelterManagement";
import CrisisAnalyticsDashboard from "./pages/admin/CrisisAnalyticsDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          <Route path="/register" element={<VolunteerRegistration />} />

          <Route path="/" element={<HomePage />} />

          {/* Public Disaster Reporting */}
          <Route path="/report" element={<DisasterReportPage />} />

          {/* Public Shelter Directory */}
          <Route path="/shelters" element={<ShelterDirectoryPage />} />

          <Route
            path="/admin/map"
            element={
              <ProtectedRoute role="admin">
                <IncidentCommandMapPage />
              </ProtectedRoute>
            }
          />

          {/* Donor */}
          <Route path="/campaigns" element={<CampaignList />} />

          <Route path="/campaigns/:id" element={<CampaignDetails />} />

          <Route path="/donations" element={<MyDonations />} />

          <Route path="/payment-success" element={<PaymentSuccess />} />

          <Route path="/payment-cancel" element={<PaymentCancel />} />

          {/* User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Volunteer Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <VolunteerProfile />
              </ProtectedRoute>
            }
          />

          {/* Relief Distribution Stage Tracker -- volunteer's own active mission */}
          <Route
            path="/mission-tracker"
            element={
              <ProtectedRoute>
                <MissionStageTracker />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              ADMIN ROUTES
          ================================================= */}

          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Crisis Analytics */}
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute role="admin">
                <CrisisAnalyticsDashboard />
              </ProtectedRoute>
            }
          />

          {/* Campaign Analytics */}
          <Route
            path="/admin/campaign-analytics"
            element={
              <ProtectedRoute role="admin">
                <CampaignAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Admin Report Verification Queue */}
          <Route
            path="/admin/report-verification"
            element={
              <ProtectedRoute role="admin">
                <AdminVerificationPage />
              </ProtectedRoute>
            }
          />

          {/* Volunteer Task Assignment Board */}
          <Route
            path="/admin/task-board"
            element={
              <ProtectedRoute role="admin">
                <TaskAssignmentBoard />
              </ProtectedRoute>
            }
          />

          {/* Relief Distribution Stage Feed -- admin consolidated view */}
          <Route
            path="/admin/stage-feed"
            element={
              <ProtectedRoute role="admin">
                <StageFeed />
              </ProtectedRoute>
            }
          />

          {/* Admin Global Severity Thresholds */}
          <Route
            path="/admin/severity-threshold"
            element={
              <ProtectedRoute role="admin">
                <SeverityThresholdPage />
              </ProtectedRoute>
            }
          />

          {/* Shelter Management */}
          <Route
            path="/admin/shelters"
            element={
              <ProtectedRoute role="admin">
                <AdminShelterManagement />
              </ProtectedRoute>
            }
          />

          {/* Admin Campaign Management */}
          <Route
            path="/admin/campaigns"
            element={
              <ProtectedRoute role="admin">
                <AdminCampaigns />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/campaigns/create"
            element={
              <ProtectedRoute role="admin">
                <CreateCampaign />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/campaigns/edit/:id"
            element={
              <ProtectedRoute role="admin">
                <EditCampaign />
              </ProtectedRoute>
            }
          />

          {/* Alert Configuration */}
          <Route
            path="/admin/alerts"
            element={
              <ProtectedRoute role="admin">
                <AlertConfiguration />
              </ProtectedRoute>
            }
          />

          {/* SMS Broadcast */}
          <Route
            path="/admin/sms-broadcast"
            element={
              <ProtectedRoute role="admin">
                <SMSBroadcast />
              </ProtectedRoute>
            }
          />

          {/* Weather Safety Tracker */}
          <Route
            path="/admin/weather"
            element={
              <ProtectedRoute role="admin">
                <WeatherTracker />
              </ProtectedRoute>
            }
          />

          {/* Email Logs */}
          <Route
            path="/admin/email-logs"
            element={
              <ProtectedRoute role="admin">
                <EmailLogs />
              </ProtectedRoute>
            }
          />

          {/* Certificate Preview */}
          <Route
            path="/admin/certificates"
            element={
              <ProtectedRoute role="admin">
                <CertificatePreview />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
