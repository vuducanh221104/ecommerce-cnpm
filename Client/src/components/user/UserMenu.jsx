import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Title from "../common/Title";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useState, useEffect } from "react";
import { getCurrentUser, logoutUser } from "../../services/authService";
import { toast } from "react-hot-toast";

const NavMenuWrapper = styled.nav`
  margin-top: 32px;

  .nav-menu-list {
    row-gap: 8px;

    @media (max-width: ${breakpoints.md}) {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
  }

  .nav-menu-item {
    border-radius: 4px;

    @media (max-width: ${breakpoints.sm}) {
      flex: 1 1 0;
    }
  }

  .nav-menu-link {
    padding-left: 36px;
    width: 100%;
    height: 40px;
    column-gap: 12px;
    border: 1px solid transparent;

    &:hover {
      background-color: ${defaultTheme.color_whitesmoke};
    }

    .nav-link-text {
      color: ${defaultTheme.color_gray};
    }

    &.active {
      border-left: 2px solid ${defaultTheme.color_gray};
      background-color: ${defaultTheme.color_whitesmoke};

      @media (max-width: ${breakpoints.md}) {
        border-bottom: 2px solid ${defaultTheme.color_gray};
        border-left: 0;
        background-color: transparent;
      }
    }

    @media (max-width: ${breakpoints.md}) {
      padding-left: 16px;
      padding-right: 16px;
    }

    @media (max-width: ${breakpoints.sm}) {
      padding-left: 8px;
      padding-right: 8px;
      column-gap: 8px;
    }
  }
`;

const UserMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getCurrentUser();
    if (userData) {
      setUser(userData);
    } else {
      // Redirect to login if not logged in
      navigate("/sign_in");
    }
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Title titleText={`Hello ${user.full_name || user.user_name}`} />
      <p className="text-base font-light italic">Welcome to your account.</p>

      <NavMenuWrapper>
        <ul className="nav-menu-list grid">
          <li className="nav-menu-item">
            <Link
              to="/order"
              className={`nav-menu-link flex items-center ${
                location.pathname === "/order" ||
                location.pathname === "/order_detail"
                  ? "active"
                  : ""
              }`}
            >
              <span className="nav-link-icon flex items-center justify-center">
                <i className="bi bi-box-seam"></i>
              </span>
              <span className="text-base font-semibold nav-link-text no-wrap">
                My orders
              </span>
            </Link>
          </li>
          <li className="nav-menu-item">
            <Link
              to="/wishlist"
              className={`nav-menu-link flex items-center ${
                location.pathname === "/wishlist" ||
                location.pathname === "/empty_wishlist"
                  ? "active"
                  : ""
              }`}
            >
              <span className="nav-link-icon flex items-center justify-center">
                <i className="bi bi-heart"></i>
              </span>
              <span className="text-base font-semibold nav-link-text no-wrap">
                Wishlist
              </span>
            </Link>
          </li>
          <li className="nav-menu-item">
            <Link
              to="/account"
              className={`nav-menu-link flex items-center ${
                location.pathname === "/account" ||
                location.pathname === "/account/add" ||
                location.pathname.includes("/account/edit-address")
                  ? "active"
                  : ""
              }`}
            >
              <span className="nav-link-icon flex items-center justify-center">
                <i className="bi bi-person"></i>
              </span>
              <span className="text-base font-semibold nav-link-text no-wrap">
                My Account
              </span>
            </Link>
          </li>
          <li className="nav-menu-item">
            <button
              onClick={handleSignOut}
              className="nav-menu-link flex items-center"
            >
              <span className="nav-link-icon flex items-center justify-center">
                <i className="bi bi-box-arrow-right"></i>
              </span>
              <span className="text-base font-semibold nav-link-text no-wrap">
                Sign out
              </span>
            </button>
          </li>
        </ul>
      </NavMenuWrapper>
    </div>
  );
};

export default UserMenu;
