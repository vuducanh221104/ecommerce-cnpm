import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import { Link, useParams, useNavigate } from "react-router-dom";
import Title from "../../components/common/Title";
import { currencyFormat, formatDate } from "../../utils/helper";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useState, useEffect } from "react";
import { getOrderById, cancelOrder } from "../../services/orderService";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { store } from "../../redux/store";

const OrderDetailScreenWrapper = styled.main`
  .btn-and-title-wrapper {
    margin-bottom: 24px;
    .title {
      margin-bottom: 0;
    }

    .btn-go-back {
      margin-right: 12px;
      transition: ${defaultTheme.default_transition};

      &:hover {
        margin-right: 16px;
      }
    }
  }

  .order-d-top {
    background-color: ${defaultTheme.color_whitesmoke};
    padding: 26px 32px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.05);

    @media (max-width: ${breakpoints.sm}) {
      flex-direction: column;
      row-gap: 12px;
    }
  }
`;

const OrderDetailStatusWrapper = styled.div`
  margin: 0 36px;
  @media (max-width: ${breakpoints.sm}) {
    margin: 0 10px;
    overflow-x: scroll;
  }

  .order-status {
    height: 4px;
    margin: 50px 0;
    max-width: 580px;
    width: 340px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    margin-bottom: 70px;

    @media (max-width: ${breakpoints.sm}) {
      margin-right: 40px;
      margin-left: 40px;
    }

    &-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);

      &:nth-child(1) {
        left: 0;
      }

      &:nth-child(2) {
        left: calc(33.3333% - 10px);
      }

      &:nth-child(3) {
        left: calc(66.6666% - 10px);
      }
      &:nth-child(4) {
        right: 0;
      }

      &.status-done {
        background-color: ${defaultTheme.color_outerspace};
        .order-status-text {
          color: ${defaultTheme.color_outerspace};
        }
      }

      &.status-current {
        position: absolute;
        &::after {
          content: "";
          position: absolute;
          width: 12px;
          height: 12px;
          background-color: ${defaultTheme.color_outerspace};
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 30;
          border-radius: 50%;
        }

        .order-status-text {
          color: ${defaultTheme.color_outerspace};
        }
      }
    }

    &-text {
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
    }
  }
`;

const OrderDetailMessageWrapper = styled.div`
  background-color: ${defaultTheme.color_whitesmoke};
  max-width: 748px;
  margin-right: auto;
  margin-left: auto;
  min-height: 68px;
  padding: 16px 24px;
  border-radius: 8px;
  position: relative;
  margin-top: 80px;

  &::after {
    content: "";
    position: absolute;
    top: -34px;
    left: 20%;
    border-bottom: 22px solid ${defaultTheme.color_whitesmoke};
    border-top: 18px solid transparent;
    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
  }

  @media (max-width: ${breakpoints.sm}) {
    margin-top: 10px;
  }
`;

const OrderDetailListWrapper = styled.div`
  padding: 24px;
  margin-top: 40px;
  border: 1px solid rgba(0, 0, 0, 0.05);

  @media (max-width: ${defaultTheme.md}) {
    padding: 18px;
  }

  @media (max-width: ${defaultTheme.md}) {
    padding: 12px;
  }

  .order-d-item {
    grid-template-columns: 80px 1fr 1fr 32px;
    gap: 20px;
    padding: 12px 0;
    border-bottom: 1px solid ${defaultTheme.color_whitesmoke};
    position: relative;

    @media (max-width: ${defaultTheme.xl}) {
      grid-template-columns: 80px 3fr 2fr 32px;
      padding: 16px 0;
      gap: 16px;
    }

    @media (max-width: ${defaultTheme.sm}) {
      grid-template-columns: 50px 3fr 2fr;
      gap: 16px;
    }

    @media (max-width: ${defaultTheme.xs}) {
      grid-template-columns: 100%;
      gap: 12px;
    }

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }

    &-img {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

      @media (max-width: ${breakpoints.sm}) {
        width: 50px;
        height: 50px;
      }

      @media (max-width: ${breakpoints.sm}) {
        width: 100%;
        height: 100%;
      }
    }

    &-calc {
      p {
        display: inline-block;
        margin-right: 50px;

        @media (max-width: ${defaultTheme.lg}) {
          margin-right: 20px;
        }
      }
    }

    &-btn {
      margin-bottom: auto;
      &:hover {
        color: ${defaultTheme.color_sea_green};
      }

      @media (max-width: ${breakpoints.sm}) {
        position: absolute;
        right: 0;
        top: 10px;
      }

      @media (max-width: ${defaultTheme.xs}) {
        width: 28px;
        height: 28px;
        z-index: 5;
        background-color: ${defaultTheme.color_white};
        border-radius: 50%;
        right: 8px;
        top: 24px;
      }
    }
  }
`;

