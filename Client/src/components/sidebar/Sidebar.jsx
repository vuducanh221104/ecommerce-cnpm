import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { SiteBrandWrapper } from "../../styles/header";
import { staticImages } from "../../utils/images";
import { Input, InputGroupWrapper } from "../../styles/form";
import { sideMenuData } from "../../data/data";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsSidebarOpen,
  toggleSidebar,
} from "../../redux/slices/sidebarSlice";
import { useState, useEffect } from "react";
import { searchProductsByQuery } from "../../services/productService";

const SideNavigationWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  z-index: 999;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
  padding: 16px;
  transform: translateX(-100%);
  transition: ${defaultTheme.default_transition};

  &.show {
    transform: translateX(0);
  }

  .sidebar-close-btn {
    position: absolute;
    right: 16px;
    top: 16px;
    &:hover {
      color: ${defaultTheme.color_sea_green};
    }
  }

  .sidenav-search-form {
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    margin-top: 20px;
    position: relative;

    .input-group {
      min-width: 100%;
      column-gap: 0;
    }
  }

  .sidenav-menu-list {
    gap: 14px;
    margin: 20px 0;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding: 24px 0;

    li {
      padding: 5px 5px 5px 12px;
      border-radius: 4px;
      transition: ${defaultTheme.default_transition};

      &:hover {
        background: rgba(0, 0, 0, 0.05);

        a {
          span {
            color: ${defaultTheme.color_sea_green};
          }
        }
      }
    }

    a {
      column-gap: 16px;
      &.active {
        color: ${defaultTheme.color_sea_green};
      }
    }
  }

  @media (max-width: ${breakpoints.xs}) {
    width: 100%;
  }
`;

const SidebarSearchDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
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
          color: ${defaultTheme.color_danger};
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
      color: ${defaultTheme.color_primary};
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

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSidebarOpen = useSelector(selectIsSidebarOpen);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState({
    products: [],
    categories: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(query.length >= 1);
  };

  const handleSearchItemClick = (item) => {
    // Navigate to product page if it has a slug
    if (item.slug) {
      navigate(`/product/${item.slug}`);
      dispatch(toggleSidebar()); // Close sidebar after navigation
    } else if (item.category_id && item.category_id.length > 0) {
      // Use the first category as fallback
      const firstCategory = item.category_id[0];
      navigate(`/category/${firstCategory.slug}`);
      dispatch(toggleSidebar()); // Close sidebar after navigation
    }
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.slug}`);
    setShowDropdown(false);
    setSearchQuery("");
    dispatch(toggleSidebar()); // Close sidebar after navigation
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
      dispatch(toggleSidebar()); // Close sidebar after search
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".sidenav-search-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <SideNavigationWrapper
      className={`bg-white h-full ${isSidebarOpen ? "show" : ""}`}
    >
      <button
        className="sidebar-close-btn text-3xl"
        onClick={() => dispatch(toggleSidebar())}
      >
        <i className="bi bi-x-square"></i>
      </button>
      <div className="sidenav-head">
        <SiteBrandWrapper to="/" className="inline-flex">
          <div className="brand-img-wrap flex items-center justify-center">
            <img className="site-brand-img" src={staticImages.logo} />
          </div>
          <span className="site-brand-text text-outerspace">achats.</span>
        </SiteBrandWrapper>
        <form
          className="sidenav-search-form sidenav-search-container"
          onSubmit={handleSearchSubmit}
        >
          <InputGroupWrapper className="input-group">
            <span className="input-icon flex items-center justify-center text-xl text-gray">
              <i className="bi bi-search"></i>
            </span>
            <Input
              type="text"
              className="input-control w-full"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
            />

            {showDropdown && (
              <SidebarSearchDropdown>
                {loading ? (
                  <div
                    className="search-loading"
                    style={{ padding: "15px 0 15px 0" }}
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
                          <div className="search-item-name">{product.name}</div>
                          <div className="search-item-price">
                            <span className="original-price">
                              ${product.price.original}
                            </span>
                            <span className="discount-price">
                              $
                              {product.price.discount || product.price.original}
                            </span>
                          </div>
                        </div>
                        <div className="search-item-category">
                          {product.category_id && product.category_id.length > 0
                            ? product.category_id[0].name
                            : "Product"}
                        </div>
                      </div>
                    ))}

                    <div className="search-footer">
                      <Link
                        to={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => {
                          setShowDropdown(false);
                          dispatch(toggleSidebar());
                        }}
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
              </SidebarSearchDropdown>
            )}
          </InputGroupWrapper>
        </form>
        <ul className="sidenav-menu-list grid">
          {sideMenuData?.map((menu) => (
            <li key={menu.id}>
              <Link
                to={menu.menuLink}
                className={`flex items-center text-gray ${
                  location.pathname === menu.menuLink ? "active" : ""
                }`}
              >
                <span className="text-xxl">
                  <i className={`bi bi-${menu.iconName}`}></i>
                </span>
                <span className="text-lg font-medium">{menu.menuText}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </SideNavigationWrapper>
  );
};

export default Sidebar;
