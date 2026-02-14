import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import { ThemeProvider } from "./admin/context/ThemeContext";
import { SettingsProvider } from "./context/SettingsContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CatalogPage from "./pages/CatalogPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import WishlistPage from "./pages/WishlistPage";
import AboutPage from "./pages/AboutPage";
import DeliveryPage from "./pages/DeliveryPage";
import ReturnPage from "./pages/ReturnPage";
import ContactsPage from "./pages/ContactsPage";
import BlogPage from "./pages/BlogPage";

// Admin imports
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminOrdersStats from "./admin/pages/AdminOrdersStats";
import AdminCategories from "./admin/pages/AdminCategories";
import AdminSiteSettings from "./admin/pages/AdminSiteSettings";
import AdminReviews from "./admin/pages/AdminReviews";
import ProtectedRoute from "./admin/components/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AdminAuthProvider>
          <SettingsProvider>
            <CartProvider>
              <WishlistProvider>
                  <Routes>
                {/* Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute>
                      <AdminProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders/stats"
                  element={
                    <ProtectedRoute>
                      <AdminOrdersStats />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute>
                      <AdminCategories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute>
                      <AdminSiteSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reviews"
                  element={
                    <ProtectedRoute>
                      <AdminReviews />
                    </ProtectedRoute>
                  }
                />

                {/* Public Routes with Layout */}
                <Route
                  path="/"
                  element={
                    <div className="App min-h-screen bg-white flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <HomePage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/catalog"
                  element={
                    <div className="App min-h-screen bg-white flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <CatalogPage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/products/:id"
                  element={
                    <div className="App min-h-screen bg-white flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <ProductDetailPage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <div className="App min-h-screen bg-white flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <CartPage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <div className="App min-h-screen bg-white flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <CheckoutPage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/order-success/:orderId"
                  element={
                    <div className="App min-h-screen bg-white flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <OrderSuccessPage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <div className="App min-h-screen bg-white flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <WishlistPage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <div className="App min-h-screen bg-white flex-col">
                      <Header />
                      <main className="flex-1">
                        <AboutPage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/delivery"
                  element={
                    <div className="App min-h-screen bg-white flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <DeliveryPage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/return"
                  element={
                    <div className="App min-h-screen bg-white flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <ReturnPage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/contacts"
                  element={
                    <div className="App min-h-screen bg-white flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <ContactsPage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/blog"
                  element={
                    <div className="App min-h-screen bg-white flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <BlogPage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
                <Route
                  path="/blog/:slug"
                  element={
                    <div className="App min-h-screen bg-white flex flex-col">
                      <Header />
                      <main className="flex-1">
                        <BlogPage />
                      </main>
                      <Footer />
                    </div>
                  }
                />
              </Routes>
              <Toaster
                position="top-center"
                expand={false}
                richColors={false}
                gap={12}
                offset={20}
                visibleToasts={3}
                toastOptions={{
                  duration: 3000,
                  className: '!bg-transparent !border-none !shadow-none !p-0',
                  style: {
                    background: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    padding: 0,
                  },
                }}
              />
            </WishlistProvider>
          </CartProvider>
          </SettingsProvider>
        </AdminAuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
