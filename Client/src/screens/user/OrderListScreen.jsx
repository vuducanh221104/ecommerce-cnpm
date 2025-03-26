import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import OrderItemList from "../../components/user/OrderItemList";
import { getUserOrders } from "../../services/orderService";
import { useSelector } from "react-redux";
import { store } from "../../redux/store";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Link } from "react-router-dom";

const OrderListScreenWrapper = styled.div`
  .order-tabs-contents {
    margin-top: 40px;
  }
  .order-tabs-head {
    min-width: 170px;
    padding: 12px 0;
    border-bottom: 3px solid ${defaultTheme.color_whitesmoke};
    cursor: pointer;

    &.order-tabs-head-active {
      border-bottom-color: ${defaultTheme.color_outerspace};
    }

    @media (max-width: ${breakpoints.lg}) {
      min-width: 120px;
    }

    @media (max-width: ${breakpoints.xs}) {
      min-width: 80px;
    }
  }

  .orders-empty {
    padding: 30px;
    text-align: center;
    background-color: ${defaultTheme.color_anti_flash_white};
    border-radius: 8px;
  }
`;

const breadcrumbItems = [
  { label: "Home", link: "/" },
  { label: "Order", link: "/order" },
];

const OrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const user = useSelector((state) => state.user.currentUser);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setAuthError(false);

      // Use the user from Redux state directly instead of store.getState()
      if (!user || !user._id) {
        console.log("User authentication issue:", { user });
        setAuthError(true);
        toast.error("Please log in to view your orders");
        setLoading(false);
        return;
      }

      console.log("Fetching orders for user:", user._id);
      const response = await getUserOrders(user._id);
      console.log("Order API response:", response);

      if (response && response.success) {
        // Handle different response formats
        let orderData;
        if (response.orders) {
          orderData = response.orders;
        } else if (response.data && Array.isArray(response.data)) {
          orderData = response.data;
        } else if (response.data && response.data.orders) {
          orderData = response.data.orders;
        } else {
          orderData = [];
        }

        console.log("Processed order data:", orderData);
        setOrders(orderData);
      } else {
        setOrders([]);
        toast.error(response?.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Order fetch error:", error);
      setOrders([]);
      toast.error(error?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderUpdate = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filterOrdersByStatus = (status) => {
    if (!orders || orders.length === 0) {
      return [];
    }

    if (status === "active") {
      return orders.filter(
        (order) =>
          order.status.toLowerCase() !== "cancelled" &&
          order.status.toLowerCase() !== "delivered" &&
          order.status.toLowerCase() !== "completed"
      );
    } else if (status === "cancelled") {
      return orders.filter(
        (order) => order.status.toLowerCase() === "cancelled"
      );
    } else if (status === "completed") {
      return orders.filter(
        (order) =>
          order.status.toLowerCase() === "delivered" ||
          order.status.toLowerCase() === "completed"
      );
    }
    return [];
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const filteredOrders = filterOrdersByStatus(activeTab);

  return (
    <OrderListScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            <Title titleText={"My Orders"} />
            {authError ? (
              <div className="orders-empty">
                <h3 className="text-xl mb-3">Authentication Required</h3>
                <p className="mb-4">
                  You must be logged in to view your orders.
                </p>
                <Link
                  to="/sign_in"
                  className="btn bg-sea-green text-white px-4 py-2 rounded"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="order-tabs">
                <div className="order-tabs-heads">
                  <button
                    type="button"
                    className={`order-tabs-head text-xl italic ${
                      activeTab === "active" ? "order-tabs-head-active" : ""
                    }`}
                    onClick={() => handleTabChange("active")}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    className={`order-tabs-head text-xl italic ${
                      activeTab === "cancelled" ? "order-tabs-head-active" : ""
                    }`}
                    onClick={() => handleTabChange("cancelled")}
                  >
                    Cancelled
                  </button>
                  <button
                    type="button"
                    className={`order-tabs-head text-xl italic ${
                      activeTab === "completed" ? "order-tabs-head-active" : ""
                    }`}
                    onClick={() => handleTabChange("completed")}
                  >
                    Completed
                  </button>
                </div>

                <div className="order-tabs-contents">
                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="order-tabs-content">
                      {Array.isArray(filteredOrders) &&
                      filteredOrders.length > 0 ? (
                        <OrderItemList
                          orders={filteredOrders}
                          onOrderUpdate={handleOrderUpdate}
                        />
                      ) : (
                        <div className="orders-empty">
                          <h3 className="text-xl mb-2">
                            No {activeTab} orders found
                          </h3>
                          <p>When you place orders, they will appear here</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </UserContent>
        </UserDashboardWrapper>
      </Container>
    </OrderListScreenWrapper>
  );
};

export default OrderListScreen;
