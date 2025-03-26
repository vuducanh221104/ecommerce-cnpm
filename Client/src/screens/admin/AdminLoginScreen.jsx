import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Card, Alert, Spin } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { loginUser, getCurrentUser } from "../../services/authService";
import { hasAdminAccess } from "../../utils/roleUtils";
import { toast } from "react-hot-toast";

const { Title, Text } = Typography;

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const Logo = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 40px;
  color: #1890ff;
`;

const FormItem = styled(Form.Item)`
  margin-bottom: 24px;
`;

const SubmitButton = styled(Button)`
  height: 40px;
  font-weight: 500;
`;

const AdminLoginScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form] = Form.useForm();

  // Lấy returnUrl từ query params nếu có
  const params = new URLSearchParams(location.search);
  const returnUrl = params.get("returnUrl") || "/admin/dashboard";

  // Kiểm tra nếu người dùng đã đăng nhập và có quyền admin thì chuyển hướng
  useEffect(() => {
    const user = getCurrentUser();
    if (user && hasAdminAccess(user)) {
      navigate(returnUrl, { replace: true });
    }
  }, [navigate, returnUrl]);

  const onFinish = async (values) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await loginUser(values.username, values.password);

      if (response.success) {
        const user = response.user;

        // Kiểm tra quyền admin
        if (!hasAdminAccess(user)) {
          setError("Bạn không có quyền truy cập vào trang quản trị");
          return;
        }

        toast.success("Đăng nhập thành công!");
        navigate(returnUrl, { replace: true });
      } else {
        setError(response.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      setError(error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Spin spinning={isLoading}>
          <LoginHeader>
            <Logo>
              <LoginOutlined />
            </Logo>
            <Title level={2} style={{ margin: 0 }}>
              Admin Dashboard
            </Title>
            <Text type="secondary">Đăng nhập với tài khoản quản trị viên</Text>
          </LoginHeader>

          {error && (
            <Alert
              message="Lỗi đăng nhập"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            form={form}
            name="admin_login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <FormItem
              name="username"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên đăng nhập hoặc email",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Tên đăng nhập hoặc Email"
                size="large"
              />
            </FormItem>

            <FormItem
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
                size="large"
              />
            </FormItem>

            <Form.Item>
              <SubmitButton
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
              >
                Đăng nhập
              </SubmitButton>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button type="link" onClick={() => navigate("/")}>
              Quay lại trang chủ
            </Button>
          </div>
        </Spin>
      </LoginCard>
    </LoginContainer>
  );
};

export default AdminLoginScreen;
