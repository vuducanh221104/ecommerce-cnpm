import styled from "styled-components";
import { BaseButtonGreen } from "../../styles/button";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { currencyFormat } from "../../utils/helper";
import { PropTypes } from "prop-types";

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
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      // Get the appropriate price (discount or original)
      const itemPrice = item.price.discount || item.price.original;
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
      <BaseButtonGreen type="submit" className="checkout-btn">
        Proceed To Checkout
      </BaseButtonGreen>
    </CartSummaryWrapper>
  );
};

export default CartSummary;

CartSummary.propTypes = {
  cartItems: PropTypes.array,
};
