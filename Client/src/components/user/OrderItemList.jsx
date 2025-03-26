import OrderItem from "./OrderItem";
import PropTypes from "prop-types";

const OrderItemList = ({ orders, onOrderUpdate }) => {
  return (
    <div>
      {orders?.map((order) => (
        <OrderItem
          key={order._id}
          order={order}
          onOrderUpdate={onOrderUpdate}
        />
      ))}
    </div>
  );
};

export default OrderItemList;

OrderItemList.propTypes = {
  orders: PropTypes.array,
  onOrderUpdate: PropTypes.func,
};
