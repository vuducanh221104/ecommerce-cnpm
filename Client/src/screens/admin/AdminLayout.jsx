import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  theme,
  Typography,
  Avatar,
  Dropdown,
  Space,
  Badge,
  message,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UsergroupAddOutlined,
  CommentOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../../services/authService";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

/**
 * AdminLayout - Bố cục chính cho giao diện quản trị
 *
 * Component này cung cấp layout tổng thể cho trang quản trị, bao gồm:
 * - Sidebar có thể thu gọn với menu điều hướng
 * - Header chứa nút thu gọn sidebar, thông báo và menu người dùng
 * - Content chứa nội dung chính (được render qua Outlet của React Router)
 */
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Lấy thông tin người dùng hiện tại
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logoutUser();
      message.success("Đăng xuất thành công");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Đăng xuất thất bại. Vui lòng thử lại.");
    }
  };

  // Menu items cho sidebar
  const items = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      key: "products",
      icon: <ShoppingOutlined />,
      label: "Sản phẩm",
      onClick: () => navigate("/admin/products"),
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "Đơn hàng",
      onClick: () => navigate("/admin/orders"),
    },
    {
      key: "customers",
      icon: <UsergroupAddOutlined />,
      label: "Khách hàng",
      onClick: () => navigate("/admin/customers"),
    },
    {
      key: "admins",
      icon: <UserOutlined />,
      label: "Quản lý Nhân viên",
      onClick: () => navigate("/admin/admins"),
    },
    {
      key: "comments",
      icon: <CommentOutlined />,
      label: "Bình luận sản phẩm",
      onClick: () => navigate("/admin/product-comments"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/admin/settings"),
    },
  ];

  // Menu items cho dropdown user
  const userDropdownItems = {
    items: [
      {
        key: "1",
        label: "Hồ sơ của tôi",
        icon: <UserOutlined />,
        onClick: () => navigate("/admin/profile"),
      },
      {
        key: "2",
        label: "Cài đặt",
        icon: <SettingOutlined />,
        onClick: () => navigate("/admin/settings"),
      },
      {
        type: "divider",
      },
      {
        key: "3",
        label: "Đăng xuất",
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "white" }}>
            {collapsed ? "AC" : "Admin Control"}
          </Title>
        </div>

        {/* Menu chính */}
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={items}
        />
      </Sider>

      <Layout
        style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s" }}
      >
        {/* Header */}
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          {/* Left section: Toggle button */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />

          {/* Right section: Notifications, User avatar */}
          <div
            style={{ display: "flex", alignItems: "center", marginRight: 20 }}
          >
            {/* Notifications */}
            <Badge count={5} style={{ marginRight: 24 }}>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ fontSize: "16px" }}
              />
            </Badge>

            {/* User dropdown */}
            <Dropdown menu={userDropdownItems} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  style={{ backgroundColor: "#1890ff" }}
                  icon={<UserOutlined />}
                />
                <span>{user ? user.full_name || user.user_name : "Admin"}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          {/* Content được render qua Outlet của React Router */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
