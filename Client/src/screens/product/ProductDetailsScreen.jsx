import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import ProductPreview from "../../components/product/ProductPreview";
import { Link } from "react-router-dom";
import { BaseLinkGreen } from "../../styles/button";
import { currencyFormat } from "../../utils/helper";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import ProductDescriptionTab from "../../components/product/ProductDescriptionTab";
import ProductSimilar from "../../components/product/ProductSimilar";
import ProductServices from "../../components/product/ProductServices";
import ModalLoading from "../../components/common/ModalLoading";
import { getProductBySlug } from "../../services/productService";
import { addToCart, refreshCartCount } from "../../services/cartService";
import {
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../services/wishlistService";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { updateCartSuccess } from "../../redux/slices/userSlice";

const DetailsScreenWrapper = styled.main`
  margin: 40px 0;
`;

const DetailsContent = styled.div`
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;

  @media (max-width: ${breakpoints.xl}) {
    gap: 24px;
    grid-template-columns: 3fr 2fr;
  }

  @media (max-width: ${breakpoints.lg}) {
    grid-template-columns: 100%;
  }
`;

const ProductDetailsWrapper = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 24px;

  @media (max-width: ${breakpoints.sm}) {
    padding: 16px;
  }

  @media (max-width: ${breakpoints.xs}) {
    padding: 12px;
  }

  .prod-title {
    margin-bottom: 10px;
  }
  .rating-and-comments {
    column-gap: 16px;
    margin-bottom: 20px;
  }
  .prod-rating {
    column-gap: 10px;
  }
  .prod-comments {
    column-gap: 10px;
  }
  .prod-add-btn {
    min-width: 160px;
    column-gap: 8px;
    &-text {
      margin-top: 2px;
    }
  }

  .btn-and-price {
    margin-top: 36px;
    column-gap: 16px;
    row-gap: 10px;

    @media (max-width: ${breakpoints.sm}) {
      margin-top: 24px;
    }
  }
`;

const ProductSizeWrapper = styled.div`
  .prod-size-top {
    gap: 20px;
    margin-top: 20px;
  }
  .prod-size-list {
    gap: 12px;
    margin-top: 16px;
    @media (max-width: ${breakpoints.sm}) {
      gap: 8px;
    }
  }

  .prod-size-item {
    position: relative;
    width: 51px;
    height: 51px;
    cursor: pointer;

    @media (max-width: ${breakpoints.sm}) {
      width: 32px;
      height: 32px;
    }

    input {
      position: absolute;
      top: 0;
      left: 0;
      width: 51px;
      height: 51px;
      opacity: 0;
      cursor: pointer;
      margin-left: 10px;

      @media (max-width: ${breakpoints.sm}) {
        width: 32px;
        height: 32px;
      }

      &:checked + span {
        color: ${defaultTheme.color_white};
        background-color: ${defaultTheme.color_outerspace};
        border-color: ${defaultTheme.color_outerspace};
      }

      &:disabled + span {
        opacity: 0.4;
        cursor: not-allowed;
        text-decoration: line-through;
      }
    }

    span {
      width: 51px;
      height: 51px;
      border-radius: 8px;
      border: 1.5px solid ${defaultTheme.color_silver};
      text-transform: uppercase;
      font-size: 16px !important;

      @media (max-width: ${breakpoints.sm}) {
        width: 32px;
        height: 32px;
      }
    }
  }
`;

const ProductColorWrapper = styled.div`
  margin-top: 32px;

  @media (max-width: ${breakpoints.sm}) {
    margin-top: 24px;
  }

  .prod-colors-top {
    margin-bottom: 16px;
  }

  .prod-colors-list {
    column-gap: 12px;
  }

  .prod-colors-item {
    position: relative;
    width: 34px;
    height: 34px;
    transition: ${defaultTheme.default_transition};
    border-radius: 100%;
    padding: 2px;
    border: 3px solid #f3f3f3;

    &:hover {
      scale: 1.1;
    }

    input {
      position: absolute;
      top: 0;
      left: 0;
      width: 30px;
      height: 30px;
      opacity: 0;
      cursor: pointer;

      &:checked + span {
        outline: none;
      }

      &:checked ~ .prod-colors-item {
        border-color: ${defaultTheme.color_outerspace};
      }
    }

    .prod-colorbox {
      border-radius: 100%;
      width: 100%;
      height: 100%;
      display: inline-block;
    }

    &.selected {
      border-color: ${defaultTheme.color_outerspace};
    }
  }
`;

const ErrorWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: red;
  font-size: 18px;
`;

const MaterialsWrapper = styled.div`
  margin-top: 16px;

  .materials-title {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .materials-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .material-item {
    background-color: beige;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    &:nth-child(2) {
      background-color: darkkhaki;
    }
  }
`;

const ProductDetailsScreen = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const result = await getProductBySlug(slug);

        if (result?.success && result?.data) {
          setProduct(result.data);

          // Set default selected color to first variant
          if (result.data.variants && result.data.variants.length > 0) {
            setSelectedColor(result.data.variants[0].color);
            setSelectedVariant(result.data.variants[0]);
          }
        } else {
          setError("Failed to fetch product details");
        }
      } catch (err) {
        setError("An error occurred while fetching product details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductDetail();
    }
  }, [slug]);

  // Update selected variant when color changes
  useEffect(() => {
    if (product && selectedColor) {
      const variant = product.variants.find((v) => v.color === selectedColor);
      if (variant) {
        setSelectedVariant(variant);
        // Find first size that has stock
        const firstAvailableSize = variant.sizes.find((s) => s.stock > 0);
        if (firstAvailableSize) {
          setSelectedSize(firstAvailableSize.size);
        } else {
          setSelectedSize(""); // Reset size if no sizes are in stock
        }
      }
    }
  }, [selectedColor, product]);

  // Check if product is in wishlist when it loads
  useEffect(() => {
    if (product && product._id) {
      setInWishlist(isInWishlist(product._id));
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (!currentUser) {
      toast.error("Please login to add items to cart");
      navigate("/sign_in");
      return;
    }

    try {
      const cartItem = {
        product_id: product._id,
        name: product.name,
        slug: product.slug,
        thumb: product.thumb,
        price: {
          original: product.price.original,
          discount: product.price.discount,
        },
        color: selectedColor,
        size: selectedSize,
        quantity: 1,
      };

      const response = await addToCart(cartItem);

      if (response.success) {
        // Update Redux store with new cart
        if (response.cart) {
          dispatch(updateCartSuccess(response.cart));
        }

        // Refresh cart count
        refreshCartCount();

        toast.success("Item added to cart successfully");
        navigate("/cart");
      } else {
        // Nếu cần đăng nhập, chuyển hướng đến trang đăng nhập
        if (response.redirectToLogin) {
          navigate("/sign_in", {
            state: { redirect: `/product/${product.slug}` },
          });
        } else {
          toast.error(response.message || "Failed to add item to cart");
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product._id);
      setInWishlist(false);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(product);
      setInWishlist(true);
      toast.success("Added to wishlist");
    }

    // Dispatch storage event to update counts across components
    window.dispatchEvent(new Event("storage"));
  };

  if (error) {
    return (
      <DetailsScreenWrapper>
        <Container>
          <ErrorWrapper>{error || "Product not found"}</ErrorWrapper>
        </Container>
      </DetailsScreenWrapper>
    );
  }

  // If no product data yet, show a loading placeholder for breadcrumbs
  const breadcrumbItems = !product
    ? [
        { label: "Home", link: "/" },
        { label: "Loading...", link: "" },
      ]
    : [
        { label: "Home", link: "/" },
        ...(product.category_id && product.category_id.length > 0
          ? [
              {
                label: product.category_id[0].name,
                link: `/category/${product.category_id[0].slug}`,
              },
            ]
          : []),
        { label: product.name, link: "" },
      ];

  // Get stock for selected size
  const getStockForSelectedSize = () => {
    if (!selectedVariant || !selectedSize) return 0;

    const sizeObj = selectedVariant.sizes.find((s) => s.size === selectedSize);
    return sizeObj ? sizeObj.stock : 0;
  };

  const stockCount = getStockForSelectedSize();

  return (
    <DetailsScreenWrapper>
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        {loading ? (
          <ModalLoading />
        ) : (
          <>
            <DetailsContent className="grid">
              {selectedVariant && (
                <ProductPreview previewImages={selectedVariant.images} />
              )}
              <ProductDetailsWrapper>
                <h2 className="prod-title">{product.name}</h2>
                <div
                  className="prod-price text-xl font-bold text-outerspace "
                  style={{ marginBottom: "10px" }}
                >
                  {product.price.discount &&
                  product.price.discount !== product.price.original ? (
                    <>
                      <span
                        className="text-4xl font-normal"
                        style={{ marginRight: "10px" }}
                      >
                        {currencyFormat(product.price.discount)}
                      </span>
                      <span
                        className="text-3xl line-through ml-2 font-normal "
                        style={{
                          opacity: 0.6,
                          color: "#666",
                          textDecoration: "line-through",
                        }}
                      >
                        {currencyFormat(product.price.original)}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-normal">
                      {currencyFormat(product.price.original)}
                    </span>
                  )}
                </div>
                <div className="flex items-center rating-and-comments flex-wrap">
                  <div className="prod-comments flex items-start">
                    <span className="prod-comment-icon text-gray">
                      <i className="bi bi-chat-left-text"></i>
                    </span>
                    <span className="prod-comment-text text-sm text-gray">
                      {product.comment?.length || 0} comment(s)
                    </span>
                  </div>
                </div>

                {product.material_id &&
                  Array.isArray(product.material_id) &&
                  product.material_id.length > 0 && (
                    <MaterialsWrapper>
                      <p className="materials-title">Materials:</p>
                      <div className="materials-list">
                        {product.material_id.map((material) => (
                          <span
                            key={material._id || Math.random()}
                            className="material-item"
                          >
                            {material.name || "Unknown Material"}
                          </span>
                        ))}
                      </div>
                    </MaterialsWrapper>
                  )}

                <ProductColorWrapper>
                  <div className="prod-colors-top flex items-center flex-wrap">
                    <p className="text-lg font-semibold text-outerspace">
                      Colors Available :
                    </p>
                  </div>
                  <div className="prod-colors-list flex items-center">
                    {product.variants.map((variant, index) => (
                      <div
                        className={`prod-colors-item ${
                          selectedColor === variant.color ? "selected" : ""
                        }`}
                        key={index}
                      >
                        <input
                          type="radio"
                          name="colors"
                          checked={selectedColor === variant.color}
                          onChange={() => setSelectedColor(variant.color)}
                        />
                        <span
                          className="prod-colorbox"
                          style={{ background: variant.color }}
                        ></span>
                      </div>
                    ))}
                  </div>
                </ProductColorWrapper>

                <ProductSizeWrapper>
                  <div className="prod-size-top flex items-center flex-wrap">
                    <p className="text-lg font-semibold text-outerspace">
                      Select size :
                    </p>
                    <Link to="/" className="text-sm text-gray font-medium">
                      Size Guide &nbsp; <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                  <div className="prod-size-list flex items-center">
                    {selectedVariant &&
                      selectedVariant.sizes.map((sizeObj, index) => (
                        <div
                          className="prod-size-item"
                          key={index}
                          title={
                            sizeObj.stock === 0
                              ? "Out of stock"
                              : `${sizeObj.stock} in stock`
                          }
                        >
                          <input
                            type="radio"
                            name="size"
                            checked={selectedSize === sizeObj.size}
                            onChange={() => setSelectedSize(sizeObj.size)}
                            disabled={sizeObj.stock === 0}
                          />
                          <span className="flex items-center justify-center font-medium text-outerspace text-sm">
                            {sizeObj.size}
                          </span>
                        </div>
                      ))}
                  </div>
                </ProductSizeWrapper>

                <div className="btn-and-price flex items-center flex-wrap">
                  <button
                    type="button"
                    className={`wishlist-button flex items-center gap-2 mt-4 mb-2 py-2 px-4 border rounded-md ${
                      inWishlist
                        ? "border-red-300 text-red-500 bg-red-50"
                        : "border-gray-300 text-gray-600 bg-white"
                    }`}
                    onClick={handleWishlistToggle}
                  >
                    <i
                      className={`bi ${
                        inWishlist ? "bi-heart-fill" : "bi-heart"
                      }`}
                    ></i>
                    <span>
                      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    </span>
                  </button>
                  <BaseLinkGreen
                    as="button"
                    onClick={handleAddToCart}
                    className="prod-add-btn"
                    disabled={!selectedSize || stockCount === 0}
                  >
                    <span className="prod-add-btn-icon">
                      <i className="bi bi-cart2"></i>
                    </span>
                    <span className="prod-add-btn-text">Add to cart</span>
                  </BaseLinkGreen>
                </div>
                <ProductServices />
              </ProductDetailsWrapper>
            </DetailsContent>
            <ProductDescriptionTab
              description={product.description}
              productId={product._id}
            />
          </>
        )}
      </Container>
    </DetailsScreenWrapper>
  );
};

export default ProductDetailsScreen;
