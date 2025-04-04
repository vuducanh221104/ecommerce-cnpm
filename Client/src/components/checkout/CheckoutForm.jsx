import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { createOrder } from "../../services/orderService";

const FormContainer = styled.div`
  width: 100%;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;

  &:focus {
    border-color: #222;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;

  &:focus {
    border-color: #222;
    outline: none;
  }
`;

const Textarea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  min-height: 100px;
  resize: vertical;

  &:focus {
    border-color: #222;
    outline: none;
  }
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const SubmitButton = styled.button`
  background-color: #222;
  color: #fff;
  padding: 14px 24px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #000;
  }

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;

const CheckoutForm = ({ totalAmount, products }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone_number: user?.phone_number || "",
    street: user?.address?.street || "",
    ward: user?.address?.ward || "",
    district: user?.address?.district || "",
    city: user?.address?.city || "",
    country: "Vietnam",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone_number: user.phone_number || "",
        street: user.address?.street || "",
        ward: user.address?.ward || "",
        district: user.address?.district || "",
        city: user.address?.city || "",
        country: "Vietnam",
        notes: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const requiredFields = [
      "full_name",
      "phone_number",
      "street",
      "ward",
      "district",
      "city",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Vui lòng điền ${getFieldLabel(field)}`);
        return false;
      }
    }

    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      full_name: "Họ và tên",
      phone_number: "Số điện thoại",
      street: "Địa chỉ đường/phố",
      ward: "Phường/Xã",
      district: "Quận/Huyện",
      city: "Thành phố/Tỉnh",
    };

    return labels[field] || field;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập để tiếp tục thanh toán");
      navigate("/sign_in");
      return;
    }

    if (products.length === 0) {
      toast.error("Giỏ hàng trống, không thể thanh toán");
      navigate("/cart");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        user_id: user._id,
        customer_email: user.email,
        products: products,
        shipping_address: {
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          street: formData.street,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
          country: formData.country,
        },
        payment_method: "COD",
        total_amount: totalAmount,
        notes: formData.notes,
      };

      const response = await createOrder(orderData);

      if (response.success) {
        toast.success("Đặt hàng thành công");
        navigate("/confirm", { state: { order: response.order } });
      } else {
        toast.error(response.message || "Đặt hàng thất bại");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Đặt hàng thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Title>Infomation Order</Title>
      <Form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              type="text"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label htmlFor="street">Address</Label>
          <Input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Nhập số nhà, tên đường"
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label htmlFor="ward">Ward</Label>
            <Input
              type="text"
              id="ward"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              placeholder="Nhập phường/xã"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="district">District</Label>
            <Input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Nhập quận/huyện"
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="city">City</Label>
            <Input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Nhập thành phố/tỉnh"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="country">Country</Label>
            <Select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            >
              <option value="Vietnam">Việt Nam</option>
            </Select>
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter notes about the order (if any)"
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? "Processing..." : "Complete Order"}
        </SubmitButton>
      </Form>
    </FormContainer>
  );
};

export default CheckoutForm;
