import styled from "styled-components";
import { HeaderMainWrapper, SiteBrandWrapper } from "../../styles/header";
import { Container } from "../../styles/styles";
import { staticImages } from "../../utils/images";
import { navMenuData } from "../../data/data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input as FormInput } from "../../styles/form";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../../redux/slices/sidebarSlice";
import { store } from "../../redux/store";
import { useState, useEffect, useRef } from "react";
import { searchProductsByQuery } from "../../services/productService";
import { getWishlistItems } from "../../services/wishlistService";
import {
  isLoggedIn,
  logoutUser,
  getCurrentUser,
} from "../../services/authService";
import { toast } from "react-hot-toast";

const NavigationAndSearchWrapper = styled.div`
  column-gap: 20px;
  .search-form {
    @media (max-width: ${breakpoints.lg}) {
      width: 100%;
      max-width: 500px;
    }
    @media (max-width: ${breakpoints.sm}) {
      display: none;
    }
  }

  .input-group {
    min-width: 320px;

    .input-control {
      @media (max-width: ${breakpoints.sm}) {
        display: none;
      }
    }

    @media (max-width: ${breakpoints.xl}) {
      min-width: 160px;
    }

    @media (max-width: ${breakpoints.sm}) {
      min-width: auto;
      grid-template-columns: 100%;
    }
  }

  @media (max-width: ${breakpoints.lg}) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const NavigationMenuWrapper = styled.nav`
  .nav-menu-list {
    margin-left: 20px;

    @media (max-width: ${breakpoints.lg}) {
      flex-direction: column;
    }
  }

  .nav-menu-item {
    margin-right: 20px;
    margin-left: 20px;

    @media (max-width: ${breakpoints.xl}) {
      margin-left: 16px;
      margin-right: 16px;
    }
  }

  .nav-menu-link {
    &.active {
      color: ${defaultTheme.color_outerspace};
      font-weight: 700;
    }

    &:hover {
      color: ${defaultTheme.color_outerspace};
    }
  }

  @media (max-width: ${breakpoints.lg}) {
    position: absolute;
    top: 0;
    right: 0;
    width: 260px;
    background: ${defaultTheme.color_white};
    height: 100%;
    z-index: 999;
    display: none;
  }
