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
  Rate,
  Avatar,
  Tooltip,
  Divider,
  List,
  Select,
  Card,
  Form,
  Row,
  Col,
  DatePicker,
  Spin,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  FilterOutlined,
  ReloadOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

// Import services
import * as productService from "../../services/productService";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * ProductCommentsManagement - Trang quản lý bình luận sản phẩm
 *
 * Các chức năng chính:
 * - Hiển thị danh sách bình luận của tất cả sản phẩm với phân trang và tìm kiếm
 * - Xem chi tiết bình luận và các phản hồi
 * - Xóa bình luận
 */
const ProductCommentsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState("");
  const [filterForm] = Form.useForm();
  const [products, setProducts] = useState([]);

  // Effect hooks
  useEffect(() => {
    fetchComments();
    fetchProducts();
  }, [pagination.current, pagination.pageSize, filters, searchText]);

  // Fetch list of products for filter dropdown
  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts(1, 100); // Get up to 100 products for dropdown
      if (response.success) {
        setProducts(response.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Fetch comments from API
  const fetchComments = async () => {
    try {
      setLoading(true);

      const response = await productService.getAllProductComments(
        pagination.current,
        pagination.pageSize,
        { ...filters, search: searchText }
      );

      if (response.success) {
        // Format data from API
        const formattedComments = response.comments.map((comment) => {
          // Đảm bảo productId là đúng định dạng
          const productId = comment.product_id
            ? comment.product_id.toString()
            : null;

          if (!productId) {
            console.warn("Comment missing product_id:", comment);
          }

          return {
            key: comment._id,
            id: comment._id,
            userName: comment.user_name,
            userId: comment.user_id,
            productId: productId,
            productName: comment.product_name,
            content: comment.content,
            rating: comment.rating,
            createdAt: comment.created_at,
            status: comment.status || "pending", // Default to pending if status not provided
            replies: comment.replies || [],
            avatar: comment.avatar,
          };
        });

        console.log("Loaded comments:", formattedComments.length);
        setComments(formattedComments);
        setPagination({
          ...pagination,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      message.error("Không thể tải danh sách bình luận");
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({
      ...pagination,
      current: 1, // Reset to first page when searching
    });
  };

  // Filter handler
  const handleFilter = (values) => {
    const newFilters = {};

    if (values.productId) newFilters.productId = values.productId;
    if (values.rating) newFilters.rating = values.rating;
    if (values.dateRange && values.dateRange[0] && values.dateRange[1]) {
      newFilters.fromDate = values.dateRange[0].format("YYYY-MM-DD");
      newFilters.toDate = values.dateRange[1].format("YYYY-MM-DD");
    }

    setFilters(newFilters);
    setIsFilterVisible(false);
    setPagination({
      ...pagination,
      current: 1, // Reset to first page when filtering
    });
  };

  // Reset filters
  const resetFilters = () => {
    filterForm.resetFields();
    setFilters({});
    setIsFilterVisible(false);
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  // View comment details
  const handleViewDetail = (comment) => {
    setSelectedComment(comment);
    setIsDetailModalVisible(true);
  };

  // Show delete confirmation
  const showDeleteConfirm = (comment) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa bình luận này?",
      icon: <ExclamationCircleOutlined />,
      content: `Bình luận của: ${comment.userName}`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        handleDelete(comment);
      },
    });
  };

  // Delete comment
  const handleDelete = async (comment) => {
    try {
      setLoading(true);

      // Kiểm tra dữ liệu đầu vào
      if (!comment || !comment.productId || !comment.id) {
        console.error("Invalid comment data:", comment);
        message.error("Dữ liệu bình luận không hợp lệ hoặc thiếu thông tin");
        setLoading(false);
        return;
      }

      // Log thông tin bình luận để debug
      console.log("Attempting to delete comment:", {
        commentId: comment.id,
        productId: comment.productId,
        userName: comment.userName,
        content: comment.content && comment.content.substring(0, 30) + "...",
      });

      // Gọi API xóa bình luận
      const response = await productService.deleteComment(
        comment.productId,
        comment.id
      );

      if (response && response.success) {
        message.success(`Đã xóa bình luận của "${comment.userName}"`);

        // Refresh danh sách bình luận
        await fetchComments();
      } else {
        message.error(response?.message || "Không thể xóa bình luận");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);

      // Hiển thị thông báo lỗi chi tiết
      if (error.message) {
        message.error(`Lỗi: ${error.message}`);
      } else {
        message.error("Không thể xóa bình luận. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: "Người dùng",
      dataIndex: "userName",
      key: "userName",
      width: 150,
      render: (userName, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          {userName}
        </Space>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 200,
      render: (productName, record) => (
        <Tooltip title="Xem sản phẩm">
          <a
            href={`/product/${record.productId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {productName}
          </a>
        </Tooltip>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 150,
      render: (rating) => <Rate disabled defaultValue={rating} />,
      sorter: (a, b) => a.rating - b.rating,
      filters: [
        { text: "5 sao", value: 5 },
        { text: "4 sao", value: 4 },
        { text: "3 sao", value: 3 },
        { text: "2 sao", value: 2 },
        { text: "1 sao", value: 1 },
      ],
      onFilter: (value, record) => record.rating === value,
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      ellipsis: {
        showTitle: false,
      },
      render: (content) => (
        <Tooltip placement="topLeft" title={content}>
          {content.length > 50 ? `${content.substring(0, 50)}...` : content}
        </Tooltip>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (createdAt) => dayjs(createdAt).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Phản hồi",
      dataIndex: "replies",
      key: "replies",
      width: 100,
      render: (replies) => replies.length,
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
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      ),
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
        <Title level={2}>Quản lý bình luận sản phẩm</Title>

        <Space>
          <Input
            placeholder="Tìm kiếm bình luận"
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
              fetchComments();
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
                <Form.Item name="productId" label="Sản phẩm">
                  <Select
                    allowClear
                    showSearch
                    placeholder="Chọn sản phẩm"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {products.map((product) => (
                      <Option key={product._id} value={product._id}>
                        {product.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="rating" label="Đánh giá">
                  <Select allowClear placeholder="Chọn đánh giá">
                    <Option value={5}>5 sao</Option>
                    <Option value={4}>4 sao</Option>
                    <Option value={3}>3 sao</Option>
                    <Option value={2}>2 sao</Option>
                    <Option value={1}>1 sao</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="dateRange" label="Ngày bình luận">
                  <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{ textAlign: "right" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginRight: 8 }}
                >
                  Áp dụng
                </Button>
                <Button onClick={resetFilters}>Reset</Button>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      <Table
        columns={columns}
        dataSource={comments}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: pagination.pageSize,
          total: pagination.total,
          current: pagination.current,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bình luận`,
          onChange: (page, pageSize) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize,
            });
          },
        }}
      />

      {/* Comment Detail Modal */}
      <Modal
        title="Chi tiết bình luận"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={() => {
              showDeleteConfirm(selectedComment);
              setIsDetailModalVisible(false);
            }}
          >
            Xóa
          </Button>,
        ]}
        width={700}
      >
        {selectedComment && (
          <div>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Sản phẩm: </Text>
                <a
                  href={`/product/${selectedComment.productId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedComment.productName}
                </a>
              </div>

              <div>
                <Space>
                  <Avatar
                    icon={<UserOutlined />}
                    src={selectedComment.avatar}
                  />
                  <Text strong>{selectedComment.userName}</Text>
                </Space>
                <div style={{ marginLeft: 40 }}>
                  <Text type="secondary">
                    {dayjs(selectedComment.createdAt).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Text>
                </div>
              </div>

              <Rate disabled defaultValue={selectedComment.rating} />

              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <Text>{selectedComment.content}</Text>
              </div>

              {selectedComment.replies.length > 0 && (
                <>
                  <Divider orientation="left">
                    Phản hồi ({selectedComment.replies.length})
                  </Divider>
                  <List
                    itemLayout="horizontal"
                    dataSource={selectedComment.replies}
                    renderItem={(reply) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={<UserOutlined />}
                              src={reply.avatar}
                            />
                          }
                          title={reply.user_name}
                          description={
                            <>
                              <p>{reply.content}</p>
                              <Text type="secondary">
                                {dayjs(reply.created_at).format(
                                  "DD/MM/YYYY HH:mm"
                                )}
                              </Text>
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductCommentsManagement;
