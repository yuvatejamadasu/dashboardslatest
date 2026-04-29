import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/hub-admin/Layout';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages for performance
const Dashboard = lazy(() => import('@/pages/hub-admin/Dashboard'));
import Products from '@/pages/hub-admin/Products';
const Transactions = lazy(() => import('@/pages/hub-admin/Transactions'));
const Orders = lazy(() => import('@/pages/hub-admin/Orders'));
const OrderDetails = lazy(() => import('@/pages/hub-admin/OrderDetails/OrderDetails'));
const Sellers = lazy(() => import('@/pages/hub-admin/Sellers'));
import Stores from '@/pages/hub-admin/Stores';
import StoreAnalytics from '@/pages/hub-admin/StoreAnalytics';
const SellerProfile = lazy(() => import('@/pages/hub-admin/SellerProfile'));
const SellerAnalytics = lazy(() => import('@/pages/hub-admin/SellerAnalytics'));
const Brands = lazy(() => import('@/pages/hub-admin/Brands/BrandPage'));
const BrandDetail = lazy(() => import('@/pages/hub-admin/Brands/BrandProductsPage'));
const Profile = lazy(() => import('@/pages/hub-admin/Profile'));
const Settings = lazy(() => import('@/pages/hub-admin/Settings'));
const Wallet = lazy(() => import('@/pages/hub-admin/Wallet'));
const Billing = lazy(() => import('@/pages/hub-admin/Billing'));
const HelpCenter = lazy(() => import('@/pages/hub-admin/HelpCenter'));
const AddProduct = lazy(() => import('@/pages/hub-admin/AddProduct/AddProduct'));
const FinalSummary = lazy(() => import('@/pages/hub-admin/AddProduct/FinalSummary'));
const CreateAdmin = lazy(() => import('@/pages/hub-admin/CreateAdmin'));
const CreateStore = lazy(() => import('@/pages/hub-admin/CreateStore'));
const StoreDetail = lazy(() => import('@/pages/hub-admin/StoreDetail'));
const Logout = lazy(() => import('@/pages/hub-admin/Logout'));

// Missing sidebar items
const DeliveryPartners = lazy(() => import('@/pages/hub-admin/DeliveryPartners'));
const DeliveryPersonnel = lazy(() => import('@/pages/hub-admin/DeliveryPersonnel'));
const ProductRequests = lazy(() => import('@/pages/hub-admin/ProductRequests'));
const Returns = lazy(() => import('@/pages/hub-admin/Returns'));
const DamagedStock = lazy(() => import('@/pages/hub-admin/DamagedStock'));
const OutOfStock = lazy(() => import('@/pages/hub-admin/OutOfStock'));

// Employee Module
const EmployeeLayout = lazy(() => import('@/pages/hub-admin/Employees/EmployeeLayout'));
const EmployeesList = lazy(() => import('@/pages/hub-admin/Employees/EmployeesList'));
const CreateEmployee = lazy(() => import('@/pages/hub-admin/Employees/CreateEmployee'));
const EmployeeDetails = lazy(() => import('@/pages/hub-admin/Employees/EmployeeDetails'));

// Loading spinner fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 size={36} className="animate-spin text-brand" />
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
      {/* All routes nested inside Layout – renders Sidebar + Navbar for every page */}
      <Route element={<Layout />}>
        {/* Default redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Main pages */}
        <Route path="dashboard" element={wrap(Dashboard)} />
        <Route path="products" element={<Products />} />
        <Route path="add-product" element={wrap(AddProduct)} />
        <Route path="final-summary" element={wrap(FinalSummary)} />
        <Route path="transactions" element={wrap(Transactions)} />
        <Route path="orders" element={wrap(Orders)} />
        <Route path="orders/:id" element={wrap(OrderDetails)} />
        
        <Route path="stores">
          <Route index element={<Stores />} />
          <Route path="create" element={wrap(CreateStore)} />
          <Route path=":id" element={wrap(StoreDetail)} />
          <Route path=":id/analytics" element={<StoreAnalytics />} />
        </Route>

        <Route path="sellers" element={wrap(Sellers)} />
        <Route path="sellers/:id" element={wrap(SellerProfile)} />
        <Route path="sellers/:id/analytics" element={wrap(SellerAnalytics)} />
        <Route path="sellers/*" element={wrap(Sellers)} />
        <Route path="brands" element={wrap(Brands)} />
        <Route path="brands/:id" element={wrap(BrandDetail)} />
        
        {/* Missing Sidebar Routes */}
        <Route path="delivery-partners" element={wrap(DeliveryPartners)} />
        <Route path="delivery-personnel" element={wrap(DeliveryPersonnel)} />
        <Route path="inventory-requests" element={wrap(ProductRequests)} />
        <Route path="returns" element={wrap(Returns)} />
        <Route path="damaged-stock" element={wrap(DamagedStock)} />
        <Route path="out-of-stock" element={wrap(OutOfStock)} />

        {/* Employee Module */}
        <Route path="employees" element={wrap(EmployeeLayout)}>
          <Route index element={wrap(EmployeesList)} />
          <Route path="create" element={wrap(CreateEmployee)} />
          <Route path=":id" element={wrap(EmployeeDetails)} />
        </Route>

        {/* Account pages */}
        <Route path="profile" element={wrap(Profile)} />
        <Route path="settings" element={wrap(Settings)} />
        <Route path="wallet" element={wrap(Wallet)} />
        <Route path="billing" element={wrap(Billing)} />
        <Route path="help" element={wrap(HelpCenter)} />
        <Route path="create-admin" element={wrap(CreateAdmin)} />
        <Route path="logout" element={wrap(Logout)} />

      </Route>
      {/* Catch-all whitespace fallback outside Layout */}
      {/* Catch-all whitespace fallback outside Layout */}
      <Route path="*" element={
        <div className="bg-[#1a1d21] h-screen w-full flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-white mb-2">404 - Page Not Found</h1>
          <p className="text-slate-400">The page you are looking for does not exist.</p>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;
