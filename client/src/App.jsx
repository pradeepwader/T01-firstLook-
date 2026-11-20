import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import { Login, Register } from './pages/Auth';
import { ForgotPassword, ResetPassword } from './pages/PasswordReset';
import Checkout from './pages/Checkout';
import PaymentStatus from './pages/PaymentStatus';
import PaymentMock from './pages/PaymentMock';
import Dashboard from './pages/Dashboard';
import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminContent from './pages/admin/AdminContent';

const NotFound = () => (
  <div className="container-t01 py-24 text-center">
    <h1 className="text-7xl font-extrabold text-navy-800/20">404</h1>
    <p className="mt-3 mb-6">This page does not exist.</p>
    <a href="/" className="btn-primary">Back to home</a>
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public: User 1 (explore products) and User 2 (explore landing page) journeys */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Purchase flow: Checkout -> Online Payment -> Verify */}
          <Route path="/checkout/:slug" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/payment/status" element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>} />
          <Route path="/payment/mock" element={<ProtectedRoute><PaymentMock /></ProtectedRoute>} />

          {/* User dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Admin dashboard */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Overview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
