import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { Link, useNavigate } from "react-router-dom";
import CartTable from "../../components/cart/CartTable";
import { breakpoints } from "../../styles/themes/default";
import CartDiscount from "../../components/cart/CartDiscount";
import CartSummary from "../../components/cart/CartSummary";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getUserCart,
  clearCart,
  refreshCartCount,
} from "../../services/cartService";
import CartEmptyScreen from "./CartEmptyScreen";
import { toast } from "react-hot-toast";
import { updateCartSuccess } from "../../redux/slices/userSlice";
import { BaseButtonOuterspace } from "../../styles/button";
import { checkAuthState } from "../../services/authService";
import { store } from "../../redux/store";

const CartPageWrapper = styled.main`
  padding: 48px 0;

  .breadcrumb-nav {
    margin-bottom: 20px;
  }
`;

const CartContent = styled.div`
  margin-top: 40px;
  grid-template-columns: 2fr 1fr;
  gap: 40px;

  @media (max-width: ${breakpoints.xl}) {
    grid-template-columns: 100%;
  }

  @media (max-width: ${breakpoints.sm}) {
    margin-top: 24px;
  }

  .cart-list {
    @media (max-width: ${breakpoints.lg}) {
      overflow-x: scroll;
    }
  }

  .cart-content-right {
    gap: 24px;

    @media (max-width: ${breakpoints.xl}) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: ${breakpoints.md}) {
      grid-template-columns: 100%;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 20px;
`;

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeCart = async () => {
      setLoading(true);
      setError(null);

      // Nếu chưa có user, thử kiểm tra lại trạng thái xác thực
      if (!currentUser) {
        await checkAuthState();
      }

      // Kiểm tra lại sau khi đã thử xác thực
      const user = store.getState().user.currentUser;

      if (!user) {
        toast.error("Please login to view your cart");
        navigate("/sign_in");
        setLoading(false);
        return;
      }

      loadCartItems();
    };

    initializeCart();
  }, []);

  const loadCartItems = async () => {
    try {
      const response = await getUserCart(currentUser?._id);

      if (response.success) {
        setCartItems(response.cart || []);
      } else {
        setError("Failed to load cart items");
        toast.error("Failed to load cart items");
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setError("Failed to load cart items");
      toast.error("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  const handleCartUpdate = (updatedCart) => {
    setCartItems(updatedCart);
    dispatch(updateCartSuccess(updatedCart));
    refreshCartCount();
  };

  const handleClearCart = async () => {
    try {
      const user = store.getState().user.currentUser;
      if (!user) return;

      const response = await clearCart(user._id);
      if (response.success) {
        // Update local state and Redux
        setCartItems([]);
        dispatch(updateCartSuccess([]));
        refreshCartCount();
        toast.success("Cart cleared successfully");
        // Navigate to empty cart screen
        navigate("/cart");
      } else {
        toast.error(response.message || "Failed to clear cart");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  const breadcrumbItems = [
    { label: "Home", link: "/" },
    { label: "Shopping Cart", link: "" },
  ];

  if (loading) {
    return <div className="page-py-spacing text-center">Loading cart...</div>;
  }

  if (!currentUser) {
    return (
      <div className="page-py-spacing text-center">
        Please login to view your cart
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return <CartEmptyScreen />;
  }

  return (
    <CartPageWrapper>
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <div className="cart-head">
          <p className="text-base text-gray">
            Please fill in the fields below and click place order to complete
            your purchase!
          </p>
        </div>
        <CartContent className="grid items-start">
          <div className="cart-content-left">
            <CartTable cartItems={cartItems} onCartUpdate={handleCartUpdate} />
          </div>
          <div className="grid cart-content-right">
            <CartDiscount onClearCart={handleClearCart} />
            <CartSummary cartItems={cartItems} />
          </div>
        </CartContent>
      </Container>
    </CartPageWrapper>
  );
};

export default CartScreen;
