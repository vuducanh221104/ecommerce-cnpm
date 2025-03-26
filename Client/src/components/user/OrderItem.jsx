import styled from "styled-components";
import PropTypes from "prop-types";
import { useState } from "react";
import { currencyFormat } from "../../utils/helper";
import { BaseLinkGreen } from "../../styles/button";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { formatDate } from "../../utils/helper";
import { Link } from "react-router-dom";
import { cancelOrder } from "../../services/orderService";
import { store } from "../../redux/store";
import toast from "react-hot-toast";

const OrderItemWrapper = styled.div`
  margin: 30px 0;
  border-bottom: 1px solid ${defaultTheme.color_anti_flash_white};

  .order-item-title {
    margin-bottom: 12px;
  }

  .order-item-details {
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 24px 32px;
    border-radius: 8px;

    @media (max-width: ${breakpoints.sm}) {
      padding: 20px 24px;
    }

    @media (max-width: ${breakpoints.xs}) {
      padding: 12px 16px;
    }
  }

  .order-info-group {
    @media (max-width: ${breakpoints.sm}) {
      flex-direction: column;
    }
  }

  .order-info-item {
    width: 50%;

    span {
      &:nth-child(2) {
        margin-left: 4px;
      }
    }

    &:nth-child(even) {
      text-align: right;
      @media (max-width: ${breakpoints.lg}) {
        text-align: left;
      }
    }

    @media (max-width: ${breakpoints.sm}) {
      width: 100%;
      margin: 2px 0;
    }
  }

  .order-overview {
    margin: 28px 0;
    gap: 12px;

    @media (max-width: ${breakpoints.lg}) {
      margin: 20px 0;
    }

    @media (max-width: ${breakpoints.sm}) {
      flex-direction: column;
    }

    &-img {
      width: 100px;
      height: 100px;
      border-radius: 6px;
      overflow: hidden;
    }

    &-content {
      grid-template-columns: 100px auto;
      gap: 18px;
    }

    &-info {
      ul {
        span {
          &:nth-child(2) {
            margin-left: 4px;
          }
        }
      }
    }
  }

  .order-status {
    &-delivered,
    &-completed {
      color: ${defaultTheme.color_green};
    }

    &-processing,
    &-inprogress {
      color: ${defaultTheme.color_amber};
    }

    &-cancelled {
      color: ${defaultTheme.color_red};
    }

    &-pending {
      color: ${defaultTheme.color_gray};
    }
  }
`;

// Styled component for the cancel button to match BaseLinkGreen style
const CancelButton = styled.button`
  background-color: ${defaultTheme.color_red};
  color: ${defaultTheme.color_white};
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  display: block;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: ${defaultTheme.default_transition};
  margin-top: 8px;
  width: 100%;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: #d67979;
    cursor: not-allowed;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 120px;
`;

const OrderItem = ({ order, onOrderUpdate }) => {
  const [cancelling, setCancelling] = useState(false);

  // Get the first item for display in the order summary
  const firstItem =
    order.products && order.products.length > 0 ? order.products[0] : null;

  // Calculate estimated delivery date (7 days from order date)
  const orderDate = order.created_at ? new Date(order.created_at) : new Date();
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 7);

  // Format status for CSS class
  const statusClass = `order-status-${order.status
    .toLowerCase()
    .replace(/\s+/g, "")}`;

  // Get product thumbnail or use placeholder
  const getProductThumb = (product) => {
    if (product && product.thumb) return product.thumb;
    if (product && product.images && product.images.length > 0)
      return product.images[0];
    return "https://via.placeholder.com/100";
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();

    if (cancelling) return; // Prevent multiple clicks

    try {
      setCancelling(true);
      const currentUser = store.getState().user.currentUser;

      if (!currentUser || !currentUser._id) {
        toast.error("You must be logged in to cancel an order");
        setCancelling(false);
        return;
      }

      const response = await cancelOrder(order._id, currentUser._id);

      if (response.success) {
        toast.success("Order cancelled successfully");
        // Notify parent component to refresh orders
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      } else {
        toast.error(response.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error(
        error.message || "An error occurred while cancelling the order"
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <OrderItemWrapper>
      <div className="order-item-details">
        <h3 className="text-x order-item-title">Order no: {order._id}</h3>
        <div className="order-info-group flex flex-wrap">
          <div className="order-info-item">
            <span className="text-gray font-semibold">Order Date:</span>
            <span className="text-silver">{formatDate(order.created_at)}</span>
          </div>
          <div className="order-info-item">
            <span className="text-gray font-semibold">Order Status:</span>
            <span className={`${statusClass}`}>{order.status}</span>
          </div>
          <div className="order-info-item">
            <span className="text-gray font-semibold">Estimated Delivery:</span>
            <span className="text-silver">{formatDate(deliveryDate)}</span>
          </div>
          <div className="order-info-item">
            <span className="text-gray font-semibold">Method:</span>
            <span className="text-silver">
              {order.payment_method || "Cash on Delivery"}
            </span>
          </div>
        </div>
      </div>
      {firstItem && (
        <div className="order-overview flex justify-between">
          <div className="order-overview-content grid">
            <div className="order-overview-img">
              <img
                src={getProductThumb(firstItem)}
                alt={firstItem.name || "Product"}
                className="object-fit-cover"
              />
            </div>
            <div className="order-overview-info">
              <h4 className="text-xl">{firstItem.name || "Product"}</h4>
              <ul>
                {firstItem.color && (
                  <li className="font-semibold text-base">
                    <span>Colour:</span>
                    <span className="text-silver">{firstItem.color}</span>
                  </li>
                )}
                {firstItem.size && (
                  <li className="font-semibold text-base">
                    <span>Size:</span>
                    <span className="text-silver">{firstItem.size}</span>
                  </li>
                )}
                <li className="font-semibold text-base">
                  <span>Quantity:</span>
                  <span className="text-silver">{firstItem.quantity}</span>
                </li>
                <li className="font-semibold text-base">
                  <span>Total:</span>
                  <span className="text-silver">
                    {(() => {
                      // Handle different price formats
                      let total = 0;

                      // Use order.total_amount directly if available
                      if (typeof order.total_amount === "number") {
                        total = order.total_amount;
                      } else if (typeof order.totalAmount === "number") {
                        total = order.totalAmount;
                      }

                      return currencyFormat(total);
                    })()}
                  </span>
                </li>
                {order.products && order.products.length > 1 && (
                  <li className="font-semibold text-base text-gray">
                    + {order.products.length - 1} more items
                  </li>
                )}
              </ul>
            </div>
          </div>
          <ButtonContainer>
            <BaseLinkGreen to={`/order_detail/${order._id}`}>
              View Detail
            </BaseLinkGreen>

            {order.status &&
              order.status.toLowerCase() !== "cancelled" &&
              order.status.toLowerCase() !== "delivered" &&
              order.status.toLowerCase() !== "completed" && (
                <CancelButton onClick={handleCancelOrder} disabled={cancelling}>
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </CancelButton>
              )}
          </ButtonContainer>
        </div>
      )}
    </OrderItemWrapper>
  );
};

export default OrderItem;

OrderItem.propTypes = {
  order: PropTypes.object.isRequired,
  onOrderUpdate: PropTypes.func,
};
