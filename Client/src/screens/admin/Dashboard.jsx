import React from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Typography,
  Progress,
  List,
  Avatar,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShoppingOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

/**
 * Dashboard - Trang tổng quan của quản trị viên
 *
 * Hiển thị các thông tin quan trọng như:
 * - Thống kê tổng quan (doanh thu, đơn hàng, sản phẩm, khách hàng)
 * - Biểu đồ doanh thu
 * - Danh sách đơn hàng gần đây
 * - Sản phẩm bán chạy
 */
const Dashboard = () => {
  // Dữ liệu mẫu cho bảng đơn hàng gần đây
  const recentOrdersData = [
    {
      key: "1",
      id: "ORD-00123",
      customer: "Nguyen Van A",
      date: "2023-06-15",
      amount: 1250000,
      status: "Đã thanh toán",
    },
    {
      key: "2",
      id: "ORD-00124",
      customer: "Tran Thi B",
      date: "2023-06-14",
      amount: 3500000,
      status: "Đang xử lý",
    },
    {
      key: "3",
      id: "ORD-00125",
      customer: "Le Van C",
      date: "2023-06-13",
      amount: 780000,
      status: "Đã giao hàng",
    },
    {
      key: "4",
      id: "ORD-00126",
      customer: "Pham Thi D",
      date: "2023-06-12",
      amount: 1650000,
      status: "Đã thanh toán",
    },
  ];

  // Cấu hình cột cho bảng đơn hàng
  const recentOrdersColumns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Giá trị",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${amount.toLocaleString("vi-VN")} ₫`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        if (status === "Đã thanh toán") color = "green";
        else if (status === "Đang xử lý") color = "blue";
        else if (status === "Đã giao hàng") color = "purple";
        return <span style={{ color }}>{status}</span>;
      },
    },
  ];

  // Dữ liệu mẫu cho sản phẩm bán chạy
  const topSellingProducts = [
    {
      title: "Áo phông nam Cotton Compact Premium",
      sales: 245,
      percent: 85,
    },
    {
      title: "Quần Jeans Slim Fit",
      sales: 190,
      percent: 70,
    },
    {
      title: "Áo sơ mi nữ dài tay",
      sales: 140,
      percent: 55,
    },
    {
      title: "Giày thể thao Ultrabounce",
      sales: 120,
      percent: 45,
    },
  ];

  return (
    <div>
      <Title level={2}>Bảng điều khiển</Title>

      {/* Thẻ thống kê */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={152500000}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<DollarOutlined />}
              suffix="₫"
              formatter={(value) => `${value.toLocaleString("vi-VN")}`}
            />
            <span style={{ color: "#3f8600" }}>
              <ArrowUpOutlined /> 15% so với tháng trước
            </span>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đơn hàng"
              value={485}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ShoppingCartOutlined />}
            />
            <span style={{ color: "#1890ff" }}>
              <ArrowUpOutlined /> 8% so với tháng trước
            </span>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={128}
              valueStyle={{ color: "#9254de" }}
              prefix={<ShoppingOutlined />}
            />
            <span>
              <ArrowUpOutlined style={{ color: "#9254de" }} /> 12 sản phẩm mới
            </span>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={2450}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<UserOutlined />}
            />
            <span style={{ color: "#ff4d4f" }}>
              <ArrowUpOutlined /> 22% so với tháng trước
            </span>
          </Card>
        </Col>
      </Row>

      {/* Đơn hàng gần đây và Sản phẩm bán chạy */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} lg={16}>
          <Card title="Đơn hàng gần đây">
            <Table
              columns={recentOrdersColumns}
              dataSource={recentOrdersData}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
