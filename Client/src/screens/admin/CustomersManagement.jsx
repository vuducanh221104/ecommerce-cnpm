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
  Tabs,
  Avatar,
  Descriptions,
  Card,
  Divider,
  Form,
  Select,
  DatePicker,
  Row,
  Col,
  List,
  Tooltip,
  Spin,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { getColorHexValue } from "../../utils/constants";

// Import services
import * as userService from "../../services/userService";
import * as orderService from "../../services/orderService";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * CustomersManagement - Trang quản lý khách hàng
 *
 * Các chức năng chính:
 * - Hiển thị danh sách khách hàng với phân trang và tìm kiếm
 * - Xem chi tiết thông tin khách hàng
 * - Chỉnh sửa thông tin khách hàng
 * - Xem lịch sử đơn hàng của khách hàng
 */
const CustomersManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerOrderCounts, setCustomerOrderCounts] = useState({});
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [isOrderDetailModalVisible, setIsOrderDetailModalVisible] =
    useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State quản lý danh sách khách hàng và phân trang
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState("");

  // Effect hooks
  useEffect(() => {
    fetchCustomers();
  }, [pagination.current, pagination.pageSize, filters, searchText]);

  // Lấy danh sách khách hàng từ API và đồng thời lấy số lượng đơn hàng của mỗi khách hàng
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers(
        pagination.current,
        pagination.pageSize,
        { ...filters, search: searchText, role: "user" }
      );

      console.log("Fetch customers response:", response);

      if (response.success) {
        // Format data từ API
        const formattedCustomers = response.users.map((user) => ({
          key: user._id,
          id: user._id,
          name: user.full_name || user.user_name || "N/A", // Ưu tiên full_name, sau đó là user_name
          email: user.email || "N/A",
          phone: user.phone_number || "N/A",
          gender: user.gender || "other",
          birthdate: user.date_of_birth,
          registrationDate: user.created_at,
          // Chuyển đổi status từ 1/0 thành active/inactive
          status: user.status === 1 ? "active" : "inactive",
          address: formatAddress(user.address),
          avatar: user.avatar,
          role: user.role,
          orderCount: customerOrderCounts[user._id] || 0,
        }));

        console.log("Formatted customers:", formattedCustomers);
        setCustomers(formattedCustomers);
        setPagination({
          ...pagination,
          total: response.pagination.total,
        });

        // Lấy số lượng đơn hàng cho các khách hàng mới nếu chưa có
        fetchOrderCountsForNewCustomers(formattedCustomers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  // Lấy số lượng đơn hàng cho các khách hàng mới
  const fetchOrderCountsForNewCustomers = async (customers) => {
    // Lọc ra những khách hàng chưa có thông tin số đơn hàng
    const newCustomerIds = customers
      .filter((customer) => customerOrderCounts[customer.id] === undefined)
      .map((customer) => customer.id);

    if (newCustomerIds.length === 0) return;

    // Giới hạn số lượng API calls song song để tránh quá tải server
    const batchSize = 5;
    const batches = [];

    // Chia thành các batch nhỏ
    for (let i = 0; i < newCustomerIds.length; i += batchSize) {
      batches.push(newCustomerIds.slice(i, i + batchSize));
    }

    try {
      const updatedCounts = { ...customerOrderCounts };

      // Xử lý từng batch
      for (const batch of batches) {
        await Promise.all(
          batch.map(async (customerId) => {
            try {
              const response = await orderService.getUserOrders(customerId);
              if (response.success) {
                updatedCounts[customerId] = response.orders.length;
              }
            } catch (error) {
              console.error(
                `Error fetching orders for customer ${customerId}:`,
                error
              );
              updatedCounts[customerId] = 0;
            }
          })
        );
      }

      setCustomerOrderCounts(updatedCounts);

      // Cập nhật lại danh sách customers với số đơn hàng mới
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) => ({
          ...customer,
          orderCount:
            updatedCounts[customer.id] !== undefined
              ? updatedCounts[customer.id]
              : customer.orderCount || 0,
        }))
      );
    } catch (error) {
      console.error("Error fetching order counts:", error);
    }
  };

  // Lấy lịch sử đơn hàng của khách hàng
  const fetchCustomerOrders = async (customerId) => {
    try {
      setLoadingOrders(true);
      const response = await orderService.getUserOrders(customerId);

      if (response.success) {
        // Format data từ API
        const formattedOrders = response.orders.map((order) => ({
          id: order._id,
          date: order.created_at,
          total: order.total_amount,
          status: order.status,
          customer_email: order.customer_email || response.user_email || "N/A",
          products: order.products,
        }));

        setCustomerOrders(formattedOrders);

        // Cập nhật số lượng đơn hàng trong state
        setCustomerOrderCounts((prev) => ({
          ...prev,
          [customerId]: formattedOrders.length,
        }));

        // Kiểm tra xem cần cập nhật thông tin email trong danh sách khách hàng không
        if (response.user_email && selectedCustomer) {
          const updatedCustomer = { ...selectedCustomer };
          if (updatedCustomer.email === "N/A" && response.user_email) {
            updatedCustomer.email = response.user_email;
            setSelectedCustomer(updatedCustomer);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      message.error("Không thể tải lịch sử đơn hàng");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Format địa chỉ từ object
  const formatAddress = (addressObj) => {
    if (!addressObj) return "N/A";

    console.log("Formatting address:", addressObj);

    // Lọc ra các phần tử có giá trị và kết hợp thành chuỗi
    const parts = [];

    if (addressObj.street) parts.push(addressObj.street);
    if (addressObj.ward) parts.push(addressObj.ward);
    if (addressObj.district) parts.push(addressObj.district);
    if (addressObj.city) parts.push(addressObj.city);
    if (addressObj.country) parts.push(addressObj.country);

    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  // Cấu hình cột cho bảng khách hàng
  const columns = [
    {
      title: "Mã KH",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => <Tooltip title={id}>{id.substring(0, 8)}...</Tooltip>,
    },
    {
      title: "Khách hàng",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (name, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          {name}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "registrationDate",
      key: "registrationDate",
      width: 150,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
      sorter: (a, b) => {
        if (!a.registrationDate) return -1;
        if (!b.registrationDate) return 1;
        return new Date(a.registrationDate) - new Date(b.registrationDate);
      },
    },
    {
      title: "Đơn hàng",
      dataIndex: "orderCount",
      key: "orderCount",
      width: 120,
      render: (orderCount, record) => (
        <Tag color="blue">
          <ShoppingOutlined /> {orderCount || 0}{" "}
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record, "2")}
          >
            Xem
          </Button>
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "green";
        let text = "Hoạt động";

        if (status === "inactive") {
          color = "red";
          text = "Không hoạt động";
        }

        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Không hoạt động", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
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
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
        </Space>
      ),
    },
  ];

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({
      ...pagination,
      current: 1, // Reset về trang đầu tiên khi tìm kiếm
    });
  };

  // Xử lý lọc
  const handleFilter = (values) => {
    const newFilters = {};

    if (values.status) newFilters.status = values.status;
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

  // Xử lý xem chi tiết khách hàng
  const handleViewDetail = async (customer, tab = "1") => {
    setSelectedCustomer(customer);
    setActiveTab(tab);
    setIsDetailModalVisible(true);

    // Lấy lịch sử đơn hàng của khách hàng
    await fetchCustomerOrders(customer.id);
  };

  // Xử lý chỉnh sửa khách hàng
  const handleEdit = (customer) => {
    console.log("Customer to edit:", customer);
    setSelectedCustomer(customer);

    // Điều chỉnh dữ liệu cho phù hợp với form
    const formValues = {
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone !== "N/A" ? customer.phone : "",
      gender: customer.gender || "other",
      birthdate: customer.birthdate ? dayjs(customer.birthdate) : null,
      address: customer.address !== "N/A" ? customer.address : "",
      status: customer.status || "active",
    };

    console.log("Setting form values:", formValues);
    form.setFieldsValue(formValues);
    setIsEditModalVisible(true);
  };

  // Xử lý submit form chỉnh sửa
  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      console.log("Form values:", values); // Log để debug

      // Xử lý address từ string thành object
      let addressObj = {};
      if (values.address && values.address !== "N/A") {
        // Phương pháp đơn giản: lấy thông tin chi tiết từ địa chỉ dạng chuỗi
        const addressParts = values.address.split(", ");

        if (addressParts.length >= 5) {
          addressObj = {
            street: addressParts[0],
            ward: addressParts[1],
            district: addressParts[2],
            city: addressParts[3],
            country: addressParts[4],
          };
        } else if (addressParts.length === 4) {
          addressObj = {
            street: addressParts[0],
            ward: addressParts[1],
            district: addressParts[2],
            city: addressParts[3],
            country: "Việt Nam", // Default country
          };
        } else if (addressParts.length === 3) {
          addressObj = {
            street: addressParts[0],
            district: addressParts[1],
            city: addressParts[2],
            country: "Việt Nam", // Default country
          };
        } else {
          // Nếu không thể phân tích theo định dạng chuẩn
          addressObj = {
            street: values.address,
            country: "Việt Nam", // Default country
          };
        }
      }

      console.log("Processed address:", addressObj); // Log để debug

      // Chuẩn bị dữ liệu gửi lên API
      const userData = {
        full_name: values.name,
        phone_number: values.phone,
        gender: values.gender,
        address: addressObj,
        // Chuyển trạng thái từ active/inactive sang giá trị 1/0 theo yêu cầu của API
        status: values.status === "active" ? 1 : 0,
      };

      if (values.birthdate) {
        userData.date_of_birth = values.birthdate.format("YYYY-MM-DD");
      }

      console.log("Data to send:", userData); // Log để debug
      console.log("User ID:", selectedCustomer.id); // Log để debug

      // Gọi API cập nhật thông tin
      const response = await userService.updateUser(
        selectedCustomer.id,
        userData
      );

      if (response.success) {
        message.success(`Đã cập nhật thông tin khách hàng ${values.name}`);
        setIsEditModalVisible(false);
        fetchCustomers(); // Refresh danh sách khách hàng
      } else {
        message.error(
          `Không thể cập nhật: ${response.message || "Lỗi không xác định"}`
        );
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Vui lòng kiểm tra lại thông tin nhập");
        console.log("Validate Failed:", error);
      } else {
        console.error("Error updating customer:", error);
        message.error(
          "Không thể cập nhật thông tin khách hàng: " +
            (error.message || "Lỗi không xác định")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Xác nhận khóa/mở khóa tài khoản
  const showToggleStatusConfirm = (customer) => {
    const isActive = customer.status === "active";
    const action = isActive ? "khóa" : "kích hoạt";

    confirm({
      title: `Bạn có chắc chắn muốn ${action} tài khoản này?`,
      icon: <ExclamationCircleOutlined />,
      content: `Khách hàng: ${customer.name}`,
      okText: isActive ? "Khóa" : "Kích hoạt",
      okType: isActive ? "danger" : "primary",
      cancelText: "Hủy",
      onOk() {
        handleToggleStatus(customer, !isActive);
      },
    });
  };

  // Xử lý khóa/mở khóa tài khoản
  const handleToggleStatus = async (customer, isActive) => {
    try {
      setLoading(true);

      // Gọi API thay đổi trạng thái
      const response = await userService.changeUserStatus(
        customer.id,
        isActive
      );

      if (response.success) {
        message.success(
          isActive
            ? `Đã kích hoạt tài khoản của khách hàng "${customer.name}"`
            : `Đã khóa tài khoản của khách hàng "${customer.name}"`
        );
        setIsDetailModalVisible(false);
        fetchCustomers(); // Refresh danh sách khách hàng
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      message.error(
        "Không thể thay đổi trạng thái tài khoản: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Status map for orders
  const orderStatusMap = {
    pending: { text: "Chờ xác nhận", color: "blue" },
    processing: { text: "Đang xử lý", color: "orange" },
    shipped: { text: "Đang giao hàng", color: "purple" },
    delivered: { text: "Hoàn thành", color: "green" },
    cancelled: { text: "Đã hủy", color: "red" },
  };

  // Handler for tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Xử lý chuyển đến trang chi tiết đơn hàng
  const goToOrderDetail = (orderId) => {
    // Find the order in customerOrders
    const order = customerOrders.find((order) => order.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsDetailModalVisible(false); // Close customer details modal
      setIsOrderDetailModalVisible(true);
    } else {
      message.error("Không tìm thấy thông tin đơn hàng");
    }
  };

  // Helper function to calculate product total price
  const calculateProductTotal = (product) => {
    const price =
      typeof product.price === "object" && product.price.original
        ? product.price.original
        : typeof product.price === "number"
        ? product.price
        : 0;

    return price * product.quantity;
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
        <Title level={2}>Quản lý khách hàng</Title>

        <Space>
          <Input
            placeholder="Tìm kiếm khách hàng"
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
              fetchCustomers();
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
              <Col span={8}>
                <Form.Item name="status" label="Trạng thái">
                  <Select allowClear placeholder="Chọn trạng thái">
                    <Option value="active">Hoạt động</Option>
                    <Option value="inactive">Không hoạt động</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dateRange" label="Ngày đăng ký">
                  <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
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
        dataSource={customers}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: pagination.pageSize,
          total: pagination.total,
          current: pagination.current,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} khách hàng`,
          onChange: (page, pageSize) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize,
            });
          },
        }}
      />

      {/* Modal xem chi tiết khách hàng */}
      <Modal
        title="Chi tiết khách hàng"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsDetailModalVisible(false);
              handleEdit(selectedCustomer);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={800}
      >
        {selectedCustomer && (
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Thông tin cá nhân
                </span>
              }
              key="1"
            >
              <div style={{ marginBottom: 20 }}>
                <Card bordered={false}>
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        src={selectedCustomer.avatar}
                        style={{ marginRight: 16 }}
                      />
                      <div>
                        <Title level={4} style={{ margin: 0 }}>
                          {selectedCustomer.name}
                        </Title>
                        <Text type="secondary" copyable>
                          Mã KH: {selectedCustomer.id}
                        </Text>
                        <div>
                          <Tag
                            color={
                              selectedCustomer.status === "active"
                                ? "green"
                                : "red"
                            }
                          >
                            {selectedCustomer.status === "active"
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </Tag>
                          {selectedCustomer.role === "admin" && (
                            <Tag color="gold">Admin</Tag>
                          )}
                        </div>
                      </div>
                    </div>

                    <Descriptions
                      bordered
                      column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                    >
                      <Descriptions.Item label="Email">
                        <Space>
                          <MailOutlined />
                          {selectedCustomer.email}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Số điện thoại">
                        <Space>
                          <PhoneOutlined />
                          {selectedCustomer.phone}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Giới tính">
                        {selectedCustomer.gender === "male"
                          ? "Nam"
                          : selectedCustomer.gender === "female"
                          ? "Nữ"
                          : "Khác"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày sinh">
                        {selectedCustomer.birthdate
                          ? dayjs(selectedCustomer.birthdate).format(
                              "DD/MM/YYYY"
                            )
                          : "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ" span={2}>
                        <Space>
                          <EnvironmentOutlined />
                          {selectedCustomer.address}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày đăng ký">
                        <Space>
                          <ClockCircleOutlined />
                          {dayjs(selectedCustomer.registrationDate).format(
                            "DD/MM/YYYY"
                          )}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tổng đơn hàng">
                        <Space>
                          <ShoppingOutlined />
                          {customerOrders.length} đơn hàng
                          {customerOrders.length > 0 && (
                            <Button
                              type="link"
                              size="small"
                              onClick={() => setActiveTab("2")}
                              style={{ padding: 0 }}
                            >
                              Xem
                            </Button>
                          )}
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>
                  </Space>
                </Card>
              </div>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <ShoppingOutlined />
                  Lịch sử đơn hàng ({customerOrders.length})
                </span>
              }
              key="2"
            >
              {loadingOrders ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Spin tip="Đang tải..." />
                </div>
              ) : customerOrders.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={customerOrders}
                  renderItem={(order) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          key="view-order"
                          onClick={() => {
                            goToOrderDetail(order.id);
                          }}
                        >
                          Xem chi tiết
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={<ShoppingOutlined />}
                            style={{ backgroundColor: "#1890ff" }}
                          />
                        }
                        title={
                          <Space>
                            <span>{order.id}</span>
                            <Tag
                              color={
                                orderStatusMap[order.status]?.color || "default"
                              }
                            >
                              {orderStatusMap[order.status]?.text ||
                                order.status}
                            </Tag>
                          </Space>
                        }
                        description={
                          <>
                            <div>
                              Ngày đặt:{" "}
                              {dayjs(order.date).format("DD/MM/YYYY HH:mm")}
                            </div>
                            <div>
                              <Text strong>
                                Tổng tiền: $
                                {order.total.toLocaleString("en-US")}
                              </Text>
                            </div>
                            {order.customer_email && (
                              <div>
                                <MailOutlined style={{ marginRight: 5 }} />
                                {order.customer_email}
                              </div>
                            )}
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Text type="secondary">Khách hàng chưa có đơn hàng nào.</Text>
                </div>
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* Modal chỉnh sửa khách hàng */}
      <Modal
        title={
          <div>
            <EditOutlined /> Chỉnh sửa thông tin khách hàng
            <div style={{ fontSize: 14, fontWeight: "normal", marginTop: 5 }}>
              {selectedCustomer && `Mã KH: ${selectedCustomer.id}`}
            </div>
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleSaveEdit}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: "active",
            gender: "other",
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Họ tên"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Họ tên" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính">
                <Select>
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="birthdate" label="Ngày sinh">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={3} placeholder="Địa chỉ" />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết đơn hàng */}
      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.id?.substring(0, 10)}...`}
        open={isOrderDetailModalVisible}
        onCancel={() => setIsOrderDetailModalVisible(false)}
        footer={[
          <Button
            key="back"
            onClick={() => setIsOrderDetailModalVisible(false)}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Card title="Thông tin đơn hàng" style={{ marginBottom: 16 }}>
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              >
                <Descriptions.Item label="Mã đơn hàng">
                  <Text copyable>{selectedOrder.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">
                  {dayjs(selectedOrder.date).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag
                    color={
                      orderStatusMap[selectedOrder.status]?.color || "default"
                    }
                  >
                    {orderStatusMap[selectedOrder.status]?.text ||
                      selectedOrder.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                  <Text strong>
                    ${selectedOrder.total.toLocaleString("en-US")}
                  </Text>
                </Descriptions.Item>
                {selectedOrder.customer_email && (
                  <Descriptions.Item label="Email khách hàng" span={2}>
                    <MailOutlined style={{ marginRight: 5 }} />
                    {selectedOrder.customer_email}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card title="Sản phẩm" style={{ marginBottom: 16 }}>
              {selectedOrder.products &&
                selectedOrder.products.map((product, index) => (
                  <Card.Grid
                    key={index}
                    style={{ width: "100%", padding: "12px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <Text strong>{product.name}</Text>
                        <div>
                          <Text type="secondary">
                            {product.size && `Size: ${product.size}`}
                            {product.color && (
                              <span
                                style={{
                                  marginLeft: product.size ? "8px" : "0",
                                }}
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
                                        product.color
                                      ),
                                      marginRight: "6px",
                                      border: "1px solid #d9d9d9",
                                      borderRadius: "2px",
                                    }}
                                  />
                                  {product.color}
                                </span>
                              </span>
                            )}
                          </Text>
                        </div>
                        <div>
                          <Text>SL: {product.quantity}</Text>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <Text>
                          $
                          {typeof product.price === "object" &&
                          product.price.original
                            ? product.price.original.toLocaleString("en-US")
                            : typeof product.price === "number"
                            ? product.price.toLocaleString("en-US")
                            : "N/A"}
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          <Text strong style={{ color: "#ff4d4f" }}>
                            $
                            {calculateProductTotal(product).toLocaleString(
                              "en-US"
                            )}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card.Grid>
                ))}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersManagement;
