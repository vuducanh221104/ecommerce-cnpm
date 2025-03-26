import styled from "styled-components";

const SummaryContainer = styled.div`
  width: 100%;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.span`
  font-weight: 500;
  font-size: 14px;
`;

const ProductMeta = styled.span`
  color: #666;
  font-size: 12px;
  margin-top: 4px;
`;

const ProductPrice = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Price = styled.span`
  font-weight: 500;
  font-size: 14px;
`;

const Quantity = styled.span`
  color: #666;
  font-size: 12px;
`;

const SummaryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;

  &:last-child {
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px solid #eee;
  }
`;

const SummaryLabel = styled.span`
  color: ${(props) => (props.$total ? "#000" : "#666")};
  font-weight: ${(props) => (props.$total ? "600" : "normal")};
  font-size: ${(props) => (props.$total ? "16px" : "14px")};
`;

const SummaryValue = styled.span`
  font-weight: ${(props) => (props.$total ? "600" : "500")};
  font-size: ${(props) => (props.$total ? "18px" : "14px")};
`;

const PaymentMethod = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
`;

const PaymentTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const PaymentOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const Radio = styled.input`
  margin: 0;
`;

const PaymentLabel = styled.label`
  font-size: 14px;
  margin-left: 4px;
  cursor: pointer;
`;

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const OrderSummary = ({ products, totalAmount }) => {
  const subtotal = products.reduce((sum, item) => {
    return sum + (item.price.discount || item.price.original) * item.quantity;
  }, 0);

  const shippingFee = 0; // Free shipping

  return (
    <SummaryContainer>
      <Title>Tóm tắt đơn hàng</Title>

      <ProductList>
        {products.map((item, index) => (
          <ProductItem key={index}>
            <ProductInfo>
              <ProductImage src={item.thumb} alt={item.name} />
              <ProductDetails>
                <ProductName>{item.name}</ProductName>
                <ProductMeta>
                  {item.color} / {item.size}
                </ProductMeta>
              </ProductDetails>
            </ProductInfo>
            <ProductPrice>
              <Price>
                ${(item.price.discount || item.price.original) * item.quantity}
              </Price>
              <Quantity>SL: {item.quantity}</Quantity>
            </ProductPrice>
          </ProductItem>
        ))}
      </ProductList>

      <SummaryDetails>
        <SummaryRow>
          <SummaryLabel>Tạm tính</SummaryLabel>
          <SummaryValue>${subtotal}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>Phí vận chuyển</SummaryLabel>
          <SummaryValue>
            {shippingFee === 0 ? "Miễn phí" : $(shippingFee)}
          </SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel $total>Tổng cộng</SummaryLabel>
          <SummaryValue $total>${totalAmount}</SummaryValue>
        </SummaryRow>
      </SummaryDetails>

      <PaymentMethod>
        <PaymentTitle>Phương thức thanh toán</PaymentTitle>
        <PaymentOption>
          <Radio
            type="radio"
            id="cod"
            name="payment_method"
            value="COD"
            checked
            readOnly
          />
          <PaymentLabel htmlFor="cod">
            Thanh toán khi nhận hàng (COD)
          </PaymentLabel>
        </PaymentOption>
      </PaymentMethod>
    </SummaryContainer>
  );
};

export default OrderSummary;
