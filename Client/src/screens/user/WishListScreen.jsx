import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { currencyFormat } from "../../utils/helper";
import { BaseLinkBlack, BaseButtonOuterspace } from "../../styles/button";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromWishlist,
  getWishlistItems,
  clearWishlist,
} from "../../services/wishlistService";
import { Link, useNavigate } from "react-router-dom";
import WishListEmptyScreen from "./WishListEmptyScreen";
import { addToCart } from "../../services/cartService";
import { toast } from "react-hot-toast";

const WishListScreenWrapper = styled.main`
  .wishlist {
    gap: 20px;
  }
`;

const WishItemWrapper = styled.div`
  gap: 30px;
  max-width: 900px;
  position: relative;

  @media (max-width: ${breakpoints.xl}) {
    column-gap: 20px;
  }

  @media (max-width: ${breakpoints.lg}) {
    column-gap: 16px;
  }

  @media (max-width: ${breakpoints.xs}) {
    flex-direction: column;
    gap: 12px;
  }

  .wish-item-img {
    column-gap: 30px;

    @media (max-width: ${breakpoints.xl}) {
      column-gap: 20px;
    }

    @media (max-width: ${breakpoints.lg}) {
      column-gap: 16px;
    }

    &-wrapper {
      min-width: 110px;
      width: 110px;
      border-radius: 4px;
      overflow: hidden;

      @media (max-width: ${breakpoints.xs}) {
        min-width: 100%;
        height: 180px;

        img {
          object-position: top;
        }
      }
    }

    .wish-remove-btn {
      width: 20px;
      min-width: 20px;
      height: 20px;
      border: 1px solid ${defaultTheme.color_outerspace};
      border-radius: 50%;
      font-size: 10px;
      margin-top: auto;
      margin-bottom: auto;

      &:hover {
        background-color: ${defaultTheme.color_gray};
        color: ${defaultTheme.color_white};
        border-color: ${defaultTheme.color_gray};
      }

      @media (max-width: ${breakpoints.sm}) {
        position: absolute;
        right: -10px;
        top: -10px;
      }

      @media (max-width: ${breakpoints.xs}) {
        right: 6px;
        top: 6px;
        background-color: ${defaultTheme.color_jet};
        color: ${defaultTheme.color_white};
      }
    }
  }

  .wish-item-info {
    flex: 1;

    @media (max-width: ${breakpoints.sm}) {
      flex-direction: column;
      row-gap: 8px;
    }

    &-l {
      row-gap: 4px;

      ul {
        row-gap: 4px;
        li {
          span {
            &:last-child {
              margin-left: 4px;
            }
          }
        }
      }
    }

    &-r {
      column-gap: 40px;

      @media (max-width: ${breakpoints.xl}) {
        column-gap: 20px;
      }

      @media (max-width: ${breakpoints.lg}) {
        flex-direction: column;
        align-items: flex-end;
        row-gap: 8px;
      }

      @media (max-width: ${breakpoints.sm}) {
        flex-direction: row;
        align-items: center;
      }

      .wish-item-price {
        @media (max-width: ${breakpoints.sm}) {
          order: 2;
        }
      }

      .wish-cart-btn {
        @media (max-width: ${breakpoints.sm}) {
          order: 1;
        }
      }
    }
  }
`;

const breadcrumbItems = [
  { label: "Home", link: "/" },
  { label: "Wishlist", link: "/wishlist" },
];

