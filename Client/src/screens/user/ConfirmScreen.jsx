import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaShoppingBag, FaHome } from "react-icons/fa";
import { Container } from "../../styles/styles";
import { staticImages } from "../../utils/images";
import { BaseLinkGreen } from "../../styles/button";
import { defaultTheme } from "../../styles/themes/default";

const ConfirmContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 20px;
  text-align: center;
`;

const SuccessIcon = styled.div`
  color: #4caf50;
  font-size: 80px;
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const Message = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
`;

const OrderDetails = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
`;

const OrderTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
`;

const OrderInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const OrderInfoItem = styled.div`
  margin-bottom: 12px;
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #666;
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
`;

const InfoValue = styled.span`
  font-size: 15px;
`;

const ProductList = styled.div`
  border-top: 1px solid #eee;
  padding-top: 20px;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const ProductMeta = styled.div`
  font-size: 13px;
  color: #666;
`;

const ProductPrice = styled.div`
  font-weight: 500;
  min-width: 100px;
  text-align: right;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const Button = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: ${(props) => (props.$primary ? "#222" : "#fff")};
  color: ${(props) => (props.$primary ? "#fff" : "#222")};
  border: 1px solid #222;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.$primary ? "#000" : "#f5f5f5")};
  }
`;

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("vi-VN", options);
};

const ConfirmScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Check if there's order data in location state
    if (location.state && location.state.order) {
      setOrder(location.state.order);
    } else {
      // No order data, redirect to home
      navigate("/");
    }
  }, [location, navigate]);

  if (!order) {
    return null;
  }

  return (
    <ConfirmContainer>
      <SuccessIcon>
        <FaCheckCircle />
      </SuccessIcon>

      <Title>Order Success</Title>
      <Message>
        Thank you for your order. We have received your order and will process
        it as soon as possible.
      </Message>

      <OrderDetails>
        <OrderTitle>Order Details</OrderTitle>

        <OrderInfo>
          <div>
            <OrderInfoItem>
              <InfoLabel>Order ID:</InfoLabel>
              <InfoValue>{order._id}</InfoValue>
            </OrderInfoItem>
            <OrderInfoItem>
              <InfoLabel>Order Date:</InfoLabel>
              <InfoValue>{formatDate(order.created_at)}</InfoValue>
            </OrderInfoItem>
            <OrderInfoItem>
              <InfoLabel>Payment Method:</InfoLabel>
              <InfoValue>Cash on delivery (COD)</InfoValue>
            </OrderInfoItem>
          </div>

          <div>
            <OrderInfoItem>
              <InfoLabel>Recipient:</InfoLabel>
              <InfoValue>{order.shipping_address.full_name}</InfoValue>
            </OrderInfoItem>
            <OrderInfoItem>
              <InfoLabel>Phone Number:</InfoLabel>
              <InfoValue>{order.shipping_address.phone_number}</InfoValue>
            </OrderInfoItem>
            <OrderInfoItem>
              <InfoLabel>Address:</InfoLabel>
              <InfoValue>
                {order.shipping_address.street}, {order.shipping_address.ward},{" "}
                {order.shipping_address.district}, {order.shipping_address.city}
              </InfoValue>
            </OrderInfoItem>
          </div>
        </OrderInfo>

        <ProductList>
          {order.products.map((item, index) => (
            <ProductItem key={index}>
              <ProductImage src={item.thumb} alt={item.name} />
              <ProductDetails>
                <ProductName>{item.name}</ProductName>
                <ProductMeta>
                  {item.color} / {item.size} - SL: {item.quantity}
                </ProductMeta>
              </ProductDetails>
              <ProductPrice>
                {formatPrice(
                  (item.price.discount || item.price.original) * item.quantity
                )}
              </ProductPrice>
            </ProductItem>
          ))}

          <OrderInfoItem style={{ marginTop: "20px", textAlign: "right" }}>
            <InfoLabel style={{ display: "inline", marginRight: "12px" }}>
              Total:
            </InfoLabel>
            <InfoValue style={{ fontWeight: "bold", fontSize: "18px" }}>
              ${order.total_amount}
            </InfoValue>
          </OrderInfoItem>
        </ProductList>
      </OrderDetails>

      <ButtonsContainer>
        <Button to="/order" $primary>
          <FaShoppingBag />
          View my order
        </Button>
        <Button to="/">
          <FaHome />
          Back to home
        </Button>
      </ButtonsContainer>
    </ConfirmContainer>
  );
};

export default ConfirmScreen;
