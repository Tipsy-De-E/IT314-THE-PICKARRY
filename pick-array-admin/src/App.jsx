import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerAuth from './pages/customer/CustomerAuth';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerMenu from './pages/customer/CustomerMenu';
import CourierHome from './pages/courier/CourierHome';
import CourierHistory from './pages/courier/CourierHistory';
import CourierBook from './pages/courier/CourierBook';
import CourierMenu from './pages/courier/CourierMenu';
import Layout from './components/Layout';
import CourierTable from './pages/CourierTable';
import CourierProfile from './pages/CourierProfile';
import CustomerTable from './pages/CustomerTable';
import CustomerProfile from './pages/CustomerProfile';
import OrdersTable from './pages/OrdersTable';
import Menu from './pages/Menu';
import Home from './pages/Home';

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
                <Route path="/menu" element={<Menu />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Default redirect to admin */}
        <Route path="/" element={<CustomerAuth />} />
      </Routes>
    </Router>
  );
}

export default App;