`;

const IconLinksWrapper = styled.div`
  column-gap: 18px;
  .icon-link {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    position: relative;
    cursor: pointer;

    &.active {
      background-color: ${defaultTheme.color_sea_green};
      img {
        filter: brightness(100);
      }
    }

    &:hover {
      background-color: #dddddd;
    }

    .badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: ${defaultTheme.color_sea_green};
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  @media (max-width: ${breakpoints.xl}) {
    column-gap: 8px;
  }

  @media (max-width: ${breakpoints.xl}) {
    column-gap: 6px;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  .input-icon {
    position: absolute;
    left: 12px;
    color: ${(props) => props.theme.text_gray};
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px 8px 40px;
  border: 1px solid ${(props) => props.theme.border_light};
  border-radius: 6px;
  outline: none;
  font-size: 14px;

  &:focus {
    border-color: ${(props) => props.theme.color_primary};
  }
`;

const SearchDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  margin-top: 2px;

  .search-category {
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    background-color: #f9f9f9;
    text-transform: uppercase;
  }

  .search-item {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
    transition: all 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #f5f5f5;
    }

    .search-item-image {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      object-fit: cover;
      margin-right: 12px;
    }

    .search-item-info {
      flex: 1;

      .search-item-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
        color: #333;
      }

      .search-item-price {
        font-size: 12px;
        color: #666;

        .original-price {
          text-decoration: line-through;
          color: #999;
          margin-right: 8px;
        }

        .discount-price {
          color: ${(props) => props.theme.color_danger};
          font-weight: 600;
        }
      }
    }

    .search-item-category {
      font-size: 11px;
      background: #f0f0f0;
      padding: 3px 6px;
      border-radius: 4px;
      color: #666;
    }
  }

  .search-footer {
    padding: 10px 16px;
    text-align: center;
    background-color: #f9f9f9;
    border-top: 1px solid #eee;

    a {
      color: ${(props) => props.theme.color_primary};
      font-size: 14px;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .no-results {
    padding: 20px 16px;
    text-align: center;
    color: #666;
    font-size: 14px;
  }
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 220px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 16px 0;
  z-index: 100;
  margin-top: 10px;

  &:before {
    content: "";
    position: absolute;
    top: -6px;
    right: 20px;
    width: 12px;
    height: 12px;
    background-color: white;
    transform: rotate(45deg);
    box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.04);
  }

  .menu-header {
    padding: 0 16px 12px;
    border-bottom: 1px solid ${defaultTheme.color_anti_flash_white};
    margin-bottom: 8px;

    .user-name {
      font-weight: 600;
      font-size: 16px;
      color: ${defaultTheme.color_outerspace};
      margin-bottom: 4px;
    }

    .user-email {
      font-size: 14px;
      color: ${defaultTheme.color_gray};
      word-break: break-all;
    }
  }

  .menu-items {
    list-style: none;

    .menu-item {
      display: block;
      padding: 10px 16px;
      color: ${defaultTheme.color_outerspace};
      transition: all 0.2s ease;

      &:hover {
        background-color: ${defaultTheme.color_anti_flash_white};
      }

      &.danger {
        color: ${defaultTheme.color_danger};
      }

      i {
        margin-right: 8px;
      }
    }
  }
`;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState({
    products: [],
    categories: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const userIconRef = useRef(null);

  // Get wishlist count directly from Redux state
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;

  // Get cart count directly from Redux state
  const cartItems = useSelector((state) => state.user.cart || []);
  const cartCount = cartItems.length;

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(isLoggedIn());
    };

    // Initial check
    checkAuth();

    // Listen for storage events (login/logout from other tabs)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Listen for wishlist updates (from other components/actions)
  useEffect(() => {
    const handleWishlistUpdate = () => {
      // The wishlistCount will update automatically through useSelector
      // but we need this listener for events triggered from other components
      console.log("Wishlist updated event received");
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, []);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      // The cartCount will update automatically through useSelector
      // but we need this listener for events triggered from other components
      console.log("Cart updated event received");
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  // Fetch search results when searchQuery changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults({ products: [], categories: [] });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch limited results for dropdown (4 items)
        const response = await searchProductsByQuery(searchQuery, 4);

        if (response.success) {
          setSearchResults({
            products: response.data.products || [],
            categories: response.data.categories || [],
          });
        } else {
          setError("Failed to fetch search results");
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("An error occurred while searching");
      } finally {
        setLoading(false);
      }
    };

    // Use debounce to avoid excessive API calls
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 1) {
        fetchSearchResults();
      }
    }, 600);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Xử lý đóng dropdown menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userIconRef.current && !userIconRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(query.length >= 1);
  };

  const handleSearchItemClick = (item) => {
    // Navigate to product page if it has a slug
    if (item.slug) {
      navigate(`/product/${item.slug}`);
    } else if (item.category_id && item.category_id.length > 0) {
      // Use the first category as fallback
      const firstCategory = item.category_id[0];
      navigate(`/category/${firstCategory.slug}`);
    }
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.slug}`);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
    }
  };

  // Xử lý toggle menu người dùng
  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUserMenuOpen(false);
      toast.success("Đăng xuất thành công");
      navigate("/");
    } catch (error) {
      toast.error("Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  return (
    <HeaderMainWrapper className="header flex items-center">
      <Container className="container">
        <div className="header-wrap flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="sidebar-toggler"
              onClick={() => dispatch(toggleSidebar())}
            >
              <i className="bi bi-list"></i>
            </button>
            <SiteBrandWrapper to="/" className="inline-flex">
              <div className="brand-img-wrap flex items-center justify-center">
                <img
                  className="site-brand-img"
                  src={staticImages.logo}
                  alt="site logo"
                />
              </div>
              <span className="site-brand-text text-outerspace">
                BEELZEBUB.
              </span>
            </SiteBrandWrapper>
          </div>
          <NavigationAndSearchWrapper className="flex items-center">
            <NavigationMenuWrapper>
              <ul className="nav-menu-list flex items-center">
                {navMenuData?.map((menu) => {
                  return (
                    <li className="nav-menu-item" key={menu.id}>
                      <Link
                        to={menu.menuLink}
                        className="nav-menu-link text-base font-medium text-gray"
                      >
                        {menu.menuText}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </NavigationMenuWrapper>
            <form
              className="search-form search-container"
              onSubmit={handleSearchSubmit}
            >
              <SearchInputWrapper className="input-group">
                <span className="input-icon flex items-center justify-center text-xl text-gray">
                  <i className="bi bi-search"></i>
                </span>
                <SearchInput
                  type="text"
                  className="input-control w-full"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {showDropdown && (
                  <SearchDropdown>
                    {loading ? (
                      <div
                        className="search-loading"
                        style={{ padding: "20px 0 20px 0" }}
                      >
                        <p className="text-center py-4">Searching...</p>
                      </div>
                    ) : error ? (
                      <div className="search-error">
                        <p className="text-center py-4 text-red-500">{error}</p>
                      </div>
                    ) : searchQuery && searchResults.products.length > 0 ? (
                      <>
                        <div className="search-category">Products</div>
                        {searchResults.products.map((product) => (
                          <div
                            key={product._id}
                            className="search-item"
                            onClick={() => handleSearchItemClick(product)}
                          >
                            <img
                              src={product.thumb}
                              alt={product.name}
                              className="search-item-image"
                            />
                            <div className="search-item-info">
                              <div className="search-item-name">
                                {product.name}
                              </div>
                              <div className="search-item-price">
                                <span className="original-price">
                                  ${product.price.original}
                                </span>
                                <span className="discount-price">
                                  $
                                  {product.price.discount ||
                                    product.price.original}
                                </span>
                              </div>
                            </div>
                            <div className="search-item-category">
                              {product.category_id &&
                              product.category_id.length > 0
                                ? product.category_id[0].name
                                : "Product"}
                            </div>
                          </div>
                        ))}

                        <div className="search-footer">
                          <Link
                            to={`/search?q=${encodeURIComponent(searchQuery)}`}
                          >
                            View all results for "{searchQuery}"
                          </Link>
                        </div>
                      </>
                    ) : (
                      <div className="no-results">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </SearchDropdown>
                )}
              </SearchInputWrapper>
            </form>
          </NavigationAndSearchWrapper>

          <IconLinksWrapper className="flex items-center">
            <Link
              to="/wishlist"
              className={`icon-link ${
                location.pathname === "/wishlist" ? "active" : ""
              } inline-flex items-center justify-center`}
            >
              <img src={staticImages.heart} alt="Wishlist" />
              {wishlistCount > 0 && (
                <span className="badge">{wishlistCount}</span>
              )}
            </Link>

            <div
              ref={userIconRef}
              onClick={handleUserMenuToggle}
              className={`icon-link ${
                location.pathname === "/account" ||
                location.pathname === "/account/add" ||
                userMenuOpen
                  ? "active"
                  : ""
              } inline-flex items-center justify-center relative cursor-pointer`}
            >
              <img src={staticImages.user} alt="User Account" />
              {isAuthenticated && (
                <span
                  className="w-3 h-3 bg-green-500 rounded-full absolute top-0 right-0"
                  style={{ top: "3px", right: "3px" }}
                />
              )}

              {userMenuOpen && (
                <UserMenuDropdown>
                  {isAuthenticated ? (
                    <>
                      <div className="menu-header">
                        <div className="user-name">
                          {getCurrentUser()?.full_name ||
                            getCurrentUser()?.user_name ||
                            "User"}
                        </div>
                        <div className="user-email">
                          {getCurrentUser()?.email || ""}
                        </div>
                      </div>

                      <ul className="menu-items">
                        <li>
                          <Link
                            className="menu-item"
                            to="/account"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <i className="bi bi-person"></i> My Account
                          </Link>
                        </li>
                        <li>
                          <Link
                            className="menu-item"
                            to="/order"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <i className="bi bi-bag"></i> Orders
                          </Link>
                        </li>
                        <li>
                          <Link
                            className="menu-item"
                            to="/wishlist"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <i className="bi bi-heart"></i> Wishlist
                          </Link>
                        </li>
                        <li>
                          <button
                            className="menu-item danger w-full text-left"
                            onClick={handleLogout}
                          >
                            <i className="bi bi-box-arrow-right"></i> Logout
                          </button>
                        </li>
                      </ul>
                    </>
                  ) : (
                    <ul className="menu-items">
                      <li>
                        <Link
                          className="menu-item"
                          to="/sign_in"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <i className="bi bi-box-arrow-in-right"></i> Sign In
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="menu-item"
                          to="/sign_up"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <i className="bi bi-person-plus"></i> Sign Up
                        </Link>
                      </li>
                    </ul>
                  )}
                </UserMenuDropdown>
              )}
            </div>

            <Link
              to="/cart"
              className={`icon-link ${
                location.pathname === "/cart" ? "active" : ""
              } inline-flex items-center justify-center relative`}
            >
              <img src={staticImages.cart} alt="Cart" />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>

            <button
              type="button"
              className="sidebar-open-btn flex items-center justify-center text-white"
              onClick={() => dispatch(toggleSidebar(true))}
            >
              <i className="bi bi-text-right text-3xl"></i>
            </button>
          </IconLinksWrapper>
        </div>
      </Container>
    </HeaderMainWrapper>
  );
};

export default Header;
