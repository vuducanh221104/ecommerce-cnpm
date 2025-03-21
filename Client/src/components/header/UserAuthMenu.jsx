import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { defaultTheme, breakpoints } from "../../styles/themes/default";
import {
  getCurrentUser,
  isLoggedIn,
  logoutUser,
} from "../../services/authService";
import { toast } from "react-hot-toast";

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

const UserMenuWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const UserAuthMenu = ({ onUserMenuToggle }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Listen for storage events (login/logout from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (onUserMenuToggle) {
      onUserMenuToggle(!dropdownOpen);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setDropdownOpen(false);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <UserMenuWrapper ref={dropdownRef} onClick={handleToggleDropdown}>
      {/* No content here - the parent component provides the user icon */}

      {dropdownOpen && (
        <UserMenuDropdown>
          {isLoggedIn() && user ? (
            <>
              <div className="menu-header">
                <div className="user-name">
                  {user.full_name || user.user_name}
                </div>
                <div className="user-email">{user.email}</div>
              </div>

              <ul className="menu-items">
                <li>
                  <Link
                    className="menu-item"
                    to="/account"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-person"></i> My Account
                  </Link>
                </li>
                <li>
                  <Link
                    className="menu-item"
                    to="/order"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="bi bi-bag"></i> My Orders
                  </Link>
                </li>
                <li>
                  <Link
                    className="menu-item"
                    to="/wishlist"
                    onClick={() => setDropdownOpen(false)}
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
                  onClick={() => setDropdownOpen(false)}
                >
                  <i className="bi bi-box-arrow-in-right"></i> Sign In
                </Link>
              </li>
              <li>
                <Link
                  className="menu-item"
                  to="/sign_up"
                  onClick={() => setDropdownOpen(false)}
                >
                  <i className="bi bi-person-plus"></i> Sign Up
                </Link>
              </li>
            </ul>
          )}
        </UserMenuDropdown>
      )}
    </UserMenuWrapper>
  );
};

export default UserAuthMenu;
