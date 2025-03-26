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
  Form,
  Select,
  Tooltip,
  Popconfirm,
  Avatar,
  Card,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import * as userService from "../../services/userService";
import dayjs from "dayjs";
import {
  isAdmin,
  getRoleName,
  ROLE_MANAGER,
  ROLE_ADMIN,
} from "../../utils/roleUtils";
import { getCurrentUser } from "../../services/authService";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

/**
 * AdminsManagement - Trang quản lý danh sách Admin và Manager
 *
 * Chức năng:
 * - Hiển thị danh sách admin và manager
 * - Thêm admin/manager mới
 * - Chỉnh sửa thông tin admin/manager
 * - Xóa admin/manager (hạ cấp xuống tài khoản thường)
 */
const AdminsManagement = () => {
  // State
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({}); // Lọc tất cả người dùng có quyền quản lý
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [currentUser, setCurrentUser] = useState(null);

  // Lấy thông tin user hiện tại để kiểm tra quyền
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Effect hooks
  useEffect(() => {
    fetchAdmins();
  }, [pagination.current, pagination.pageSize, filters, searchText]);

  // Fetch danh sách admin từ API
  const fetchAdmins = async () => {
    try {
      setLoading(true);

      // Tạo query parameters
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      // Thêm từ khóa tìm kiếm nếu có
      if (searchText) {
        queryParams.search = searchText;
      }

      const response = await userService.getAllUsers(
        queryParams.page,
        queryParams.limit,
        queryParams
      );

      if (response.success) {
        // Lọc chỉ lấy user có quyền quản lý trở lên (role >= 1)
        const adminUsers = response.users.filter(
          (user) => user.role >= ROLE_MANAGER
        );

        // Format dữ liệu cho table
        const formattedUsers = adminUsers.map((user) => ({
          id: user._id,
          user_name: user.user_name,
          email: user.email,
          phone_number: user.phone_number || "Chưa cập nhật",
          full_name: user.full_name || user.user_name,
          role: user.role,
          status: user.status === 1 ? "active" : "inactive",
          created_at: user.created_at
            ? dayjs(user.created_at).format("DD/MM/YYYY")
            : "N/A",
        }));

        setAdmins(formattedUsers);
        setPagination({
          ...pagination,
          total: adminUsers.length,
        });
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      message.error("Không thể tải danh sách quản trị viên!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  // Reset bộ lọc
  const resetFilters = () => {
    filterForm.resetFields();
    setFilters({});
    setPagination({ ...pagination, current: 1 });
  };

  // Xử lý lọc dữ liệu
  const handleFilter = (values) => {
    setFilters(values);
    setPagination({ ...pagination, current: 1 });
  };

  // Mở modal thêm admin
  const showAddModal = () => {
    form.resetFields();
    form.setFieldsValue({
      role: ROLE_MANAGER,
      status: "active",
    });
    setIsAddModalVisible(true);
  };

  // Mở modal chỉnh sửa admin
  const showEditModal = (admin) => {
    setSelectedAdmin(admin);
    form.setFieldsValue({
      full_name: admin.full_name,
      email: admin.email,
      phone_number:
        admin.phone_number !== "Chưa cập nhật" ? admin.phone_number : "",
      role: admin.role,
      status: admin.status,
    });
    setIsEditModalVisible(true);
  };

  // Xử lý thêm admin mới
  const handleAddAdmin = async (values) => {
    try {
      setLoading(true);

      // Tạo dữ liệu gửi lên API
      const userData = {
        ...values,
        role: parseInt(values.role),
        status: values.status === "active" ? 1 : 0,
      };

      // Gọi API tạo admin mới
      const response = await userService.createUser(userData);

      if (response.success) {
        message.success("Thêm quản trị viên mới thành công!");
        setIsAddModalVisible(false);
        form.resetFields();
        fetchAdmins();
      } else {
        message.error(response.message || "Thêm quản trị viên thất bại!");
      }
    } catch (error) {
      console.error("Add admin error:", error);
      message.error(error.message || "Thêm quản trị viên thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý cập nhật thông tin admin
  const handleUpdateAdmin = async (values) => {
    try {
      if (!selectedAdmin) return;

      setLoading(true);

      // Tạo dữ liệu gửi lên API
      const userData = {
        ...values,
        role: parseInt(values.role),
        status: values.status === "active" ? 1 : 0,
      };

      // Gọi API cập nhật thông tin admin
      const response = await userService.updateUser(selectedAdmin.id, userData);

      if (response.success) {
        message.success("Cập nhật thông tin quản trị viên thành công!");
        setIsEditModalVisible(false);
        fetchAdmins();
      } else {
        message.error(response.message || "Cập nhật quản trị viên thất bại!");
      }
    } catch (error) {
      console.error("Update admin error:", error);
      message.error(error.message || "Cập nhật quản trị viên thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Hạ cấp admin xuống user thường
  const demoteToUser = (admin) => {
    confirm({
      title: "Xác nhận hạ cấp quản trị viên",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn hạ cấp "${admin.full_name}" xuống tài khoản thường không?`,
      onOk: async () => {
        try {
          setLoading(true);

          // Hạ cấp admin xuống role 0 (user thường)
          const response = await userService.updateUser(admin.id, { role: 0 });

          if (response.success) {
            message.success(
              `Đã hạ cấp ${admin.full_name} xuống tài khoản thường!`
            );
            fetchAdmins();
          } else {
            message.error(response.message || "Hạ cấp quản trị viên thất bại!");
          }
        } catch (error) {
          console.error("Demote admin error:", error);
          message.error(error.message || "Hạ cấp quản trị viên thất bại!");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Thay đổi trạng thái admin (khóa/mở khóa)
  const handleToggleStatus = async (admin) => {
    try {
      const newStatus = admin.status === "active" ? 0 : 1;
      const response = await userService.changeUserStatus(admin.id, newStatus);

      if (response.success) {
        message.success(
          `Đã ${
            newStatus === 1 ? "mở khóa" : "khóa"
          } tài khoản quản trị viên thành công!`
        );
        fetchAdmins();
      } else {
        message.error(response.message || "Thay đổi trạng thái thất bại!");
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      message.error(error.message || "Thay đổi trạng thái thất bại!");
    }
  };

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text copyable>{text.substring(0, 6)}...</Text>
        </Tooltip>
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      key: "full_name",
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          {text}
        </Space>
      ),
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "user_name",
      key: "user_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Phân quyền",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const roleName = getRoleName(role);
        const color = role === ROLE_ADMIN ? "gold" : "blue";
        return <Tag color={color}>{roleName}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_, record) => {
        // Kiểm tra nếu người dùng hiện tại không phải là admin
        // và đang cố gắng chỉnh sửa một admin khác, thì không cho phép
        const canEdit =
          currentUser?.role === ROLE_ADMIN ||
          (currentUser?.role === ROLE_MANAGER && record.role !== ROLE_ADMIN);

        // Admin không thể bị xóa/hạ cấp bởi Manager
        const canDelete =
          currentUser?.role === ROLE_ADMIN ||
          (currentUser?.role === ROLE_MANAGER && record.role !== ROLE_ADMIN);

        // Self check - không thể tự khóa/xóa chính mình
        const isSelf =
          currentUser?.id === record.id || currentUser?._id === record.id;

        return (
          <Space size="small">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showEditModal(record)}
              disabled={!canEdit || isSelf}
            >
              Sửa
            </Button>

            {/* Nút khóa/mở khóa tài khoản */}
            <Popconfirm
              title={`${
                record.status === "active" ? "Khóa" : "Mở khóa"
              } tài khoản này?`}
              onConfirm={() => handleToggleStatus(record)}
              disabled={
                isSelf ||
                (record.role === ROLE_ADMIN && currentUser?.role !== ROLE_ADMIN)
              }
            >
              <Button
                type={record.status === "active" ? "default" : "primary"}
                icon={<LockOutlined />}
                size="small"
                danger={record.status === "active"}
                disabled={
                  isSelf ||
                  (record.role === ROLE_ADMIN &&
                    currentUser?.role !== ROLE_ADMIN)
                }
              >
                {record.status === "active" ? "Khóa" : "Mở khóa"}
              </Button>
            </Popconfirm>

            {/* Nút hạ cấp xuống user thường */}
            <Popconfirm
              title="Hạ cấp xuống tài khoản thường?"
              onConfirm={() => demoteToUser(record)}
              disabled={!canDelete || isSelf}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                disabled={!canDelete || isSelf}
              >
                Hạ cấp
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={2}>Quản lý Quản trị viên</Title>

        <Space>
          <Input
            placeholder="Tìm kiếm quản trị viên"
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
              fetchAdmins();
            }}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            disabled={currentUser?.role < ROLE_ADMIN} // Chỉ Admin mới có quyền thêm
          >
            Thêm mới
          </Button>
        </Space>
      </div>

      {/* Filter panel */}
      {isFilterVisible && (
        <Card style={{ marginBottom: 16 }}>
          <Form form={filterForm} layout="horizontal" onFinish={handleFilter}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="role" label="Phân quyền">
                  <Select allowClear placeholder="Chọn phân quyền">
                    <Option value={ROLE_MANAGER}>Quản lý</Option>
                    <Option value={ROLE_ADMIN}>Admin</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="status" label="Trạng thái">
                  <Select allowClear placeholder="Chọn trạng thái">
                    <Option value="active">Hoạt động</Option>
                    <Option value="inactive">Không hoạt động</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8} style={{ display: "flex", alignItems: "flex-end" }}>
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

      {/* Bảng danh sách admin */}
      <Table
        columns={columns}
        dataSource={admins}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: pagination.pageSize,
          total: pagination.total,
          current: pagination.current,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} quản trị viên`,
          onChange: (page, pageSize) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize,
            });
          },
        }}
      />

      {/* Modal thêm admin mới */}
      <Modal
        title="Thêm Quản trị viên mới"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsAddModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            Thêm
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="add_admin_form"
          onFinish={handleAddAdmin}
          initialValues={{
            role: ROLE_MANAGER,
            status: "active",
          }}
        >
          <Form.Item
            name="full_name"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ tên" />
          </Form.Item>

          <Form.Item
            name="user_name"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item name="phone_number" label="Số điện thoại">
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Phân quyền"
                rules={[
                  { required: true, message: "Vui lòng chọn phân quyền!" },
                ]}
              >
                <Select>
                  <Option value={ROLE_MANAGER}>
                    {getRoleName(ROLE_MANAGER)}
                  </Option>
                  {currentUser?.role === ROLE_ADMIN && (
                    <Option value={ROLE_ADMIN}>
                      {getRoleName(ROLE_ADMIN)}
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select>
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Không hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa admin */}
      <Modal
        title={`Chỉnh sửa thông tin: ${selectedAdmin?.full_name || ""}`}
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsEditModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="edit_admin_form"
          onFinish={handleUpdateAdmin}
        >
          <Form.Item
            name="full_name"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ tên" />
          </Form.Item>

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

          <Form.Item name="phone_number" label="Số điện thoại">
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Phân quyền"
                rules={[
                  { required: true, message: "Vui lòng chọn phân quyền!" },
                ]}
              >
                <Select
                  disabled={
                    currentUser?.role !== ROLE_ADMIN ||
                    selectedAdmin?.id === currentUser?.id ||
                    selectedAdmin?.id === currentUser?._id
                  }
                >
                  <Option value={ROLE_MANAGER}>
                    {getRoleName(ROLE_MANAGER)}
                  </Option>
                  {currentUser?.role === ROLE_ADMIN && (
                    <Option value={ROLE_ADMIN}>
                      {getRoleName(ROLE_ADMIN)}
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select
                  disabled={
                    selectedAdmin?.id === currentUser?.id ||
                    selectedAdmin?.id === currentUser?._id ||
                    (selectedAdmin?.role === ROLE_ADMIN &&
                      currentUser?.role !== ROLE_ADMIN)
                  }
                >
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Không hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminsManagement;
