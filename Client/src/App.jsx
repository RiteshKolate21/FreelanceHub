import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { ProtectedRoutes } from "./components/ProtectedRoutes.jsx";

// Public Pages
import { Landing } from "./pages/public/Landing.jsx";

// Auth Pages
import { Login } from "./pages/auth/Login.jsx";
import { Register } from "./pages/auth/Register.jsx";

// Client Pages
import { ClientDashboard } from "./pages/client/ClientDashboard.jsx";
import { ClientProjects } from "./pages/client/ClientProjects.jsx";
import { ProjectDetail } from "./pages/client/ProjectDetail.jsx";
import { ClientApplications } from "./pages/client/ClientApplications.jsx";

// Freelancer Pages
import { FreelancerDashboard } from "./pages/freelancer/FreelancerDashboard.jsx";
import { DiscoverProjects } from "./pages/freelancer/DiscoverProjects.jsx";
import { MyApplications } from "./pages/freelancer/MyApplications.jsx";
import { MyWork } from "./pages/freelancer/MyWork.jsx";
import { FreelancerProfileEdit } from "./pages/freelancer/FreelancerProfileEdit.jsx";

// Shared Pages
import { FreelancerDiscovery } from "./pages/shared/FreelancerDiscovery.jsx";
import { FreelancerProfileView } from "./pages/shared/FreelancerProfileView.jsx";
import { NotificationsPage } from "./pages/shared/NotificationsPage.jsx";

// Admin Pages
import { AdminOverview } from "./pages/admin/AdminOverview.jsx";
import { AdminUsers } from "./pages/admin/AdminUsers.jsx";
import { AdminProjects } from "./pages/admin/AdminProjects.jsx";
import { AdminReviews } from "./pages/admin/AdminReviews.jsx";

const HomeOrDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Landing />;
  if (user?.userType === "Client") return <Navigate to="/client/dashboard" replace />;
  if (user?.userType === "Freelancer") return <Navigate to="/freelancer/dashboard" replace />;
  if (user?.userType === "Admin") return <Navigate to="/admin/overview" replace />;
  return <Landing />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<HomeOrDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Client Routes */}
            <Route element={<ProtectedRoutes allowedRoles={["Client"]} />}>
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/client/projects" element={<ClientProjects />} />
              <Route path="/client/applications" element={<ClientApplications />} />
            </Route>

            {/* Freelancer Routes */}
            <Route element={<ProtectedRoutes allowedRoles={["Freelancer"]} />}>
              <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
              <Route path="/discover" element={<DiscoverProjects />} />
              <Route path="/freelancer/applications" element={<MyApplications />} />
              <Route path="/freelancer/work" element={<MyWork />} />
              <Route path="/freelancer/profile" element={<FreelancerProfileEdit />} />
            </Route>

            {/* Shared Authenticated Routes */}
            <Route element={<ProtectedRoutes allowedRoles={["Client", "Freelancer", "Admin"]} />}>
              <Route path="/client/projects/:id" element={<ProjectDetail />} />
              <Route path="/freelancers" element={<FreelancerDiscovery />} />
              <Route path="/freelancers/:userId" element={<FreelancerProfileView />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoutes allowedRoles={["Admin"]} />}>
              <Route path="/admin/overview" element={<AdminOverview />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
