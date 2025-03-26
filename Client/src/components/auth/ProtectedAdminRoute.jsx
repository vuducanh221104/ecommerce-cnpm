import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { Spin } from "antd";
import styled from "styled-components";
import { getCurrentUser, isLoggedIn } from "../../services/authService";
import { hasAdminAccess } from "../../utils/roleUtils";

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

/**
 * ProtectedAdminRoute - Component bảo vệ đường dẫn admin
 *
 * Kiểm tra người dùng đã đăng nhập và có quyền admin không (role > 0)
 * Nếu chưa đăng nhập hoặc không có quyền, chuyển hướng đến trang đăng nhập admin
 * với returnUrl là đường dẫn hiện tại
 */
const ProtectedAdminRoute = ({ children }) => {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Kiểm tra xác thực người dùng
    const checkAuth = () => {
      const user = getCurrentUser();
      const loggedIn = isLoggedIn();

      // Kiểm tra người dùng đã đăng nhập và có quyền admin
      if (loggedIn && user && hasAdminAccess(user)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }

      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  // Hiển thị loading khi đang kiểm tra xác thực
  if (!authChecked) {
    return (
      <LoadingContainer>
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </LoadingContainer>
    );
  }

  // Nếu không có quyền, chuyển hướng đến trang đăng nhập admin
  if (!isAuthorized) {
    // Lưu đường dẫn hiện tại vào returnUrl để sau khi đăng nhập chuyển lại
    return (
      <Navigate
        to={`/admin/login?returnUrl=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Nếu có quyền admin, hiển thị nội dung
  return children;
};

ProtectedAdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedAdminRoute;