const breadcrumbItems = [
  { label: "Home", link: "/" },
  { label: "Order", link: "/order" },
  { label: "Order Detail", link: "/order_detail" },
];

const getOrderStatusSteps = (status) => {
  const statusLower = status.toLowerCase();
  let orderStep = 1;

  if (statusLower === "pending") {
    orderStep = 1;
  } else if (statusLower === "processing" || statusLower === "shipped") {
    orderStep = 2;
  } else if (statusLower === "delivered" || statusLower === "completed") {
    orderStep = 3;
  } else if (statusLower === "cancelled") {
    orderStep = 4;
  }

  return orderStep;
};

const OrderDetailScreen = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(orderId);

        if (response.success) {
          // Check if the order data is in the 'order' property
          const orderData = response.order || response.data;
          setOrder(orderData);
        } else {
          setError(response.message || "Failed to fetch order details");
          toast.error(response.message || "Failed to fetch order details");
        }
      } catch (error) {
        console.error("Order detail fetch error:", error);
        setError(
          error.message || "An error occurred while fetching order details"
        );
        toast.error(
          error.message || "An error occurred while fetching order details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    } else {
      setError("Order ID is missing");
      setLoading(false);
    }
  }, [orderId]);

  const handleCancelOrder = async () => {
    try {
      const currentUser = store.getState().user.currentUser;
      if (!currentUser || !currentUser._id) {
        toast.error("You must be logged in to cancel an order");
        return;
      }

      const response = await cancelOrder(orderId, currentUser._id);

      if (response.success) {
        toast.success("Order cancelled successfully");
        // Refresh order data
        const updatedOrder = await getOrderById(orderId);
        if (updatedOrder.success) {
          // Check for different response formats
          const orderData = updatedOrder.order || updatedOrder.data;
          setOrder(orderData);
        }
      } else {
        toast.error(response.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error(
        error.message || "An error occurred while cancelling the order"
      );
    }
  };

  if (loading) {
    return (
      <Container className="page-py-spacing">
        <LoadingSpinner />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="page-py-spacing">
        <div className="text-center py-5">
          <h2 className="text-xl mb-3">Error Loading Order</h2>
          <p className="mb-4">{error || "Order not found"}</p>
          <button
            className="btn bg-outerspace text-white px-4 py-2 rounded"
            onClick={() => navigate("/order")}
          >
            Back to Orders
          </button>
        </div>
      </Container>
    );
  }

  const orderStep = getOrderStatusSteps(order.status);
  const orderDate = order.created_at ? new Date(order.created_at) : new Date();
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 7);

  return (
    <OrderDetailScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            <div className="d-flex align-items-center justify-content-between btn-and-title-wrapper">
              <div className="d-flex align-items-center">
                <Link className="text-gray text-base btn-go-back" to="/order">
                  <i className="bi bi-arrow-left"></i>
                </Link>
                <Title titleText={`Order #${order._id}`} />
              </div>
              {order.status.toLowerCase() !== "cancelled" &&
                order.status.toLowerCase() !== "delivered" &&
                order.status.toLowerCase() !== "completed" && (
                  <button
                    className="btn btn-danger"
                    onClick={handleCancelOrder}
                  >
                    Cancel Order
                  </button>
                )}
            </div>

            <div className="order-d-top d-flex align-items-center justify-content-between">
              <div className="od-date">
                <h3 className="text-base font-medium">Order Date</h3>
                <p className="text-gray">{formatDate(order.created_at)}</p>
              </div>
              <div className="od-total">
                <h3 className="text-base font-medium">Total Amount</h3>
                <p>
                  {currencyFormat(
                    typeof order.total_amount === "number"
                      ? order.total_amount
                      : 0
                  )}
                </p>
              </div>
            </div>

            <OrderDetailStatusWrapper>
              <div
                className="order-status"
                style={{
                  background: `linear-gradient(to right, 
                    ${defaultTheme.color_outerspace} 0%, 
                    ${defaultTheme.color_outerspace} ${
                    (orderStep - 1) * 33.33
                  }%, 
                    ${defaultTheme.color_whitesmoke} ${
                    (orderStep - 1) * 33.33
                  }%, 
                    ${defaultTheme.color_whitesmoke} 100%)`,
                }}
              >
                <div
                  className={`order-status-dot ${
                    orderStep >= 1 ? "status-done" : ""
                  }`}
                >
                  <div className="order-status-text">Ordered</div>
                </div>
                <div
                  className={`order-status-dot ${
                    orderStep === 2 ? "status-current" : ""
                  } ${orderStep > 2 ? "status-done" : ""}`}
                >
                  <div className="order-status-text">Shipped</div>
                </div>
                <div
                  className={`order-status-dot ${
                    orderStep === 3 ? "status-current" : ""
                  } ${orderStep > 3 ? "status-done" : ""}`}
                >
                  <div className="order-status-text">Delivered</div>
                </div>
                <div
                  className={`order-status-dot ${
                    orderStep === 4 ? "status-current" : ""
                  }`}
                >
                  <div className="order-status-text">Cancelled</div>
                </div>
              </div>
            </OrderDetailStatusWrapper>

            <OrderDetailMessageWrapper>
              <h3 className="text-base font-medium">
                {order.status.toLowerCase() === "cancelled"
                  ? "Your order has been cancelled"
                  : order.status.toLowerCase() === "delivered" ||
                    order.status.toLowerCase() === "completed"
                  ? "Your order has been delivered"
                  : `Your order is ${
                      order.status
                    }. Expected delivery date is ${formatDate(deliveryDate, {
                      hour: undefined,
                      minute: undefined,
                    })}`}
              </h3>
            </OrderDetailMessageWrapper>

            <OrderDetailListWrapper>
              {order.products?.map((item) => {
                return (
                  <div className="order-d-item grid" key={item._id || item.id}>
                    <div className="order-d-item-img">
                      <img
                        src={
                          item.thumb ||
                          (item.images && item.images.length > 0
                            ? item.images[0]
                            : "https://via.placeholder.com/100")
                        }
                        alt={item.name || "Product"}
                        className="object-fit-cover"
                      />
                    </div>
                    <div className="order-d-item-info">
                      <h3 className="text-base">{item.name || "Product"}</h3>
                      {item.color && (
                        <p className="text-gray">
                          <span className="font-medium">Color: </span>
                          {item.color}
                        </p>
                      )}
                      {item.size && (
                        <p className="text-gray">
                          <span className="font-medium">Size: </span>
                          {item.size}
                        </p>
                      )}
                    </div>
                    <div className="order-d-item-calc">
                      <p className="text-gray">
                        <span className="font-medium">Quantity: </span>
                        {item.quantity}
                      </p>
                      <p>
                        <span className="font-medium">Price: </span>
                        {(() => {
                          // Extract price from various possible formats

                          // Try to get the single item price
                          let singlePrice = 0;

                          // Handle nested price object structure from API (price: { original: 60, discount: 0 })
                          if (item.price && typeof item.price === "object") {
                            if (typeof item.price.original === "number") {
                              singlePrice = item.price.original;
                            } else if (typeof item.price.current === "number") {
                              singlePrice = item.price.current;
                            }
                          }
                          // Handle flat price
                          else if (typeof item.price === "number") {
                            singlePrice = item.price;
                          }
                          // Handle other naming variations
                          else if (
                            item.unit_price &&
                            typeof item.unit_price === "number"
                          ) {
                            singlePrice = item.unit_price;
                          } else if (
                            item.price_per_unit &&
                            typeof item.price_per_unit === "number"
                          ) {
                            singlePrice = item.price_per_unit;
                          } else if (
                            item.pricePerUnit &&
                            typeof item.pricePerUnit === "number"
                          ) {
                            singlePrice = item.pricePerUnit;
                          }

                          const qty =
                            item.quantity && typeof item.quantity === "number"
                              ? item.quantity
                              : 1;
                          const totalPrice = singlePrice * qty;

                          return `${currencyFormat(singlePrice)}`;
                        })()}
                      </p>
                    </div>
                    <div className="order-d-item-btn">
                      <Link to={`/product/${item.slug || ""}`}>
                        <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </OrderDetailListWrapper>
          </UserContent>
        </UserDashboardWrapper>
      </Container>
    </OrderDetailScreenWrapper>
  );
};

export default OrderDetailScreen;
