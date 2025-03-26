import { PropTypes } from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { commonCardStyles } from "../../styles/card";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { currencyFormat } from "../../utils/helper";
import { useState, useEffect } from "react";
import {
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../services/wishlistService";
import { store } from "../../redux/store";
import { toast } from "react-hot-toast";

const ProductCardWrapper = styled(Link)`
  ${commonCardStyles}
  @media(max-width: ${breakpoints.sm}) {
    padding-left: 0;
    padding-right: 0;
  }

  .product-img {
    height: 393px;
    position: relative;

    @media (max-width: ${breakpoints.sm}) {
      height: 320px;
    }
  }

  .product-wishlist-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 100%;
    z-index: 2;
    transition: all 0.2s ease;

    &:hover {
      background-color: ${defaultTheme.color_yellow};
      color: ${defaultTheme.color_white};
    }

    &.in-wishlist {
      color: ${defaultTheme.color_danger};

      &:hover {
        background-color: #fce4e4;
        color: ${defaultTheme.color_danger};
      }
    }
  }

  .product-price {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .price-original {
    font-size: 14px;
    text-decoration: line-through;
    opacity: 0.6;
    color: #666;
  }

  .price-discount {
    font-size: 15px;
    font-weight: bold;
    color: ${defaultTheme.color_outerspace};
  }
`;

const ProductItem = ({ product }) => {
  const [inWishlist, setInWishlist] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if product is in wishlist on component mount
    setInWishlist(isInWishlist(product._id));
  }, [product._id]);

  const handleWishlistClick = (e) => {
    e.preventDefault(); // Prevent navigation to product details
    e.stopPropagation(); // Prevent event bubbling

    // Check if user is logged in
    const currentUser = store.getState().user.currentUser;

    if (!currentUser) {
      // User is not logged in, redirect to login page with return URL
      toast.error("Please login to add items to your wishlist");

      // Get current path to return after login
      const returnUrl = window.location.pathname;
      navigate(`/sign_in?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (inWishlist) {
      removeFromWishlist(product._id);
      setInWishlist(false);
    } else {
      addToWishlist(product);
      setInWishlist(true);
    }

    // Dispatch storage event to update counts across components
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <ProductCardWrapper key={product.id} to={`/product/${product.slug}`}>
      <div className="product-img">
        <img
          className="object-fit-cover"
          src={product.thumb}
          alt={product.name}
        />
        <button
          type="button"
          className={`product-wishlist-icon flex items-center justify-center bg-white ${
            inWishlist ? "in-wishlist" : ""
          }`}
          onClick={handleWishlistClick}
        >
          <i className={`bi ${inWishlist ? "bi-heart-fill" : "bi-heart"}`}></i>
        </button>
      </div>
      <div className="product-info">
        <p className="font-bold">{product.name}</p>
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-gray">
            {product?.material_id && Array.isArray(product.material_id)
              ? product.material_id.map((item, index) => (
                  <span key={item._id || index}>
                    {item.name}
                    {index < product.material_id.length - 1 ? ", " : ""}
                  </span>
                ))
              : ""}
          </span>
          <div className="product-price">
            {product.price.discount &&
            product.price.discount !== product.price.original ? (
              <>
                <span className="price-discount ">
                  {currencyFormat(product.price.discount)}
                </span>
                <span className="price-original">
                  {currencyFormat(product.price.original)}
                </span>
              </>
            ) : (
              <span className="price-discount">
                {currencyFormat(product.price.original)}
              </span>
            )}
          </div>
        </div>
      </div>
    </ProductCardWrapper>
  );
};

export default ProductItem;

ProductItem.propTypes = {
  product: PropTypes.object,
};
