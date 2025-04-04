import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Button,
  Space,
  Input,
  Tag,
  Modal,
  message,
  Steps,
  Descriptions,
  Card,
  Divider,
  Select,
  Form,
  Row,
  Col,
  DatePicker,
  Tooltip,
  Spin,
  Menu,
  Dropdown,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  CarOutlined,
  InboxOutlined,
  EditOutlined,
  ReloadOutlined,
  FilterOutlined,
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";

// Import services
import * as orderService from "../../services/orderService";
import { getColorHexValue } from "../../utils/constants";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Option } = Select;
const { Step } = Steps;
const { RangePicker } = DatePicker;

/**
 * OrdersManagement - Trang quản lý đơn hàng
 *
 * Các chức năng chính:
 * - Hiển thị danh sách đơn hàng với phân trang và tìm kiếm
 * - Xem chi tiết đơn hàng
 * - Cập nhật trạng thái đơn hàng
 * - Xóa đơn hàng
 */
const OrdersManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [updateForm] = Form.useForm();
  const [filterForm] = Form.useForm();

  // State quản lý danh sách đơn hàng và phân trang
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState("");

  // Effect hooks
  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize, filters]);

  // Check URL query parameters for orderId
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");

    if (orderId && orders.length > 0) {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        handleViewDetail(order);
        // Xóa parameter sau khi đã xử lý để tránh mở lại modal khi refresh
        navigate("/admin/orders", { replace: true });
      }
    }
  }, [location.search, orders]);

  // Lấy danh sách đơn hàng từ API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders(
        pagination.current,
        pagination.pageSize,
        { ...filters, search: searchText }
      );

      if (response.success) {
        // Format data từ API
        const formattedOrders = response.orders.map((order) => ({
          key: order._id,
          id: order._id,
          customer: {
            name: order.shipping_address.full_name,
            phone: order.shipping_address.phone_number,
            email: order.customer_email || "N/A", // Sử dụng email từ order
          },
          date: order.created_at,
          total: order.total_amount,
          status: order.status,
          paymentMethod: order.payment_method,
          paymentStatus: getPaymentStatus(order),
          items: order.products.map((product) => ({
            id: product.product_id,
            name: product.name,
            price: product.price.original,
            quantity: product.quantity,
            size: product.size,
            color: product.color,
          })),
          address: formatAddress(order.shipping_address),
          note: order.notes || "",
          // Các trường bổ sung có thể được thêm sau khi cập nhật
          deliveryPartner: order.delivery_partner,
          trackingCode: order.tracking_code,
          estimatedDelivery: order.estimated_delivery_date,
          notes: order.admin_notes,
        }));

        setOrders(formattedOrders);
        setPagination({
          ...pagination,
          total: response.pagination.total,
        });

        // Kiểm tra xem có orderId trong URL không sau khi đã tải dữ liệu
        const params = new URLSearchParams(location.search);
        const orderId = params.get("orderId");

        if (orderId) {
          const order = formattedOrders.find((o) => o.id === orderId);
          if (order) {
            handleViewDetail(order);
            // Xóa parameter sau khi đã xử lý
            navigate("/admin/orders", { replace: true });
          } else if (!loading) {
            // Nếu không tìm thấy đơn hàng trong trang hiện tại, tìm kiếm đơn hàng đó
            setSearchText(orderId);
            setPagination({
              ...pagination,
              current: 1,
            });
            setTimeout(() => fetchOrders(), 300);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Xác định payment status dựa trên status của đơn hàng
  const getPaymentStatus = (order) => {
    if (order.status === "cancelled") return "cancelled";
    if (order.payment_method === "COD") {
      return order.status === "delivered" ? "paid" : "pending";
    }
    return "paid"; // Temporary logic for other payment methods
  };

  // Helper: Format địa chỉ từ shipping_address
  const formatAddress = (shippingAddress) => {
    const { street, ward, district, city, country } = shippingAddress;
    return `${street}, ${ward}, ${district}, ${city}, ${country}`;
  };

  // Maps for status display
  const statusMap = {
    pending: "Chờ xác nhận",
    processing: "Đang xử lý",
    shipped: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
  };

  const statusColorMap = {
    pending: "blue",
    processing: "orange",
    shipped: "purple",
    delivered: "green",
    cancelled: "red",
  };

  const paymentStatusMap = {
    paid: { text: "Đã thanh toán", color: "green" },
    pending: { text: "Chờ thanh toán", color: "orange" },
    cancelled: { text: "Đã hủy", color: "red" },
  };

  // Cấu hình cột cho bảng đơn hàng
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 180,
      render: (id) => <Tooltip title={id}>{id.substring(0, 10)}...</Tooltip>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      width: 200,
      render: (customer) => (
        <>
          <div>{customer.name}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {customer.phone}
          </div>
          <div style={{ fontSize: "12px", color: "#1890ff" }}>
            {customer.email}
          </div>
        </>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
      width: 150,
      render: (date) => new Date(date).toLocaleString("vi-VN"),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      width: 150,
      render: (total) => `$${total.toLocaleString("en-US")}`,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 120,
      filters: [
        { text: "COD", value: "COD" },
        { text: "Banking", value: "Banking" },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 150,
      render: (status) => (
        <Tag color={paymentStatusMap[status].color}>
          {paymentStatusMap[status].text}
        </Tag>
      ),
      filters: [
        { text: "Đã thanh toán", value: "paid" },
        { text: "Chờ thanh toán", value: "pending" },
        { text: "Đã hủy", value: "cancelled" },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => (
        <Tag color={statusColorMap[status]}>{statusMap[status]}</Tag>
      ),
      filters: Object.keys(statusMap).map((key) => ({
        text: statusMap[key],
        value: key,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditOrder(record)}
          >
            Sửa đơn
          </Button>
          {record.status !== "delivered" && record.status !== "cancelled" && (
            <>
              <Tooltip title="Cập nhật trạng thái">
                <Dropdown
                  overlay={
                    <Menu
                      onClick={({ key }) =>
                        handleQuickStatusChange(record.id, key)
                      }
                    >
                      <Menu.Item key="pending">Chờ xác nhận</Menu.Item>
                      <Menu.Item key="processing">Đang xử lý</Menu.Item>
                      <Menu.Item key="shipped">Đang giao hàng</Menu.Item>
                      <Menu.Item key="delivered">Đã giao hàng</Menu.Item>
                      <Menu.Divider />
                      <Menu.Item key="cancelled" danger>
                        Hủy đơn hàng
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <Button type="dashed" size="small">
                    Trạng thái <DownOutlined />
                  </Button>
                </Dropdown>
              </Tooltip>
              <Tooltip title="Hủy đơn hàng">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => showCancelConfirm(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Xử lý xem chi tiết đơn hàng
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setCurrentStatus(order.status);
    setIsDetailModalVisible(true);
  };

  // Xử lý sửa đơn hàng
  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    updateForm.setFieldsValue({
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingCode: order.trackingCode || "",
      deliveryPartner: order.deliveryPartner || "",
      estimatedDelivery: order.estimatedDelivery
        ? dayjs(order.estimatedDelivery)
        : null,
      notes: order.notes || "",
    });
    setIsUpdateModalVisible(true);
  };

  // Xác nhận hủy đơn hàng
  const showCancelConfirm = (order) => {
    confirm({
      title: "Bạn có chắc chắn muốn hủy đơn hàng này?",
      icon: <ExclamationCircleOutlined />,
      content: `Đơn hàng: ${order.id}`,
      okText: "Hủy đơn",
      okType: "danger",
      cancelText: "Đóng",
      onOk() {
        handleCancelOrder(order.id);
      },
    });
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await orderService.updateOrder(orderId, {
        status: "cancelled",
      });

      if (response.success) {
        message.success(`Đã hủy đơn hàng thành công`);
        fetchOrders(); // Refresh list
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      message.error("Không thể hủy đơn hàng: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý cập nhật trạng thái đơn hàng
  const handleStatusChange = (value) => {
    setCurrentStatus(value);
  };

  // Xử lý lưu thay đổi trạng thái
  const handleSaveStatus = async () => {
    if (selectedOrder && currentStatus !== selectedOrder.status) {
      try {
        setLoading(true);
        const response = await orderService.updateOrder(selectedOrder.id, {
          status: currentStatus,
        });

        if (response.success) {
          message.success(
            `Đã cập nhật trạng thái đơn hàng thành ${statusMap[currentStatus]}`
          );
          fetchOrders(); // Refresh list
          setIsDetailModalVisible(false);
        }
      } catch (error) {
        console.error("Error updating order status:", error);
        message.error(
          "Không thể cập nhật trạng thái đơn hàng: " + error.message
        );
      } finally {
        setLoading(false);
      }
    } else {
      setIsDetailModalVisible(false);
    }
  };

  // Xử lý lưu cập nhật đơn hàng
  const handleSaveUpdate = async () => {
    try {
      const values = await updateForm.validateFields();
      setLoading(true);

      const updateData = {
        status: values.status,
        admin_notes: values.notes,
        delivery_partner: values.deliveryPartner,
        tracking_code: values.trackingCode,
        estimated_delivery_date: values.estimatedDelivery
          ? values.estimatedDelivery.format("YYYY-MM-DD")
          : null,
      };

      const response = await orderService.updateOrder(
        selectedOrder.id,
        updateData
      );

      if (response.success) {
        message.success(`Đã cập nhật thông tin đơn hàng thành công`);
        fetchOrders(); // Refresh list
        setIsUpdateModalVisible(false);
      }
    } catch (error) {
      if (error.errorFields) {
        console.log("Validate Failed:", error);
      } else {
        console.error("Error updating order:", error);
        message.error("Không thể cập nhật đơn hàng: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({
      ...pagination,
      current: 1, // Reset về trang đầu tiên khi tìm kiếm
    });
    // Đặt timeout để tránh gọi API quá nhiều
    setTimeout(() => {
      fetchOrders();
    }, 300);
  };

  // Xử lý lọc
  const handleFilter = (values) => {
    const newFilters = {};

    if (values.status) newFilters.status = values.status;
    if (values.paymentMethod) newFilters.paymentMethod = values.paymentMethod;
    if (values.dateRange && values.dateRange[0] && values.dateRange[1]) {
      newFilters.fromDate = values.dateRange[0].format("YYYY-MM-DD");
      newFilters.toDate = values.dateRange[1].format("YYYY-MM-DD");
    }

    setFilters(newFilters);
    setIsFilterVisible(false);
    setPagination({
      ...pagination,
      current: 1, // Reset về trang đầu tiên khi lọc
    });
  };

  // Reset filter
  const resetFilters = () => {
    filterForm.resetFields();
    setFilters({});
    setIsFilterVisible(false);
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  // Tính toán current step cho Steps component
  const getOrderStep = (status) => {
    switch (status) {
      case "pending":
        return 0;
      case "processing":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      case "cancelled":
        return -1; // Đơn hàng đã hủy
      default:
        return 0;
    }
  };

  // Thêm hàm xử lý thay đổi trạng thái nhanh
  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);

      // Hiển thị xác nhận nếu hủy đơn hàng
      if (newStatus === "cancelled") {
        confirm({
          title: "Bạn có chắc chắn muốn hủy đơn hàng này?",
          icon: <ExclamationCircleOutlined />,
          content: `Đơn hàng: ${orderId}`,
          okText: "Hủy đơn",
          okType: "danger",
          cancelText: "Đóng",
          onOk: async () => {
            await updateOrderStatus(orderId, newStatus);
          },
        });
        setLoading(false);
        return;
      }

      // Hiển thị xác nhận nếu chuyển sang trạng thái đã giao hàng
      if (newStatus === "delivered") {
        confirm({
          title: "Xác nhận đơn hàng đã giao thành công?",
          icon: <CheckCircleOutlined />,
          content: `Đơn hàng: ${orderId}`,
          okText: "Xác nhận",
          okType: "primary",
          cancelText: "Đóng",
          onOk: async () => {
            await updateOrderStatus(orderId, newStatus);
          },
        });
        setLoading(false);
        return;
      }

      // Các trạng thái khác thì cập nhật luôn
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error("Error updating order status:", error);
      message.error("Không thể cập nhật trạng thái đơn hàng: " + error.message);
      setLoading(false);
    }
  };

  // Hàm cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateOrder(orderId, {
        status: newStatus,
      });

      if (response.success) {
        message.success(
          `Đã cập nhật trạng thái đơn hàng thành ${statusMap[newStatus]}`
        );
        fetchOrders(); // Refresh list
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      message.error("Không thể cập nhật trạng thái đơn hàng: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={2}>Quản lý đơn hàng</Title>

        <Space>
          <Input
            placeholder="Tìm kiếm đơn hàng"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <Button
            icon={<FilterOutlined />}
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            Lọc
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchText("");
              resetFilters();
              fetchOrders();
            }}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Filter panel */}
      {isFilterVisible && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={filterForm} layout="horizontal" onFinish={handleFilter}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="status" label="Trạng thái">
                  <Select allowClear placeholder="Chọn trạng thái">
                    {Object.entries(statusMap).map(([key, value]) => (
                      <Option key={key} value={key}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="paymentMethod" label="Phương thức thanh toán">
                  <Select allowClear placeholder="Chọn phương thức">
                    <Option value="COD">COD</Option>
                    <Option value="Banking">Banking</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="dateRange" label="Khoảng thời gian">
                  <RangePicker format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={4} style={{ display: "flex", alignItems: "flex-end" }}>
                <Button type="primary" htmlType="submit">
                  Áp dụng
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={resetFilters}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: pagination.pageSize,
          total: pagination.total,
          current: pagination.current,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đơn hàng`,
          onChange: (page, pageSize) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize,
            });
          },
        }}
      />

      {/* Modal cập nhật đơn hàng */}
      <Modal
        title={
          <div>
            <EditOutlined /> Chỉnh sửa đơn hàng
            <div style={{ fontSize: 14, fontWeight: "normal", marginTop: 5 }}>
              Mã đơn: <Text copyable>{selectedOrder?.id}</Text>
            </div>
          </div>
        }
        open={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        onOk={handleSaveUpdate}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={700}
      >
        {selectedOrder && (
          <Form
            form={updateForm}
            layout="vertical"
            initialValues={{
              status: selectedOrder.status,
              paymentStatus: selectedOrder.paymentStatus,
            }}
          >
            <Card
              title="Thông tin đơn hàng"
              bordered={false}
              className="custom-card"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="Trạng thái đơn hàng"
                    rules={[
                      { required: true, message: "Vui lòng chọn trạng thái!" },
                    ]}
                  >
                    <Select>
                      <Option value="pending">
                        <Tag color={statusColorMap.pending}>Chờ xác nhận</Tag>
                      </Option>
                      <Option value="processing">
                        <Tag color={statusColorMap.processing}>Đang xử lý</Tag>
                      </Option>
                      <Option value="shipped">
                        <Tag color={statusColorMap.shipped}>Đang giao hàng</Tag>
                      </Option>
                      <Option value="delivered">
                        <Tag color={statusColorMap.delivered}>Đã giao hàng</Tag>
                      </Option>
                      <Option value="cancelled">
                        <Tag color={statusColorMap.cancelled}>Đã hủy</Tag>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="paymentStatus"
                    label="Trạng thái thanh toán"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn trạng thái thanh toán!",
                      },
                    ]}
                  >
                    <Select disabled>
                      <Option value="pending">
                        <Tag color={paymentStatusMap.pending.color}>
                          {paymentStatusMap.pending.text}
                        </Tag>
                      </Option>
                      <Option value="paid">
                        <Tag color={paymentStatusMap.paid.color}>
                          {paymentStatusMap.paid.text}
                        </Tag>
                      </Option>
                      <Option value="cancelled">
                        <Tag color={paymentStatusMap.cancelled.color}>
                          {paymentStatusMap.cancelled.text}
                        </Tag>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title="Thông tin vận chuyển"
              bordered={false}
              className="custom-card"
              style={{ marginTop: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="deliveryPartner" label="Đơn vị vận chuyển">
                    <Input placeholder="VD: Giao hàng nhanh, GHTK, ..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="trackingCode" label="Mã vận đơn">
                    <Input placeholder="Nhập mã vận đơn" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="estimatedDelivery" label="Dự kiến giao hàng">
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      placeholder="Chọn ngày"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title="Ghi chú nội bộ"
              bordered={false}
              className="custom-card"
              style={{ marginTop: 16 }}
            >
              <Form.Item name="notes" label="Ghi chú">
                <Input.TextArea
                  rows={3}
                  placeholder="Nhập ghi chú về đơn hàng hoặc vận chuyển"
                />
              </Form.Item>
            </Card>
          </Form>
        )}
      </Modal>

      {/* Modal xem chi tiết đơn hàng */}
      <Modal
        title={`${
          selectedOrder &&
          selectedOrder.status !== "delivered" &&
          selectedOrder.status !== "cancelled"
            ? "Cập nhật"
            : "Chi tiết"
        } đơn hàng: ${selectedOrder?.id?.substring(0, 10)}...`}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedOrder?.status !== "delivered" &&
          selectedOrder?.status !== "cancelled" ? (
            <Button
              key="save"
              type="primary"
              onClick={handleSaveStatus}
              disabled={
                !selectedOrder ||
                currentStatus === selectedOrder.status ||
                currentStatus === "cancelled"
              }
            >
              Cập nhật trạng thái
            </Button>
          ) : null,
          selectedOrder?.status !== "delivered" &&
          selectedOrder?.status !== "cancelled" ? (
            <Button
              key="update"
              onClick={() => {
                setIsDetailModalVisible(false);
                handleEditOrder(selectedOrder);
              }}
            >
              Cập nhật thông tin vận chuyển
            </Button>
          ) : null,
        ].filter(Boolean)}
        width={800}
      >
        {selectedOrder && (
          <div>
            {selectedOrder.status === "cancelled" ? (
              <div style={{ marginBottom: 20 }}>
                <Tag color="red" style={{ padding: "5px 10px", fontSize: 14 }}>
                  Đơn hàng đã bị hủy
                </Tag>
              </div>
            ) : (
              <div style={{ marginBottom: 24 }}>
                <Steps current={getOrderStep(selectedOrder.status)}>
                  <Step
                    title="Xác nhận"
                    icon={<ShoppingOutlined />}
                    description="Chờ xác nhận"
                  />
                  <Step
                    title="Xử lý"
                    icon={<InboxOutlined />}
                    description="Đang xử lý"
                  />
                  <Step
                    title="Vận chuyển"
                    icon={<CarOutlined />}
                    description="Đang giao hàng"
                  />
                  <Step
                    title="Hoàn thành"
                    icon={<CheckCircleOutlined />}
                    description="Đã giao hàng"
                  />
                </Steps>
              </div>
            )}

            <Descriptions
              title="Thông tin đơn hàng"
              bordered
              column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 2, xs: 1 }}
            >
              <Descriptions.Item label="Mã đơn hàng">
                <Text copyable>{selectedOrder.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {new Date(selectedOrder.date).toLocaleString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {selectedOrder.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">
                <Tag
                  color={paymentStatusMap[selectedOrder.paymentStatus].color}
                >
                  {paymentStatusMap[selectedOrder.paymentStatus].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label="Trạng thái đơn hàng"
                span={
                  selectedOrder.status !== "delivered" &&
                  selectedOrder.status !== "cancelled"
                    ? 1
                    : 2
                }
              >
                {selectedOrder.status !== "delivered" &&
                selectedOrder.status !== "cancelled" ? (
                  <Tag color={statusColorMap[selectedOrder.status]}>
                    {statusMap[selectedOrder.status]}
                  </Tag>
                ) : (
                  <Tag color={statusColorMap[selectedOrder.status]}>
                    {statusMap[selectedOrder.status]}
                  </Tag>
                )}
              </Descriptions.Item>
              {selectedOrder.status !== "delivered" &&
                selectedOrder.status !== "cancelled" && (
                  <Descriptions.Item label="Cập nhật trạng thái">
                    <Select
                      style={{ width: 150 }}
                      value={currentStatus}
                      onChange={handleStatusChange}
                    >
                      <Option value="pending">Chờ xác nhận</Option>
                      <Option value="processing">Đang xử lý</Option>
                      <Option value="shipped">Đang giao hàng</Option>
                      <Option value="delivered">Đã giao hàng</Option>
                      <Option value="cancelled">Đã hủy</Option>
                    </Select>
                  </Descriptions.Item>
                )}
              <Descriptions.Item label="Tổng tiền" span={3}>
                <Text strong style={{ fontSize: 16, color: "#ff4d4f" }}>
                  ${selectedOrder.total.toLocaleString("en-US")}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions
              title="Thông tin khách hàng"
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="Họ tên">
                {selectedOrder.customer.name}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.customer.phone}
              </Descriptions.Item>
              {selectedOrder.customer.email !== "N/A" && (
                <Descriptions.Item label="Email">
                  {selectedOrder.customer.email}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Địa chỉ" span={2}>
                {selectedOrder.address}
              </Descriptions.Item>
              {selectedOrder.note && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedOrder.note}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Thêm phần thông tin vận chuyển */}
            {(selectedOrder.status === "shipped" ||
              selectedOrder.status === "delivered" ||
              selectedOrder.deliveryPartner ||
              selectedOrder.trackingCode ||
              selectedOrder.estimatedDelivery) && (
              <>
                <Divider />
                <Descriptions
                  title="Thông tin vận chuyển"
                  bordered
                  column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                >
                  {selectedOrder.deliveryPartner && (
                    <Descriptions.Item label="Đơn vị vận chuyển">
                      {selectedOrder.deliveryPartner}
                    </Descriptions.Item>
                  )}
                  {selectedOrder.trackingCode && (
                    <Descriptions.Item label="Mã vận đơn">
                      <Text copyable>{selectedOrder.trackingCode}</Text>
                    </Descriptions.Item>
                  )}
                  {selectedOrder.estimatedDelivery && (
                    <Descriptions.Item label="Dự kiến giao hàng">
                      {moment(selectedOrder.estimatedDelivery).format(
                        "DD/MM/YYYY"
                      )}
                    </Descriptions.Item>
                  )}
                  {selectedOrder.notes && (
                    <Descriptions.Item label="Ghi chú nội bộ" span={2}>
                      {selectedOrder.notes}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}

            <Divider />

            <Title level={5}>Sản phẩm đã đặt</Title>
            <div style={{ marginTop: 16 }}>
              {selectedOrder.items.map((item, index) => (
                <Card
                  key={index}
                  style={{ marginBottom: 16 }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <Text strong>{item.name}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary">
                          {item.size && `Size: ${item.size}`}
                          {item.color && (
                            <span
                              style={{ marginLeft: item.size ? "8px" : "0" }}
                            >
                              | Màu:{" "}
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor: getColorHexValue(
                                      item.color
                                    ),
                                    marginRight: "6px",
                                    border: "1px solid #d9d9d9",
                                    borderRadius: "2px",
                                  }}
                                />
                                {item.color}
                              </span>
                            </span>
                          )}
                        </Text>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Text>SL: {item.quantity}</Text>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text>${item.price.toLocaleString("en-US")}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Text strong style={{ color: "#ff4d4f" }}>
                          $
                          {(item.price * item.quantity).toLocaleString("en-US")}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersManagement;