const WishListScreen = () => {
  const wishlist = useSelector((state) => state.wishlist || { items: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load wishlist items on component mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        // This will update Redux store with items from API if logged in
        await getWishlistItems();
      } catch (error) {
        console.error("Error loading wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      console.log("Removing from wishlist:", productId);
      const result = await removeFromWishlist(productId);
      console.log("Remove result:", result);

      if (result.success) {
        toast.success("Product removed from wishlist");
        // Manually trigger a wishlist update event
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        toast.error(result.message || "Failed to remove product from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove product from wishlist");
    }
  };

  const handleAddToCart = (product) => {
    // Create a cart item from the wishlist item, with safe property access
    const cartItem = {
      product_id: product._id,
      name: product.name || "Unknown Product",
      price: product.price || { original: 0, discount: 0 },
      thumb: product.thumb || "",
      color:
        product.category_id &&
        Array.isArray(product.category_id) &&
        product.category_id.length > 0 &&
        product.category_id[0].name
          ? product.category_id[0].name
          : "Default",
      size: "M", // Default size
      quantity: 1,
      slug: product.slug || "",
    };

    // Add to cart
    addToCart(cartItem);
    toast.success("Product added to cart");
    // Navigate to cart
    navigate("/cart");
  };

  const handleClearWishlist = async () => {
    try {
      const result = await clearWishlist();
      if (result.success) {
        toast.success("Wishlist cleared successfully");
        // Manually trigger a wishlist update event
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        toast.error(result.message || "Failed to clear wishlist");
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Failed to clear wishlist");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="page-py-spacing text-center">Loading wishlist...</div>
    );
  }

  // If wishlist is empty, show empty screen
  if (!wishlist?.items || wishlist.items.length === 0) {
    return <WishListEmptyScreen />;
  }

  // Debug wishlist items
  console.log(
    "Wishlist items:",
    wishlist.items.map((item) => ({
      _id: item._id,
      product_id: item.product_id,
      name: item.name,
    }))
  );

  return (
    <WishListScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            <div className="flex justify-between items-center mb-4">
              <Title titleText={"Wishlist"} />
              <BaseButtonOuterspace onClick={handleClearWishlist}>
                Clear All
              </BaseButtonOuterspace>
            </div>
            <div className="wishlist grid">
              {wishlist.items.map((item, index) => (
                <WishItemWrapper
                  className="wish-item flex"
                  key={item._id || index}
                >
                  <div className="wish-item-img flex items-stretch">
                    <button
                      type="button"
                      className="wish-remove-btn"
                      onClick={() =>
                        handleRemoveFromWishlist(item.product_id || item._id)
                      }
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                    <div className="wish-item-img-wrapper">
                      <img
                        src={item.thumb || ""}
                        className="object-fit-cover"
                        alt={item.name || "Product"}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/100x100?text=No+Image";
                        }}
                      />
                    </div>
                  </div>
                  <div className="wish-item-info flex justify-between">
                    <div className="wish-item-info-l flex flex-col">
                      <Link
                        to={`/product/${item.slug || ""}`}
                        className="wish-item-title text-xl font-bold text-outerspace"
                      >
                        {item.name || "Unknown Product"}
                      </Link>
                      <ul className="flex flex-col">
                        <li>
                          <span className="text-lg font-bold">Category:</span>
                          <span className="text-lg text-gray font-medium capitalize">
                            {item.category_name
                              ? item.category_name
                              : item.category_id &&
                                Array.isArray(item.category_id) &&
                                item.category_id.length > 0 &&
                                item.category_id[0].name
                              ? item.category_id[0].name
                              : "N/A"}
                          </span>
                        </li>
                        <li>
                          <span className="text-lg font-bold">Added on:</span>
                          <span className="text-lg text-gray font-medium">
                            {item.addedAt
                              ? new Date(item.addedAt).toLocaleDateString()
                              : "Unknown date"}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="wish-item-info-r flex items-center">
                      <span className="wish-item-price text-xl text-gray font-bold">
                        {item.price &&
                        (item.price.discount || item.price.original)
                          ? currencyFormat(
                              item.price.discount || item.price.original
                            )
                          : "$0.00"}
                      </span>
                      <button
                        className="wish-cart-btn bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </WishItemWrapper>
              ))}
            </div>
          </UserContent>
        </UserDashboardWrapper>
      </Container>
    </WishListScreenWrapper>
  );
};

export default WishListScreen;
