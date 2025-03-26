import styled from "styled-components";
import { BaseButtonGreen } from "../../styles/button";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { currencyFormat } from "../../utils/helper";
import { PropTypes } from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { getUserCart } from "../../services/cartService";

const CartSummaryWrapper = styled.div`
  background-color: ${defaultTheme.color_flash_white};
  padding: 16px;

  .checkout-btn {
    min-width: 100%;
  }

  .summary-list {
    padding: 20px;

    @media (max-width: ${breakpoints.xs}) {
      padding-top: 0;
      padding-right: 0;
      padding-left: 0;
    }

    .summary-item {
      margin: 6px 0;

      &:last-child {
        margin-top: 20px;
        border-top: 1px dashed ${defaultTheme.color_sea_green};
        padding-top: 10px;
      }
    }
  }
`;

const CartSummary = ({ cartItems }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateSubtotal = () => {
    // Filter out any potentially invalid cart items first
    const validItems = cartItems.filter(
      (item) =>
        item &&
        item.price &&
        typeof item.price === "object" &&
        item.price.original &&
        item.quantity
    );

    return validItems.reduce((total, item) => {
      // Get the appropriate price (discount or original)
      const itemPrice =
        item.price.discount && item.price.discount > 0
          ? item.price.discount
          : item.price.original;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const calculateShipping = () => {
    // Fixed shipping cost of 0 (free shipping)
    return 0;
  };

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping();
  const grandTotal = subtotal + shipping;

  const handleCheckout = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      if (!user) {
        toast.error("Vui lòng đăng nhập để tiếp tục thanh toán");
        navigate("/sign_in", { state: { redirect: "/checkout" } });
        return;
      }

      if (cartItems.length === 0) {
        toast.error("Giỏ hàng của bạn đang trống");
        return;
      }

      // Lấy thông tin giỏ hàng mới nhất từ API trước khi chuyển sang trang thanh toán
      const cartResponse = await getUserCart(user._id);

      if (!cartResponse.success) {
        toast.error("Không thể tải thông tin giỏ hàng");
        return;
      }

      // Kiểm tra giỏ hàng có sản phẩm không
      if (!cartResponse.cart || cartResponse.cart.length === 0) {
        toast.error("Giỏ hàng của bạn đang trống");
        navigate("/empty_cart");
        return;
      }

      // Giỏ hàng có sản phẩm, chuyển đến trang thanh toán
      navigate("/checkout");
    } catch (error) {
      console.error("Error processing checkout:", error);
      toast.error("Có lỗi xảy ra khi xử lý thanh toán");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setIsApplyingPromo(true);

    // Simulate promo code check
    setTimeout(() => {
      toast.error("Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
      setIsApplyingPromo(false);
    }, 1000);
  };

  return (
    <CartSummaryWrapper>
      <ul className="summary-list">
        <li className="summary-item flex justify-between">
          <span className="font-medium text-outerspace">
            Subtotal{" "}
            <span className="text-gray font-semibold">
              ({cartItems.length} items)
            </span>
          </span>
          <span className="font-medium text-outerspace">
            {currencyFormat(subtotal)}
          </span>
        </li>
        <li className="summary-item flex justify-between">
          <span className="font-medium text-outerspace">Shipping</span>
          <span className="font-medium text-outerspace">Free</span>
        </li>
        <li className="summary-item flex justify-between">
          <span className="font-medium text-outerspace">Grand Total</span>
          <span className="summary-item-value font-bold text-outerspace">
            {currencyFormat(grandTotal)}
          </span>
        </li>
      </ul>
      <BaseButtonGreen
        type="submit"
        className="checkout-btn"
        onClick={handleCheckout}
        disabled={isProcessing}
      >
        {isProcessing ? "Đang xử lý..." : "Proceed To Checkout"}
      </BaseButtonGreen>
    </CartSummaryWrapper>
  );
};

export default CartSummary;

CartSummary.propTypes = {
  cartItems: PropTypes.array,
};
