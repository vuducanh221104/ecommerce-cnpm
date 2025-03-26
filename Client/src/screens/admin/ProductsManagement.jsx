import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Button,
  Space,
  Input,
  Tag,
  Modal,
  Form,
  Select,
  InputNumber,
  Upload,
  message,
  Tabs,
  Collapse,
  Divider,
  Card,
  Descriptions,
  Image,
  Row,
  Col,
  Alert,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

// Import các dịch vụ API
import * as productService from "../../services/productService";
import * as categoryService from "../../services/categoryService";
import * as materialService from "../../services/materialService";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TabPane } = Tabs;
const { Panel } = Collapse;

/**
 * ProductsManagement - Trang quản lý sản phẩm
 *
 * Các chức năng chính:
 * - Hiển thị danh sách sản phẩm với phân trang và tìm kiếm
 * - Thêm sản phẩm mới
 * - Chỉnh sửa sản phẩm
 * - Xóa sản phẩm
 */
const ProductsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // Effect hooks để lấy dữ liệu
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchMaterials();
  }, [pagination.current, pagination.pageSize]);

  // Lấy danh sách sản phẩm từ API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductsWithPagination(
        pagination.current,
        pagination.pageSize
      );

      if (response.success) {
        // Chuyển đổi dữ liệu API thành dạng hiển thị
        const formattedProducts = response.data.map((product) => {
          // Tính toán thông tin biến thể
          const variantInfo = getVariantInfo(product.variants);

          return {
            key: product._id,
            id: product._id,
            name: product.name,
            price: product.price.original,
            discount: product.price.discount,
            discountQuantity: product.price.discount_quantity,
            categories: product.category_id,
            materials: product.material_id,
            thumb: product.thumb,
            description: product.description,
            variants: product.variants,
            totalQuantity: variantInfo.totalQuantity,
            totalColors: variantInfo.totalColors,
            totalSizes: variantInfo.totalSizes,
            slug: product.slug,
            createdAt: product.created_at,
            updatedAt: product.updated_at,
          };
        });

        setProducts(formattedProducts);
        setPagination({
          ...pagination,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách danh mục từ API
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Lấy danh sách chất liệu từ API
  const fetchMaterials = async () => {
    try {
      const response = await materialService.getAllMaterials();
      if (response.success) {
        setMaterials(response.data);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  // Gửi yêu cầu tạo sản phẩm mới
  const createProduct = async (productData) => {
    try {
      setLoading(true);
      const response = await productService.createProduct(productData);
      if (response.success) {
        message.success("Thêm sản phẩm thành công");
        fetchProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating product:", error);
      message.error("Không thể thêm sản phẩm: " + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Gửi yêu cầu cập nhật sản phẩm
  const updateProduct = async (id, productData) => {
    try {
      setLoading(true);
      const response = await productService.updateProduct(id, productData);
      if (response.success) {
        message.success("Cập nhật sản phẩm thành công");
        fetchProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating product:", error);
      message.error("Không thể cập nhật sản phẩm: " + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Gửi yêu cầu xóa sản phẩm
  const deleteProduct = async (id) => {
    try {
      setLoading(true);
      const response = await productService.deleteProduct(id);
      if (response.success) {
        message.success("Xóa sản phẩm thành công");
        fetchProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting product:", error);
      message.error("Không thể xóa sản phẩm: " + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình cột cho bảng sản phẩm
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "thumb",
      key: "thumb",
      width: 80,
      render: (thumb) => <Image width={60} src={thumb} />,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <a onClick={() => handleViewProduct(record)}>{text}</a>
      ),
    },
    {
      title: "Giá gốc",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price, record) => (
        <Space>
          {record.discount > 0 ? (
            <>
              <span style={{ color: "red" }}>
                ${(price - record.discount).toLocaleString("en-US")}
              </span>
              <span style={{ textDecoration: "line-through", color: "#999" }}>
                ${price.toLocaleString("en-US")}
              </span>
            </>
          ) : (
            <span>${price.toLocaleString("en-US")}</span>
          )}
        </Space>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "SL Giảm giá",
      dataIndex: "discountQuantity",
      key: "discountQuantity",
      width: 120,
      render: (discountQuantity) => (
        <>
          {discountQuantity > 0 && (
            <Tag color="volcano">{discountQuantity}</Tag>
          )}
        </>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "categories",
      key: "categories",
      width: 150,
      render: (categories) => (
        <>
          {categories &&
            categories.map((category) => (
              <Tag key={category._id}>{category.name}</Tag>
            ))}
        </>
      ),
      filters: categories.map((cat) => ({ text: cat.name, value: cat._id })),
      onFilter: (value, record) =>
        record.categories.some((cat) => cat._id === value),
    },
    {
      title: "Biến thể",
      key: "variants_info",
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">{record.totalColors || 0} màu</Tag>
          <Tag color="purple">{record.totalSizes || 0} kích cỡ</Tag>
        </Space>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      width: 100,
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
      render: (quantity) => (
        <Tag color={quantity > 0 ? "green" : "red"}>{quantity}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewProduct(record)}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
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

  // Xử lý hiển thị chi tiết sản phẩm
  const getVariantInfo = (variants) => {
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return {
        totalColors: 0,
        totalSizes: 0,
        totalQuantity: 0,
      };
    }

    const totalColors = variants.length;

    const totalSizes = variants.reduce((sum, variant) => {
      return sum + (variant.sizes ? variant.sizes.length : 0);
    }, 0);

    const totalQuantity = variants.reduce((total, variant) => {
      return (
        total +
        variant.sizes.reduce(
          (sizeTotal, size) => sizeTotal + (size.stock || 0),
          0
        )
      );
    }, 0);

    return {
      totalColors,
      totalSizes,
      totalQuantity,
    };
  };

  const handleViewProduct = (product) => {
    // Lấy thông tin về biến thể
    const variantInfo = getVariantInfo(product.variants);

    setSelectedProduct({
      ...product,
      variants: product.variants || [], // Đảm bảo variants luôn là mảng
      totalQuantity: variantInfo.totalQuantity,
      totalColors: variantInfo.totalColors,
      totalSizes: variantInfo.totalSizes,
    });

    setIsViewModalVisible(true);
  };

  // Xử lý thêm/sửa sản phẩm
  const handleEdit = (product) => {
    setEditingProduct(product);

    // Nếu sửa sản phẩm, điền thông tin vào form
    if (product) {
      const initialValues = {
        name: product.name,
        price: product.price,
        discount: product.discount,
        discountQuantity: product.discountQuantity,
        description: product.description,
        categories: product.categories.map((cat) => cat._id),
        materials: product.materials.map((mat) => mat._id),
        thumb: product.thumb,
        variants:
          product.variants && product.variants.length > 0
            ? product.variants
            : undefined,
      };

      form.setFieldsValue(initialValues);
    } else {
      // Nếu thêm mới, reset form
      form.resetFields();
    }

    setIsModalVisible(true);
  };

  // Mở modal thêm sản phẩm mới
  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Xử lý khi submit form
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // Tạo dữ liệu sản phẩm từ form values
      const productData = {
        name: values.name,
        price: {
          original: values.price,
          discount: values.discount || 0,
          discount_quantity: values.discountQuantity || 0,
          currency: "$",
        },
        description: values.description,
        category_id: values.categories,
        material_id: values.materials,
        thumb: values.thumb,
      };

      // Nếu đang cập nhật sản phẩm và không có thay đổi về variants
      if (
        editingProduct &&
        (!values.variants || values.variants.length === 0)
      ) {
        productData.variants = editingProduct.variants;
      } else {
        // Đảm bảo variants có đủ thuộc tính cần thiết
        const validatedVariants =
          values.variants?.map((variant) => {
            // Đảm bảo có ít nhất 1 ảnh
            if (!variant.images || variant.images.length === 0) {
              message.warning(
                `Vui lòng thêm ít nhất 1 ảnh cho biến thể màu ${variant.color}`
              );
              throw new Error("Thiếu ảnh cho biến thể");
            }

            // Đảm bảo có ít nhất 1 kích cỡ
            if (!variant.sizes || variant.sizes.length === 0) {
              message.warning(
                `Vui lòng thêm ít nhất 1 kích cỡ cho biến thể màu ${variant.color}`
              );
              throw new Error("Thiếu kích cỡ cho biến thể");
            }

            return {
              ...variant,
              sizes: variant.sizes.map((size) => ({
                size: size.size,
                stock: Number(size.stock || 0),
              })),
            };
          }) || [];

        productData.variants = validatedVariants;
      }

      let success;

      if (editingProduct) {
        // Cập nhật sản phẩm
        success = await updateProduct(editingProduct.id, productData);
      } else {
        // Tạo sản phẩm mới
        success = await createProduct(productData);
      }

      if (success) {
        setIsModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      if (
        error.message !== "Thiếu ảnh cho biến thể" &&
        error.message !== "Thiếu kích cỡ cho biến thể"
      ) {
        console.error("Validation failed:", error);
        message.error("Vui lòng kiểm tra lại thông tin nhập vào");
      }
    }
  };

  // Xác nhận xóa sản phẩm
  const showDeleteConfirm = (product) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      icon: <ExclamationCircleOutlined />,
      content: `Sản phẩm: ${product.name}`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        deleteProduct(product.id);
      },
    });
  };

  // Xử lý khi thay đổi phân trang
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: pagination.current,
    });
  };

  // Tìm kiếm sản phẩm
  const handleSearch = (value) => {
    setSearchText(value);

    // Có thể bạn muốn thêm logic tìm kiếm từ API ở đây
    // Hiện tại, chúng ta chỉ filter dữ liệu nội bộ
    if (value) {
      const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setProducts(filteredProducts);
    } else {
      fetchProducts();
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
        <Title level={2}>Quản lý sản phẩm</Title>

        <Space>
          <Input
            placeholder="Tìm kiếm sản phẩm"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm sản phẩm
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: pagination.pageSize,
          total: pagination.total,
          current: pagination.current,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} sản phẩm`,
        }}
        onChange={handleTableChange}
      />

      {/* Modal chi tiết sản phẩm */}
      <Modal
        title={`Chi tiết sản phẩm: ${selectedProduct?.name}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsViewModalVisible(false);
              handleEdit(selectedProduct);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
      >
        {selectedProduct && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin cơ bản" key="1">
              <Row gutter={16}>
                <Col span={8}>
                  <Image
                    src={selectedProduct.thumb}
                    alt={selectedProduct.name}
                    style={{ width: "100%" }}
                  />
                </Col>
                <Col span={16}>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Tên sản phẩm">
                      {selectedProduct.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá gốc">
                      {selectedProduct.discount > 0 ? (
                        <Space>
                          <span style={{ color: "red" }}>
                            $
                            {(
                              selectedProduct.price - selectedProduct.discount
                            ).toLocaleString("en-US")}
                          </span>
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#999",
                            }}
                          >
                            ${selectedProduct.price.toLocaleString("en-US")}
                          </span>
                        </Space>
                      ) : (
                        <span>
                          ${selectedProduct.price.toLocaleString("en-US")}
                        </span>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="SL Giảm giá">
                      {selectedProduct.discountQuantity > 0 ? (
                        <Tag color="volcano">
                          {selectedProduct.discountQuantity}
                        </Tag>
                      ) : (
                        "Không có"
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Biến thể">
                      <Space>
                        <Tag color="blue">
                          {selectedProduct.totalColors || 0} màu sắc
                        </Tag>
                        <Tag color="purple">
                          {selectedProduct.totalSizes || 0} kích cỡ
                        </Tag>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng tồn kho">
                      <Tag
                        color={
                          selectedProduct.totalQuantity > 0 ? "green" : "red"
                        }
                      >
                        {selectedProduct.totalQuantity || 0} sản phẩm
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Danh mục">
                      {selectedProduct.categories.map((cat) => (
                        <Tag key={cat._id}>{cat.name}</Tag>
                      ))}
                    </Descriptions.Item>
                    <Descriptions.Item label="Chất liệu">
                      {selectedProduct.materials.map((mat) => (
                        <Tag key={mat._id}>{mat.name}</Tag>
                      ))}
                    </Descriptions.Item>
                    <Descriptions.Item label="Slug">
                      {selectedProduct.slug}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>

              <Divider orientation="left">Mô tả</Divider>
              <div
                dangerouslySetInnerHTML={{
                  __html: selectedProduct.description,
                }}
              />
            </TabPane>

            <TabPane tab="Biến thể" key="2">
              <Collapse defaultActiveKey={["0"]}>
                {selectedProduct.variants.map((variant, variantIndex) => (
                  <Panel
                    header={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            background: variant.color.toLowerCase(),
                            borderRadius: "50%",
                            border: "1px solid #ddd",
                          }}
                        ></div>
                        <span>{`Màu: ${variant.color}`}</span>
                      </div>
                    }
                    key={variantIndex}
                    extra={
                      <Image src={variant.images[0]} width={40} height={40} />
                    }
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Card title="Hình ảnh" bordered={false}>
                          <Row gutter={[8, 8]}>
                            {variant.images.map((image, imgIndex) => (
                              <Col span={6} key={imgIndex}>
                                <Card
                                  hoverable
                                  cover={
                                    <Image
                                      src={image}
                                      alt={`${variant.color} - Ảnh ${
                                        imgIndex + 1
                                      }`}
                                      style={{
                                        height: "150px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  }
                                >
                                  <Card.Meta title={`Ảnh ${imgIndex + 1}`} />
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </Card>
                      </Col>
                      <Col span={24}>
                        <Card title="Kích cỡ & Tồn kho" bordered={false}>
                          <Table
                            dataSource={variant.sizes}
                            rowKey="size"
                            pagination={false}
                            columns={[
                              {
                                title: "Kích cỡ",
                                dataIndex: "size",
                                key: "size",
                                render: (size) => (
                                  <Tag color="blue">{size}</Tag>
                                ),
                              },
                              {
                                title: "Tồn kho",
                                dataIndex: "stock",
                                key: "stock",
                                render: (stock) => (
                                  <Tag color={stock > 0 ? "green" : "red"}>
                                    {stock} sản phẩm
                                  </Tag>
                                ),
                              },
                            ]}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </Panel>
                ))}
              </Collapse>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* Modal form thêm/sửa sản phẩm */}
      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk}>
            {editingProduct ? "Cập nhật" : "Thêm mới"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" name="product_form">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin cơ bản" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên sản phẩm!",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập tên sản phẩm" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="thumb"
                    label="Ảnh đại diện"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập URL ảnh đại diện!",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập URL ảnh đại diện" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="price"
                    label="Giá gốc"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập giá sản phẩm!",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      placeholder="Nhập giá sản phẩm"
                      addonAfter="$"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="discount" label="Giảm giá (VND)">
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      placeholder="Giảm giá trực tiếp"
                      addonAfter="$"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="discountQuantity" label="Số lượng giảm giá">
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder="Nhập số lượng giảm giá"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="categories"
                    label="Danh mục"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ít nhất một danh mục!",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn danh mục"
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {categories.map((category) => (
                        <Option key={category._id} value={category._id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="materials"
                    label="Chất liệu"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ít nhất một chất liệu!",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn chất liệu"
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {materials.map((material) => (
                        <Option key={material._id} value={material._id}>
                          {material.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Mô tả sản phẩm"
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả sản phẩm!" },
                ]}
              >
                <Input.TextArea rows={6} placeholder="Nhập mô tả sản phẩm" />
              </Form.Item>
            </TabPane>

            <TabPane tab="Biến thể sản phẩm" key="2">
              <div style={{ marginBottom: 16 }}>
                <Alert
                  message="Thông tin biến thể sản phẩm"
                  description="Mỗi biến thể đại diện cho một màu sắc của sản phẩm, bao gồm các kích cỡ khác nhau và hình ảnh tương ứng. Vui lòng thêm ít nhất một biến thể cho sản phẩm."
                  type="info"
                  showIcon
                />
              </div>
              <Form.List
                name="variants"
                initialValue={[
                  {
                    color: "Mặc định",
                    images: [],
                    sizes: [{ size: "M", stock: 10 }],
                  },
                ]}
              >
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card
                        key={key}
                        title={`Biến thể ${name + 1}`}
                        style={{ marginBottom: 16 }}
                        extra={
                          <Button
                            danger
                            onClick={() => remove(name)}
                            icon={<MinusCircleOutlined />}
                            disabled={fields.length === 1}
                          >
                            Xóa
                          </Button>
                        }
                      >
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, "color"]}
                              label={
                                <span>
                                  Màu sắc
                                  <Tooltip title="Chọn màu từ danh sách hoặc nhập tên màu tùy chỉnh">
                                    <QuestionCircleOutlined
                                      style={{ marginLeft: 4 }}
                                    />
                                  </Tooltip>
                                </span>
                              }
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập màu!",
                                },
                              ]}
                            >
                              <Select
                                showSearch
                                placeholder="Chọn màu hoặc nhập tên màu"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                dropdownRender={(menu) => (
                                  <>
                                    {menu}
                                    <Divider style={{ margin: "8px 0" }} />
                                    <div style={{ padding: "0 8px 4px" }}>
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: "12px" }}
                                      >
                                        Các màu phổ biến: White, Black, Gray,
                                        Blue, Cream, Red, Pink, Yellow
                                      </Text>
                                    </div>
                                  </>
                                )}
                              >
                                <Select.Option value="White">
                                  White
                                </Select.Option>
                                <Select.Option value="Black">
                                  Black
                                </Select.Option>
                                <Select.Option value="Gray">Gray</Select.Option>
                                <Select.Option value="Blue">Blue</Select.Option>
                                <Select.Option value="Cream">
                                  Cream
                                </Select.Option>
                                <Select.Option value="Red">Red</Select.Option>
                                <Select.Option value="Pink">Pink</Select.Option>
                                <Select.Option value="Yellow">
                                  Yellow
                                </Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={16}>
                            <Form.Item
                              {...restField}
                              name={[name, "images"]}
                              label="Hình ảnh (URL)"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập ít nhất 1 URL ảnh!",
                                },
                              ]}
                            >
                              <Select
                                mode="tags"
                                placeholder="Nhập URL ảnh, nhấn Enter để thêm"
                                dropdownRender={(menu) => (
                                  <>
                                    {menu}
                                    <Divider style={{ margin: "8px 0" }} />
                                    <div style={{ padding: "0 8px 4px" }}>
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: "12px" }}
                                      >
                                        Hãy thêm ít nhất 1 URL cho mỗi màu sắc
                                      </Text>
                                    </div>
                                  </>
                                )}
                              ></Select>
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* Preview Images */}
                        <Form.Item
                          shouldUpdate={(prevValues, curValues) => {
                            const prevImages =
                              prevValues.variants?.[name]?.images;
                            const curImages =
                              curValues.variants?.[name]?.images;
                            return prevImages !== curImages;
                          }}
                        >
                          {({ getFieldValue }) => {
                            const imageUrls =
                              getFieldValue(["variants", name, "images"]) || [];
                            return imageUrls.length > 0 ? (
                              <div style={{ marginBottom: 16 }}>
                                <Text type="secondary">Preview hình ảnh:</Text>
                                <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                                  {imageUrls.map((url, index) => (
                                    <Col key={index} span={6}>
                                      <div style={{ position: "relative" }}>
                                        <Image
                                          src={url}
                                          alt={`Preview ${index + 1}`}
                                          style={{
                                            width: "100%",
                                            height: 120,
                                            objectFit: "cover",
                                            borderRadius: 4,
                                          }}
                                        />
                                      </div>
                                    </Col>
                                  ))}
                                </Row>
                              </div>
                            ) : null;
                          }}
                        </Form.Item>

                        <Divider orientation="left">Kích cỡ & số lượng</Divider>

                        <Form.List
                          name={[name, "sizes"]}
                          initialValue={[{ size: "M", stock: 10 }]}
                        >
                          {(
                            sizeFields,
                            { add: addSize, remove: removeSize }
                          ) => (
                            <>
                              <Row gutter={16} style={{ marginBottom: 8 }}>
                                <Col span={8}>
                                  <Text strong>Kích cỡ</Text>
                                </Col>
                                <Col span={8}>
                                  <Text strong>Số lượng tồn kho</Text>
                                </Col>
                                <Col span={8}>
                                  <Text strong>Thao tác</Text>
                                </Col>
                              </Row>

                              {sizeFields.map(
                                ({
                                  key: sizeKey,
                                  name: sizeName,
                                  ...restSizeField
                                }) => (
                                  <Row
                                    gutter={16}
                                    key={sizeKey}
                                    style={{ marginBottom: 16 }}
                                  >
                                    <Col span={8}>
                                      <Form.Item
                                        {...restSizeField}
                                        name={[sizeName, "size"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Vui lòng nhập kích cỡ!",
                                          },
                                        ]}
                                        style={{ marginBottom: 0 }}
                                      >
                                        <Input placeholder="Ví dụ: S, M, L, XL, 38, 39..." />
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        {...restSizeField}
                                        name={[sizeName, "stock"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Vui lòng nhập số lượng!",
                                          },
                                        ]}
                                        style={{ marginBottom: 0 }}
                                      >
                                        <InputNumber
                                          min={0}
                                          style={{ width: "100%" }}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Button
                                        danger
                                        onClick={() => removeSize(sizeName)}
                                        icon={<MinusCircleOutlined />}
                                        disabled={sizeFields.length === 1}
                                      >
                                        Xóa kích cỡ
                                      </Button>
                                    </Col>
                                  </Row>
                                )
                              )}

                              <Form.Item>
                                <Button
                                  type="dashed"
                                  onClick={() => addSize()}
                                  block
                                  icon={<PlusOutlined />}
                                >
                                  Thêm kích cỡ
                                </Button>
                                <div
                                  style={{ marginTop: 8, textAlign: "center" }}
                                >
                                  <Text
                                    type="secondary"
                                    style={{ marginRight: 8 }}
                                  >
                                    Thêm nhanh:
                                  </Text>
                                  <Space>
                                    <Button
                                      size="small"
                                      onClick={() => {
                                        // Thêm các kích cỡ quần áo phổ biến
                                        const sizes = ["S", "M", "L", "XL"];

                                        // Lấy các kích cỡ đã có
                                        const existingSizes =
                                          form.getFieldValue([
                                            "variants",
                                            name,
                                            "sizes",
                                          ]) || [];
                                        const existingSizeNames =
                                          existingSizes.map((s) => s.size);

                                        // Lọc các kích cỡ chưa có
                                        const newSizes = sizes.filter(
                                          (s) => !existingSizeNames.includes(s)
                                        );

                                        // Thêm các kích cỡ mới
                                        newSizes.forEach((size) => {
                                          addSize({ size, stock: 10 });
                                        });
                                      }}
                                    >
                                      S-M-L-XL
                                    </Button>
                                    <Button
                                      size="small"
                                      onClick={() => {
                                        // Thêm các kích cỡ giày phổ biến
                                        const sizes = [
                                          "38",
                                          "39",
                                          "40",
                                          "41",
                                          "42",
                                          "43",
                                        ];

                                        // Lấy các kích cỡ đã có
                                        const existingSizes =
                                          form.getFieldValue([
                                            "variants",
                                            name,
                                            "sizes",
                                          ]) || [];
                                        const existingSizeNames =
                                          existingSizes.map((s) => s.size);

                                        // Lọc các kích cỡ chưa có
                                        const newSizes = sizes.filter(
                                          (s) => !existingSizeNames.includes(s)
                                        );

                                        // Thêm các kích cỡ mới
                                        newSizes.forEach((size) => {
                                          addSize({ size, stock: 10 });
                                        });
                                      }}
                                    >
                                      38-43
                                    </Button>
                                  </Space>
                                </div>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </Card>
                    ))}

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm biến thể màu sắc
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsManagement;
