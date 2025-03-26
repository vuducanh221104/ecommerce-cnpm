import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import ProductsManagement from "./ProductsManagement";
import ProductCommentsManagement from "./ProductCommentsManagement";
import OrdersManagement from "./OrdersManagement";
import CustomersManagement from "./CustomersManagement";
import AdminsManagement from "./AdminsManagement";
import AdminLoginScreen from "./AdminLoginScreen";
import ProtectedAdminRoute from "../../components/auth/ProtectedAdminRoute";
import { Result, Button } from "antd";

/**
 * Trang "Đang xây dựng" khi chức năng chưa được triển khai
 */
const UnderConstruction = ({ title }) => (
  <Result
    status="info"
    title={title || "Chức năng đang phát triển"}
    subTitle="Tính năng này đang được xây dựng và sẽ sớm được hoàn thiện."
    extra={
      <Button type="primary" onClick={() => window.history.back()}>
        Quay lại
      </Button>
    }
  />
);

/**
 * AdminRoutes - Cấu hình route cho Admin Panel
 *
 * Quản lý các routes cho phần Admin, bao gồm:
 * - Dashboard (tổng quan)
 * - Quản lý sản phẩm
 * - Các trang chức năng khác (đang xây dựng)
 */
const AdminRoutes = () => {
  return (
    <Routes>
      {/* Admin Login Route - Không cần bảo vệ */}
      <Route path="/login" element={<AdminLoginScreen />} />

      {/* Protected Admin Routes - Cần xác thực và quyền admin */}
      <Route
        path="/"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Products Management */}
        <Route path="products" element={<ProductsManagement />} />

        {/* Product (singular) - Alias for products */}
        <Route path="product" element={<ProductsManagement />} />

        {/* Orders Management */}
        <Route path="orders" element={<OrdersManagement />} />

        {/* Customers Management */}
        <Route path="customers" element={<CustomersManagement />} />

        {/* Admins Management */}
        <Route path="admins" element={<AdminsManagement />} />

        {/* Product Comments Management */}
        <Route
          path="product-comments"
          element={<ProductCommentsManagement />}
        />
        {/* Make 'comments' route also direct to ProductCommentsManagement for backward compatibility */}
        <Route path="comments" element={<ProductCommentsManagement />} />

        {/* Settings (Under construction) */}
        <Route
          path="settings"
          element={<UnderConstruction title="Cài đặt hệ thống" />}
        />

        {/* 404 For admin routes */}
        <Route
          path="*"
          element={
            <Result
              status="404"
              title="404"
              subTitle="Trang bạn tìm kiếm không tồn tại."
              extra={
                <Button type="primary" onClick={() => window.history.back()}>
                  Quay lại
                </Button>
              }
            />
          }
        />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
