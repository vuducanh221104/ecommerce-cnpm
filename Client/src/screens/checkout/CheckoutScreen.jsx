import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CheckoutForm from "../../components/checkout/CheckoutForm";
import OrderSummary from "../../components/checkout/OrderSummary";
import { toast } from "react-hot-toast";
import { checkAuthState } from "../../services/authService";
import { store } from "../../redux/store";
import { getUserCart } from "../../services/cartService";

const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const CheckoutTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
  text-align: center;
`;

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  margin: 0 20px;
`;

const StepNumber = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${(props) => (props.$active ? "#222" : "#ddd")};
  color: ${(props) => (props.$active ? "#fff" : "#666")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 8px;
`;

const StepText = styled.span`
  font-size: 14px;
  color: ${(props) => (props.$active ? "#222" : "#666")};
  font-weight: ${(props) => (props.$active ? "600" : "normal")};
`;

const Divider = styled.div`
  flex: 1;
  height: 1px;
  background-color: #ddd;
  margin: 0 12px;
`;

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.currentUser);
  const [products, setProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeCheckout = async () => {
      setLoading(true);

      try {
        // Kiểm tra trạng thái đăng nhập khi refresh trang
        if (!user) {
          await checkAuthState();
        }

        // Lấy thông tin user từ redux sau khi kiểm tra auth
        const currentUser = store.getState().user.currentUser;

        if (!currentUser) {
          toast.error("Vui lòng đăng nhập để tiếp tục thanh toán");
          navigate("/sign_in", { state: { redirect: "/checkout" } });
          setLoading(false);
          return;
        }

        // Lấy thông tin giỏ hàng từ API thay vì từ Redux store
        const cartResponse = await getUserCart(currentUser._id);

        if (!cartResponse.success) {
          toast.error("Không thể tải thông tin giỏ hàng");
          navigate("/cart");
          setLoading(false);
          return;
        }

        // Kiểm tra giỏ hàng có sản phẩm không
        if (!cartResponse.cart || cartResponse.cart.length === 0) {
          toast.error("Giỏ hàng của bạn đang trống");
          navigate("/empty_cart");
          setLoading(false);
          return;
        }

        // Sử dụng dữ liệu giỏ hàng từ API
        setProducts(cartResponse.cart);

        // Tính tổng tiền
        const total = cartResponse.cart.reduce((sum, item) => {
          return (
            sum + (item.price.discount || item.price.original) * item.quantity
          );
        }, 0);

        setTotalAmount(total);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing checkout:", error);
        toast.error("Có lỗi xảy ra khi tải trang thanh toán");
        navigate("/cart");
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [navigate, dispatch]);

  if (loading) {
    return (
      <div className="page-py-spacing text-center">
        Đang tải dữ liệu thanh toán...
      </div>
    );
  }

  return (
    <CheckoutContainer>
      <CheckoutTitle>Thanh toán</CheckoutTitle>

      <StepIndicator>
        <Step>
          <StepNumber $active={true}>1</StepNumber>
          <StepText $active={true}>Giỏ hàng</StepText>
        </Step>
        <Divider />
        <Step>
          <StepNumber $active={true}>2</StepNumber>
          <StepText $active={true}>Thanh toán</StepText>
        </Step>
        <Divider />
        <Step>
          <StepNumber $active={false}>3</StepNumber>
          <StepText $active={false}>Xác nhận</StepText>
        </Step>
      </StepIndicator>

      <CheckoutGrid>
        <CheckoutForm totalAmount={totalAmount} products={products} />
        <OrderSummary products={products} totalAmount={totalAmount} />
      </CheckoutGrid>
    </CheckoutContainer>
  );
};

export default CheckoutScreen;
