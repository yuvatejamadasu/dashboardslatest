import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages for performance
const Login        = lazy(() => import('@/pages/super-admin/Login'));
const Statistics   = lazy(() => import('@/pages/super-admin/Statistics'));
const Profile      = lazy(() => import('@/pages/super-admin/Profile'));
const Settings     = lazy(() => import('@/pages/super-admin/Settings'));
const HelpCenter   = lazy(() => import('@/pages/super-admin/HelpCenter'));
const Logout       = lazy(() => import('@/pages/super-admin/Logout'));
const SuperAdminDashboard = lazy(() => import('@/pages/super-admin/SuperAdminDashboard'));
const HubList      = lazy(() => import('@/pages/super-admin/HubList'));
const StoreList    = lazy(() => import('@/pages/super-admin/StoreList'));
const CreateAdmin  = lazy(() => import('@/pages/super-admin/CreateAdmin'));
const CreateSuperAdmin = lazy(() => import('@/pages/super-admin/CreateSuperAdmin'));
const CreateHub    = lazy(() => import('@/pages/super-admin/CreateHub'));
const CreateStore  = lazy(() => import('@/pages/super-admin/CreateStore'));
const DeletedAdmins= lazy(() => import('@/pages/super-admin/DeletedAdmins'));

// Loading spinner fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 size={36} className="animate-spin text-blue-500" />
      <p className="text-sm font-semibold text-slate-400">Loading page...</p>
    </div>
  </div>
);

const wrap = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes without Sidebar */}
      <Route path="/login" element={wrap(Login)} />

      {/* All routes nested inside Layout – renders Sidebar + Navbar for every page */}
      <Route element={<Layout />}>
        {/* Default redirect to Login */}
        <Route index element={<Navigate to="/login" replace />} />

        {/* Main pages */}
        <Route path="/super-admin-dashboard" element={wrap(SuperAdminDashboard)} />
        <Route path="/hubs" element={wrap(HubList)} />
        <Route path="/stores" element={wrap(StoreList)} />
        <Route path="/statistics"   element={wrap(Statistics)} />
        <Route path="/create-admin" element={wrap(CreateAdmin)} />
        <Route path="/create-super-admin" element={wrap(CreateSuperAdmin)} />
        <Route path="/create-hub" element={wrap(CreateHub)} />
        <Route path="/create-store" element={wrap(CreateStore)} />
        <Route path="/trash" element={wrap(DeletedAdmins)} />

        {/* Account pages */}
        <Route path="/profile"  element={wrap(Profile)} />
        <Route path="/settings" element={wrap(Settings)} />
        <Route path="/help"     element={wrap(HelpCenter)} />
        <Route path="/logout"   element={wrap(Logout)} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
