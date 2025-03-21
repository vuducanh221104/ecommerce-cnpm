import styled from "styled-components";
import { PropTypes } from "prop-types";
import { Link } from "react-router-dom";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useSelector, useDispatch } from "react-redux";
import {
  updateCartItemQuantity,
  removeFromCart,
  refreshCartCount,
} from "../../services/cartService";
import { currencyFormat } from "../../utils/helper";
import { toast } from "react-hot-toast";
import { updateCartSuccess } from "../../redux/slices/userSlice";

const CartTableRowWrapper = styled.tr`
  .cart-tbl {
    &-prod {
      grid-template-columns: 80px auto;
      column-gap: 12px;

      @media (max-width: ${breakpoints.xl}) {
        grid-template-columns: 60px auto;
      }
    }

    &-qty {
      .qty-inc-btn,
      .qty-dec-btn {
        width: 24px;
        height: 24px;
        border: 1px solid ${defaultTheme.color_platinum};
        border-radius: 2px;

        &:hover {
          border-color: ${defaultTheme.color_sea_green};
          background-color: ${defaultTheme.color_sea_green};
          color: ${defaultTheme.color_white};
        }
      }

      .qty-value {
        width: 40px;
        height: 24px;
      }
    }
  }

  .cart-prod-info {
    p {
      margin-right: 8px;
      span {
        margin-right: 4px;
      }
    }
  }

  .cart-prod-img {
    width: 80px;
    height: 80px;
    overflow: hidden;
    border-radius: 8px;

    @media (max-width: ${breakpoints.xl}) {
      width: 60px;
      height: 60px;
    }
  }
`;

const CartItem = ({ cartItem, onCartUpdate }) => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity > 0) {
      try {
        const response = await updateCartItemQuantity(
          currentUser._id,
          cartItem.product_id,
          cartItem.color,
          cartItem.size,
          newQuantity
        );

        if (response.success) {
          onCartUpdate(response.cart);
          dispatch(updateCartSuccess(response.cart));
          toast.success("Cart updated successfully");
        } else {
          toast.error(response.message || "Failed to update cart");
        }
      } catch (error) {
        console.error("Error updating cart:", error);
        toast.error("Failed to update cart");
      }
    }
  };

  const handleRemoveItem = async () => {
    try {
      console.log("Removing item from cart:", {
        userId: currentUser._id,
        productId: cartItem.product_id,
        color: cartItem.color,
        size: cartItem.size,
      });

      const response = await removeFromCart(
        currentUser._id,
        cartItem.product_id,
        cartItem.color,
        cartItem.size
      );

      console.log("Remove item response:", response);

      if (response.success) {
        onCartUpdate(response.cart);
        dispatch(updateCartSuccess(response.cart));
        toast.success("Item removed from cart");
      } else {
        toast.error(response.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  // Calculate price based on discount if available
  const price = cartItem.price.discount || cartItem.price.original;
  const subtotal = price * cartItem.quantity;

  return (
    <CartTableRowWrapper>
      <td>
        <div className="cart-tbl-prod grid">
          <div className="cart-prod-img">
            <img src={cartItem.thumb} className="object-fit-cover" alt="" />
          </div>
          <div className="cart-prod-info">
            <h4 className="text-base">{cartItem.name}</h4>
            <p className="text-sm text-gray inline-flex">
              <span className="font-semibold">Color: </span> {cartItem.color}
            </p>
            <p className="text-sm text-gray inline-flex">
              <span className="font-semibold">Size:</span>
              {cartItem.size}
            </p>
          </div>
        </div>
      </td>
      <td>
        <span className="text-lg font-bold text-outerspace">
          {currencyFormat(price)}
        </span>
      </td>
      <td>
        <div className="cart-tbl-qty flex items-center">
          <button
            className="qty-dec-btn"
            onClick={() => handleQuantityChange(cartItem.quantity - 1)}
          >
            <i className="bi bi-dash-lg"></i>
          </button>
          <span className="qty-value inline-flex items-center justify-center font-medium text-outerspace">
            {cartItem.quantity}
          </span>
          <button
            className="qty-inc-btn"
            onClick={() => handleQuantityChange(cartItem.quantity + 1)}
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>
      </td>
      <td>
        <span className="cart-tbl-shipping uppercase text-silver font-bold">
          Free
        </span>
      </td>
      <td>
        <span className="text-lg font-bold text-outerspace">
          {currencyFormat(subtotal)}
        </span>
      </td>
      <td>
        <div className="cart-tbl-actions flex justify-center">
          <button
            className="tbl-del-action text-red"
            onClick={handleRemoveItem}
          >
            <i className="bi bi-trash3"></i>
          </button>
        </div>
      </td>
    </CartTableRowWrapper>
  );
};

export default CartItem;

CartItem.propTypes = {
  cartItem: PropTypes.object,
  onCartUpdate: PropTypes.func,
};
