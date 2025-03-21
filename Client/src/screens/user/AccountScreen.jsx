import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { FormElement, Input } from "../../styles/form";
import { BaseLinkGreen, BaseButtonBlack } from "../../styles/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useState, useEffect } from "react";
import {
  getCurrentUser,
  updateUserInfo,
  changePassword,
  getUserAddresses,
  removeAddress,
} from "../../services/authService";
import { toast } from "react-hot-toast";
import * as httpRequest from "../../config/httpsRequest";

const AccountScreenWrapper = styled.main`
  .address-list {
    margin-top: 20px;
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;

    @media (max-width: ${breakpoints.lg}) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  .address-item {
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 25px;
    row-gap: 8px;
  }

  .address-tags {
    gap: 12px;

    li {
      height: 28px;
      border-radius: 8px;
      padding: 2px 12px;
      background-color: ${defaultTheme.color_whitesmoke};
    }
  }

  .address-btns {
    margin-top: 12px;
    .btn-separator {
      width: 1px;
      border-radius: 50px;
      background: ${defaultTheme.color_platinum};
      margin: 0 10px;
    }
  }

  .form-submit-btn {
    margin-top: 20px;
    max-width: 200px;
  }

  .edit-mode {
    .form-elem-control {
      background-color: #fff;
      border: 1px solid ${defaultTheme.color_platinum};
      padding: 8px 10px;
    }
  }

  .current-password {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid ${defaultTheme.color_anti_flash_white};
  }

  .error-message {
    color: #dc3545;
    font-size: 14px;
    margin-top: 5px;
  }
`;

const breadcrumbItems = [
  {
    label: "Home",
    link: "/",
  },
  { label: "Account", link: "/account" },
];

const AccountScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
  });
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});

  // Fetch user data on component mount or when returning from address screens
  useEffect(() => {
    const userData = getCurrentUser();
    if (!userData) {
      // Redirect to login if not logged in
      toast.error("Please login to view your account");
      navigate("/sign_in");
      return;
    }

    setUser(userData);
    setFormData({
      full_name: userData.full_name || "",
      email: userData.email || "",
      phone_number: userData.phone_number || "",
      current_password: "",
      new_password: "",
      confirm_password: "",
    });

    // Fetch addresses from API
    fetchUserAddresses(userData._id);
  }, [navigate, location.pathname]);

  // Fetch user addresses
  const fetchUserAddresses = async (userId) => {
    try {
      setLoading(true);

      // Call the API to get user addresses
      const response = await getUserAddresses(userId);

      if (response.success) {
        // Ensure each address has a tags property
        const formattedAddresses = response.addresses.map((address) => {
          return {
            ...address,
            // Ensure address has tags property, use default if not present
            tags: address.tags || ["Home", "Default billing address"],
          };
        });
        setAddresses(formattedAddresses);
      } else {
        // Fallback to local user data if API fails
        fallbackToLocalAddresses();
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      // Fallback to local user data if API fails
      fallbackToLocalAddresses();
      setLoading(false);
    }
  };

  // Fallback function to use local user data for addresses
  const fallbackToLocalAddresses = () => {
    const userData = getCurrentUser();

    if (userData && userData.address && userData.address.street) {
      const formattedAddress = `${userData.address.street}${
        userData.address.ward ? `, ${userData.address.ward}` : ""
      }${userData.address.district ? `, ${userData.address.district}` : ""}${
        userData.address.city ? `, ${userData.address.city}` : ""
      }${userData.address.country ? `, ${userData.address.country}` : ""}`;

      setAddresses([
        {
          _id: "default_address",
          name: userData.full_name || userData.user_name,
          address: formattedAddress,
          tags: ["Home", "Default billing address"], // Ensure tags always exists
        },
      ]);
    } else {
      setAddresses([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear errors when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const toggleEditMode = (field) => {
    setEditMode({
      ...editMode,
      [field]: !editMode[field],
    });

    // Reset form data and errors when canceling edit
    if (editMode[field]) {
      setFormData({
        ...formData,
        [field]: user[field] || "",
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setErrors({});
    }
  };

  const validateField = (field) => {
    const newErrors = {};

    switch (field) {
      case "name":
        if (!formData.full_name.trim()) {
          newErrors.full_name = "Name is required";
        }
        break;
      case "email":
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Email address is invalid";
        }
        if (!formData.current_password) {
          newErrors.current_password =
            "Current password is required to change email";
        }
        break;
      case "phone":
        if (
          formData.phone_number &&
          !/^\+?[0-9\s]{10,15}$/.test(formData.phone_number)
        ) {
          newErrors.phone_number = "Please enter a valid phone number";
        }
        break;
      case "password":
        if (!formData.current_password) {
          newErrors.current_password = "Current password is required";
        }
        if (!formData.new_password) {
          newErrors.new_password = "New password is required";
        } else if (formData.new_password.length < 8) {
          newErrors.new_password = "Password must be at least 8 characters";
        }
        if (!formData.confirm_password) {
          newErrors.confirm_password = "Please confirm your new password";
        } else if (formData.new_password !== formData.confirm_password) {
          newErrors.confirm_password = "Passwords do not match";
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateField = async (field) => {
    if (!validateField(field)) {
      return;
    }

    try {
      setLoading(true);

      let response;

      switch (field) {
        case "name":
          response = await updateUserInfo({
            _id: user._id,
            full_name: formData.full_name,
          });
          break;
        case "email":
          response = await updateUserInfo({
            _id: user._id,
            email: formData.email,
            current_password: formData.current_password,
          });
          break;
        case "phone":
          response = await updateUserInfo({
            _id: user._id,
            phone_number: formData.phone_number,
          });
          break;
        case "password":
          response = await changePassword(
            user._id,
            formData.current_password,
            formData.new_password
          );
          break;
        default:
          break;
      }

      if (response && response.success) {
        toast.success(
          `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } updated successfully`
        );

        // Update local user state with new data if available
        if (response.user) {
          setUser(response.user);
        }

        // Reset edit mode
        toggleEditMode(field);
      } else {
        toast.error(response?.message || `Failed to update ${field}`);
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(
        error.message || `Failed to update ${field}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAddress = async (addressId) => {
    try {
      setLoading(true);

      const response = await removeAddress(addressId, user._id);

      if (response && response.success) {
        // Remove from local state
        setAddresses(addresses.filter((addr) => addr._id !== addressId));
        toast.success("Address removed successfully");

        // Update user if available
        if (response.user) {
          setUser(response.user);
        }
      } else {
        toast.error(response?.message || "Failed to remove address");
      }
    } catch (error) {
      console.error("Error removing address:", error);
      toast.error(
        error.message || "Failed to remove address. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Add a safe rendering function for addresses
  const renderAddressList = () => {
    if (!addresses || addresses.length === 0) {
      return (
        <p className="text-gray text-base font-medium my-4">
          You haven't added any addresses yet.
        </p>
      );
    }

    return addresses.map((address) => (
      <div className="address-item grid" key={address._id || "default_address"}>
        <p className="text-outerspace text-lg font-semibold address-title">
          {address.name || ""}
        </p>
        <p className="text-gray text-base font-medium address-description">
          {typeof address.address === "string"
            ? address.address
            : address.address
            ? `${address.address.street || ""}, ${
                address.address.city || ""
              }, ${address.address.country || ""}`
            : "No address details"}
        </p>
        <ul className="address-tags flex flex-wrap">
          {Array.isArray(address.tags) ? (
            address.tags.map((tag, index) => (
              <li
                key={index}
                className="text-gray text-base font-medium inline-flex items-center justify-center"
              >
                {tag}
              </li>
            ))
          ) : (
            <li className="text-gray text-base font-medium inline-flex items-center justify-center">
              Home
            </li>
          )}
        </ul>
        <div className="address-btns flex">
          <button
            type="button"
            className="text-base text-outerspace font-semibold"
            onClick={() => handleRemoveAddress(address._id)}
          >
            Remove
          </button>
          <div className="btn-separator"></div>
          <Link
            to={`/account/edit-address/${address._id}`}
            className="text-base text-outerspace font-semibold"
          >
            Edit
          </Link>
        </div>
      </div>
    ));
  };

  if (!user) {
    return (
      <div className="page-py-spacing text-center">Loading user data...</div>
    );
  }

  return (
    <AccountScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            <Title titleText={"My Account"} />
            <h4 className="title-sm">Contact Details</h4>
            <form>
              <div className="form-wrapper">
                <FormElement
                  className={`form-elem ${editMode.name ? "edit-mode" : ""}`}
                >
                  <label
                    htmlFor="full_name"
                    className="form-label font-semibold text-base"
                  >
                    Your Name
                  </label>
                  <div className="form-input-wrapper flex items-center">
                    <Input
                      type="text"
                      name="full_name"
                      id="full_name"
                      className="form-elem-control text-outerspace font-semibold"
                      value={formData.full_name}
                      onChange={handleChange}
                      readOnly={!editMode.name}
                    />
                    {!editMode.name ? (
                      <button
                        type="button"
                        className="form-control-change-btn"
                        onClick={() => toggleEditMode("name")}
                      >
                        Change
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="form-control-change-btn"
                        onClick={() => toggleEditMode("name")}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {errors.full_name && (
                    <div className="error-message">{errors.full_name}</div>
                  )}
                  {editMode.name && (
                    <BaseButtonBlack
                      type="button"
                      className="form-submit-btn"
                      onClick={() => handleUpdateField("name")}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Name"}
                    </BaseButtonBlack>
                  )}
                </FormElement>

                <FormElement
                  className={`form-elem ${editMode.email ? "edit-mode" : ""}`}
                >
                  <label
                    htmlFor="email"
                    className="form-label font-semibold text-base"
                  >
                    Email Address
                  </label>
                  <div className="form-input-wrapper flex items-center">
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      className="form-elem-control text-outerspace font-semibold"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={!editMode.email}
                    />
                    {!editMode.email ? (
                      <button
                        type="button"
                        className="form-control-change-btn"
                        onClick={() => toggleEditMode("email")}
                      >
                        Change
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="form-control-change-btn"
                        onClick={() => toggleEditMode("email")}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}

                  {editMode.email && (
                    <div className="current-password">
                      <label
                        htmlFor="current_password"
                        className="form-label font-semibold text-base"
                      >
                        Current Password (required to change email)
                      </label>
                      <Input
                        type="password"
                        name="current_password"
                        id="current_password"
                        className="form-elem-control text-outerspace"
                        value={formData.current_password}
                        onChange={handleChange}
                      />
                      {errors.current_password && (
                        <div className="error-message">
                          {errors.current_password}
                        </div>
                      )}

                      <BaseButtonBlack
                        type="button"
                        className="form-submit-btn"
                        onClick={() => handleUpdateField("email")}
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Update Email"}
                      </BaseButtonBlack>
                    </div>
                  )}
                </FormElement>

                <FormElement
                  className={`form-elem ${editMode.phone ? "edit-mode" : ""}`}
                >
                  <label
                    htmlFor="phone_number"
                    className="form-label font-semibold text-base"
                  >
                    Phone Number
                  </label>
                  <div className="form-input-wrapper flex items-center">
                    <Input
                      type="text"
                      name="phone_number"
                      id="phone_number"
                      className="form-elem-control text-outerspace font-semibold"
                      value={formData.phone_number}
                      onChange={handleChange}
                      readOnly={!editMode.phone}
                      placeholder={
                        !formData.phone_number && editMode.phone
                          ? "Enter phone number"
                          : ""
                      }
                    />
                    {!editMode.phone ? (
                      <button
                        type="button"
                        className="form-control-change-btn"
                        onClick={() => toggleEditMode("phone")}
                      >
                        Change
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="form-control-change-btn"
                        onClick={() => toggleEditMode("phone")}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {errors.phone_number && (
                    <div className="error-message">{errors.phone_number}</div>
                  )}
                  {editMode.phone && (
                    <BaseButtonBlack
                      type="button"
                      className="form-submit-btn"
                      onClick={() => handleUpdateField("phone")}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Phone"}
                    </BaseButtonBlack>
                  )}
                </FormElement>

                <FormElement
                  className={`form-elem ${
                    editMode.password ? "edit-mode" : ""
                  }`}
                >
                  <label
                    htmlFor="password"
                    className="form-label font-semibold text-base"
                  >
                    Password
                  </label>
                  <div className="form-input-wrapper flex items-center">
                    <Input
                      type="password"
                      name="password"
                      id="password"
                      className="form-elem-control text-outerspace font-semibold"
                      value="••••••••"
                      readOnly
                    />
                    {!editMode.password ? (
                      <button
                        type="button"
                        className="form-control-change-btn"
                        onClick={() => toggleEditMode("password")}
                      >
                        Change
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="form-control-change-btn"
                        onClick={() => toggleEditMode("password")}
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {editMode.password && (
                    <div className="current-password">
                      <label
                        htmlFor="current_password"
                        className="form-label font-semibold text-base"
                      >
                        Current Password
                      </label>
                      <Input
                        type="password"
                        name="current_password"
                        id="current_password"
                        className="form-elem-control text-outerspace"
                        value={formData.current_password}
                        onChange={handleChange}
                      />
                      {errors.current_password && (
                        <div className="error-message">
                          {errors.current_password}
                        </div>
                      )}

                      <label
                        htmlFor="new_password"
                        className="form-label font-semibold text-base mt-3"
                      >
                        New Password
                      </label>
                      <Input
                        type="password"
                        name="new_password"
                        id="new_password"
                        className="form-elem-control text-outerspace"
                        value={formData.new_password}
                        onChange={handleChange}
                      />
                      {errors.new_password && (
                        <div className="error-message">
                          {errors.new_password}
                        </div>
                      )}

                      <label
                        htmlFor="confirm_password"
                        className="form-label font-semibold text-base mt-3"
                      >
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        name="confirm_password"
                        id="confirm_password"
                        className="form-elem-control text-outerspace"
                        value={formData.confirm_password}
                        onChange={handleChange}
                      />
                      {errors.confirm_password && (
                        <div className="error-message">
                          {errors.confirm_password}
                        </div>
                      )}

                      <BaseButtonBlack
                        type="button"
                        className="form-submit-btn"
                        onClick={() => handleUpdateField("password")}
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </BaseButtonBlack>
                    </div>
                  )}
                </FormElement>
              </div>
            </form>

            <div>
              <h4 className="title-sm">My Contact Address</h4>
              <BaseLinkGreen to="/account/add">Add Address</BaseLinkGreen>

              <div className="address-list grid">{renderAddressList()}</div>
            </div>
          </UserContent>
        </UserDashboardWrapper>
      </Container>
    </AccountScreenWrapper>
  );
};

export default AccountScreen;
