import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import HubLogin from "@/pages/public/HubLogin";
import HubForm from "@/pages/public/HubForm";
import StoreLogin from "@/pages/public/StoreLogin";
import StoreDashboard from "@/pages/public/StoreDashboard";
import StoreForm from "@/pages/public/StoreForm";
import HubSignup from "@/pages/public/HubSignup";
import StoreSignup from "@/pages/public/StoreSignup";
import ResetPassword from "@/pages/public/ResetPassword";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import "@/styles/App.css";

// Super Admin Layout
import SuperAdminWrapper from "@/layouts/SuperAdminLayout";
import SuperAdminDashboard from "@/pages/super-admin/SuperAdminDashboard";
import Statistics from "@/pages/super-admin/Statistics";
import Profile from "@/pages/super-admin/Profile";
import Settings from "@/pages/super-admin/Settings";
import CreateAdmin from "@/pages/super-admin/CreateAdmin";
import CreateSuperAdmin from "@/pages/super-admin/CreateSuperAdmin";
import SuperAdminList from "@/pages/super-admin/SuperAdminList";
import CreateHub from "@/pages/super-admin/CreateHub";
import CreateStore from "@/pages/super-admin/CreateStore";
import HubList from "@/pages/super-admin/HubList";
import StoreList from "@/pages/super-admin/StoreList";
import HubDetail from "@/pages/super-admin/HubDetail";
import StoreDetail from "@/pages/super-admin/StoreDetail";
import Login from "@/pages/super-admin/Login";
import Logout from "@/pages/super-admin/Logout";
import HelpCenter from "@/pages/super-admin/HelpCenter";
import SuperAdminSettings from "@/pages/super-admin/SuperAdminSettings";
import DeletedAdmins from "@/pages/super-admin/DeletedAdmins";
import { ThemeProvider } from "@/context/super-admin/ThemeContext";

import HubAdminRoutes from "@/routes/hub-admin/AppRoutes";
import { ThemeProvider as HubThemeProvider } from "@/context/hub-admin/ThemeContext";
import { ReviewsProvider as HubReviewsProvider } from "@/context/hub-admin/ReviewsContext";
import { ProfileProvider as HubProfileProvider } from "@/context/hub-admin/ProfileContext";
import { BrandsProvider as HubBrandsProvider } from "@/context/hub-admin/BrandsContext";

import StoreAdminRoutesV2 from "@/routes/store-admin/AppRoutes";
import { ThemeProvider as StoreThemeProvider } from "@/context/store-admin/ThemeContext";
import { ReviewsProvider as StoreReviewsProvider } from "@/context/store-admin/ReviewsContext";
import { ProfileProvider as StoreProfileProvider } from "@/context/store-admin/ProfileContext";

function AppContent() {
  const { user, userData } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* Public Routes */}
      <Route path="/login" element={
        <ThemeProvider>
          {user && userData?.role === 'super_admin' ? <Navigate to="/dashboard" replace /> : <Login />}
        </ThemeProvider>
      } />
      <Route path="/hub-login" element={user && userData?.role === 'hub_admin' ? <Navigate to="/hub-dashboard" replace /> : <HubLogin />} />
      <Route path="/store-login" element={user && userData?.role === 'store_admin' ? <Navigate to="/store-dashboard" replace /> : <StoreLogin />} />
      
      {/* Forms and Registration (Public) */}
      <Route element={
        <div className="bg-gray-50 min-h-screen">
          <main className="p-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      }>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/hub" element={<HubForm />} />
        <Route path="/store" element={<StoreForm />} />
        <Route path="/hub-signup" element={<HubSignup />} />
        <Route path="/store-signup" element={<StoreSignup />} />
      </Route>

      {/* Super Admin Dashboard (Protected) */}
      <Route element={
        <ThemeProvider>
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminWrapper />
          </ProtectedRoute>
        </ThemeProvider>
      }>
        <Route path="/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/create-admin" element={<CreateAdmin />} />
        <Route path="/create-super-admin" element={<CreateSuperAdmin />} />
        <Route path="/super-admins" element={<SuperAdminList />} />
        <Route path="/trash" element={<DeletedAdmins />} />
        <Route path="/create-hub" element={<CreateHub />} />
        <Route path="/create-store" element={<CreateStore />} />
        <Route path="/hubs" element={<HubList />} />
        <Route path="/stores" element={<StoreList />} />
        <Route path="/super-admin-settings" element={<SuperAdminSettings />} />
        <Route path="/hub/:id" element={<HubDetail />} />
        <Route path="/store/:id" element={<StoreDetail />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/logout" element={<Logout />} />
      </Route>

      {/* Hub Admin Dashboard (Protected) */}
      <Route path="/hub-dashboard/*" element={
        <ProtectedRoute allowedRoles={['hub_admin']}>
          <HubThemeProvider>
            <HubReviewsProvider>
              <HubProfileProvider>
                <HubBrandsProvider>
                  <HubAdminRoutes />
                </HubBrandsProvider>
              </HubProfileProvider>
            </HubReviewsProvider>
          </HubThemeProvider>
        </ProtectedRoute>
      } />

      {/* Store Admin Dashboard (Protected) */}
      <Route path="/store-dashboard/*" element={
        <ProtectedRoute allowedRoles={['store_admin']}>
          <StoreThemeProvider>
            <StoreReviewsProvider>
              <StoreProfileProvider>
                <StoreAdminRoutesV2 />
              </StoreProfileProvider>
            </StoreReviewsProvider>
          </StoreThemeProvider>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={
        <div className="bg-white h-screen w-full flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">404 - Page Not Found</h1>
          <p className="text-gray-500">The page you are looking for does not exist.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-2 bg-brand text-white rounded-xl font-bold hover:bg-brand-hover transition-all"
          >
            Go to Home
          </button>
        </div>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
