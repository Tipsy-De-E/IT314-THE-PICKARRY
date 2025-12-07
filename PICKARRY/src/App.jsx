import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import CustomerAuth from './pages/customer/CustomerAuth';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerMenu from './pages/customer/CustomerMenu';
import CourierHome from './pages/courier/CourierHome';
import CourierHistory from './pages/courier/CourierHistory';
import CourierBook from './pages/courier/CourierBook';
import CourierDelivery from './pages/courier/CourierDelivery';
import CourierMenu from './pages/courier/CourierMenu';
import SwitchToCustomer from './pages/courier/Courier-Menu/SwitchToCustomer';
import SupportComplaints from './pages/courier/Courier-Menu/SupportComplaints';
import CourierPolicies from './pages/courier/Courier-Menu/CourierPolicies';
import SafetyGuidelines from './pages/courier/Courier-Menu/SafetyGuidelines';
import RiderCommunity from './pages/courier/Courier-Menu/RiderCommunity';
import VehicleMaintenance from './pages/courier/Courier-Menu/VehicleMaintenance';
import AboutPickarry from './pages/courier/Courier-Menu/AboutPickarry';
import Layout from './components/Layout';
import CourierTable from './pages/admin/CourierTable';
import CourierProfile from './pages/admin/CourierProfile';
import CustomerTable from './pages/admin/CustomerTable';
import CustomerProfile from './pages/admin/CustomerProfile';
import OrdersTable from './pages/admin/OrdersTable';
import OrderProfile from './pages/admin/OrderProfile';
import Menu from './pages/admin/Menu';
import Home from './pages/admin/Home';
import FareManagement from './pages/admin/FareManagement';
import ReportsComplaints from './pages/admin/ReportsComplaints';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Routes */}
        <Route path="/customer/auth" element={<CustomerAuth />} />
        <Route path="/customer/home" element={
          <ProtectedRoute requiredUserType="customer">
            <CustomerHome />
          </ProtectedRoute>
        } />
        <Route path="/customer/orders" element={
          <ProtectedRoute requiredUserType="customer">
            <CustomerOrders />
          </ProtectedRoute>
        } />
        <Route path="/customer/menu" element={
          <ProtectedRoute requiredUserType="customer">
            <CustomerMenu />
          </ProtectedRoute>
        } />

        {/* Courier Routes */}
        <Route path="/courier/home" element={
          <ProtectedRoute requiredUserType="courier">
            <CourierHome />
          </ProtectedRoute>
        } />
        <Route path="/courier/history" element={
          <ProtectedRoute requiredUserType="courier">
            <CourierHistory />
          </ProtectedRoute>
        } />
        <Route path="/courier/delivery" element={
          <ProtectedRoute requiredUserType="courier">
            <CourierDelivery />
          </ProtectedRoute>
        } />
        <Route path="/courier/book" element={
          <ProtectedRoute requiredUserType="courier">
            <CourierBook />
          </ProtectedRoute>
        } />
        <Route path="/courier/menu" element={
          <ProtectedRoute requiredUserType="courier">
            <CourierMenu />
          </ProtectedRoute>
        } />
        <Route path="/courier/switch-customer" element={
          <ProtectedRoute requiredUserType="courier">
            <SwitchToCustomer />
          </ProtectedRoute>
        } />
        <Route path="/courier/support" element={
          <ProtectedRoute requiredUserType="courier">
            <SupportComplaints />
          </ProtectedRoute>
        } />
        <Route path="/courier/policies" element={
          <ProtectedRoute requiredUserType="courier">
            <CourierPolicies />
          </ProtectedRoute>
        } />
        <Route path="/courier/safety" element={
          <ProtectedRoute requiredUserType="courier">
            <SafetyGuidelines />
          </ProtectedRoute>
        } />
        <Route path="/courier/community" element={
          <ProtectedRoute requiredUserType="courier">
            <RiderCommunity />
          </ProtectedRoute>
        } />
        <Route path="/courier/maintenance" element={
          <ProtectedRoute requiredUserType="courier">
            <VehicleMaintenance />
          </ProtectedRoute>
        } />
        <Route path="/courier/about" element={
          <ProtectedRoute requiredUserType="courier">
            <AboutPickarry />
          </ProtectedRoute>
        } />

        {/* Admin Dashboard Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute requiredUserType="admin">
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courier" element={<CourierTable />} />
                <Route path="/courier/profile/:id?" element={<CourierProfile />} />
                <Route path="/customer" element={<CustomerTable />} />
                <Route path="/customer/profile/:id?" element={<CustomerProfile />} />
                <Route path="/order" element={<OrdersTable />} />
                <Route path="/order/details/:id" element={<OrderProfile />} />
                <Route path="/fare" element={<FareManagement />} />
                <Route path="/complaints" element={<ReportsComplaints />} />
                <Route path="/menu" element={<Menu />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Default redirect to customer auth if needed */}
        <Route path="/customer/auth" element={<CustomerAuth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* // In your App.js */}

      </Routes>
    </Router>
  );
}

export default App;
