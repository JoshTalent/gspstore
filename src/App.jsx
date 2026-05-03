import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// import main page
import Login from "./pages/login";

// manager pages
import ManagerDashboard from "./pages/manager/Dashboard"; 
import StockReports from "./pages/manager/StockReports";
import ItemsList from "./pages/manager/itemsPage";
import Profile from "./pages/manager/Profile";

// storekeeper pages
import StoreKeeperDashboard from "./pages/storekeeper/Dashboard";
import StoreItemsList from "./pages/storekeeper/ItemsListPage";
import StockOutPage from "./pages/storekeeper/StockOutPage";
import StoreProfile from "./pages/storekeeper/Profile";

// components
import ProtectedRoute from "./components/ProtectedRoute";

const RootRedirect = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return <Navigate to="/login" replace />;
  
  try {
    const user = JSON.parse(userStr);
    if (user.role === "admin") return <Navigate to="/manager/dashboard" replace />;
    if (user.role === "store_keeper") return <Navigate to="/storekeeper/dashboard" replace />;
    return <Navigate to="/login" replace />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
};

const App = () => {
  // Set up global axios interceptor for JWT
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401 && !error.config.url.includes("/login")) {
          // If unauthorized (token expired or invalid), clear local storage and redirect
          localStorage.clear();
          window.location.href = "/login?expired=true";
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Protected Manager Routes */}
        <Route 
          path="/manager/dashboard" 
          element={
            <ProtectedRoute role="admin">
              <ManagerDashboard />
            </ProtectedRoute>
          } 
          />
        <Route 
          path="/manager/stock-reports" 
          element={
            <ProtectedRoute role="admin">
              <StockReports />
            </ProtectedRoute>
          } 
          />
        <Route 
          path="/manager/item-list" 
          element={
            <ProtectedRoute role="admin">
              <ItemsList />
            </ProtectedRoute>
          } 
          />
        <Route 
          path="/manager/profile" 
          element={
            <ProtectedRoute role="admin">
              <Profile />
            </ProtectedRoute>
          } 
          />

        {/* Protected StoreKeeper Routes */}
        <Route 
          path="/storekeeper/dashboard" 
          element={
            <ProtectedRoute role="store_keeper">
              <StoreKeeperDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/storekeeper/items" 
          element={
            <ProtectedRoute role="store_keeper">
              <StoreItemsList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/storekeeper/stock-out" 
          element={
            <ProtectedRoute role="store_keeper">
              <StockOutPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/storekeeper/profile" 
          element={
            <ProtectedRoute role="store_keeper">
              <StoreProfile />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;
