import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { FormElement, Input } from "../../styles/form";
import { BaseButtonBlack, BaseLinkBlack } from "../../styles/button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getCurrentUser,
  addAddress,
  updateAddress,
} from "../../services/authService";
import { toast } from "react-hot-toast";
import * as httpRequest from "../../config/httpsRequest";

const AddressScreenWrapper = styled.main`
  .form-elem-wide {
    grid-column: 1/3;
  }

  .form-title {
    margin-bottom: 24px;
  }

  .form-btns {
    display: flex;
    margin-top: 32px;
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
  { label: "Add Address", link: "" },
];

const AddressScreen = () => {
  const navigate = useNavigate();
  const { addressId } = useParams(); // For editing existing address
  const isEditMode = !!addressId;
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    country: "Việt Nam",
    is_default: true,
    tag: "Home",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cập nhật breadcrumb đúng với chế độ
  const currentBreadcrumbItems = [...breadcrumbItems];
  if (isEditMode) {
    currentBreadcrumbItems[2] = { label: "Edit Address", link: "" };
  }

  useEffect(() => {
    const userData = getCurrentUser();
    if (!userData) {
      // Redirect to login if not logged in
      toast.error("Please login to manage addresses");
      navigate("/sign_in");
      return;
    }

    setUser(userData);

    if (isEditMode) {
      fetchAddress(addressId);
    } else if (userData.address && userData.address.street) {
      // Pre-fill form with default user address if it exists
      setFormData({
        name: userData.full_name || "",
        street: userData.address.street || "",
        ward: userData.address.ward || "",
        district: userData.address.district || "",
        city: userData.address.city || "",
        country: userData.address.country || "",
        is_default: true,
        tag: "Home",
      });
    }
  }, [navigate, addressId, isEditMode]);

  const fetchAddress = async (id) => {
    try {
      setLoading(true);

      // Trong trường hợp thật, sẽ fetch từ API
      // const response = await httpRequest.get(`api/v1/user/address/${id}`);

      // Hiện tại, chúng ta dùng dữ liệu từ localStorage
      const userData = getCurrentUser();

      // Xử lý trường hợp là địa chỉ mặc định (từ thông tin user)
      if (id === "default_address" && userData && userData.address) {
        const addressData = {
          name: userData.full_name || "",
          street: userData.address.street || "",
          ward: userData.address.ward || "",
          district: userData.address.district || "",
          city: userData.address.city || "",
          country: userData.address.country || "Việt Nam",
          is_default: true,
          tag: "Home",
        };

        setFormData(addressData);
        setLoading(false);
        return;
      }

      // TODO: Trong ứng dụng thực tế, bạn sẽ lấy thông tin địa chỉ từ danh sách địa chỉ dựa trên ID

      setLoading(false);
    } catch (error) {
      console.error("Error fetching address:", error);
      toast.error("Failed to load address details");
      setLoading(false);
      navigate("/account");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear errors when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare address data
      const addressData = {
        user_id: user._id,
        name: formData.name,
        address: {
          street: formData.street,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
          country: formData.country,
        },
        is_default: formData.is_default,
        tag: formData.tag,
        // Include tags for frontend display consistency
        tags: [
          formData.tag || "Home",
          formData.is_default ? "Default billing address" : "",
        ],
      };

      let response;

      if (isEditMode) {
        response = await updateAddress(addressId, addressData);
      } else {
        response = await addAddress(addressData);
      }

      if (response && response.success) {
        toast.success(
          isEditMode
            ? "Address updated successfully"
            : "Address added successfully"
        );

        // Update local user state if available
        if (response.user) {
          localStorage.setItem("ducanh_user", JSON.stringify(response.user));
        }

        // Return to account page
        navigate("/account");
      } else {
        toast.error(response?.message || "Failed to save address");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(error.message || "Failed to save address. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AddressScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={currentBreadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            <Title
              titleText={isEditMode ? "Edit Address" : "Add New Address"}
            />
            <h4 className="title-sm form-title">
              Enter your address details below
            </h4>

            <form onSubmit={handleSubmit}>
              <div className="form-wrapper">
                <FormElement className="form-elem">
                  <label
                    htmlFor="name"
                    className="form-label font-semibold text-base"
                  >
                    Full Name
                  </label>
                  <div className="form-input-wrapper">
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Enter your full name"
                      className="form-elem-control"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.name && (
                    <div className="error-message">{errors.name}</div>
                  )}
                </FormElement>

                <FormElement className="form-elem form-elem-wide">
                  <label
                    htmlFor="street"
                    className="form-label font-semibold text-base"
                  >
                    Street Address
                  </label>
                  <div className="form-input-wrapper">
                    <Input
                      type="text"
                      name="street"
                      id="street"
                      placeholder="Enter street address"
                      className="form-elem-control"
                      value={formData.street}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.street && (
                    <div className="error-message">{errors.street}</div>
                  )}
                </FormElement>

                <FormElement className="form-elem">
                  <label
                    htmlFor="ward"
                    className="form-label font-semibold text-base"
                  >
                    Ward
                  </label>
                  <div className="form-input-wrapper">
                    <Input
                      type="text"
                      name="ward"
                      id="ward"
                      placeholder="Enter ward"
                      className="form-elem-control"
                      value={formData.ward}
                      onChange={handleChange}
                    />
                  </div>
                </FormElement>

                <FormElement className="form-elem">
                  <label
                    htmlFor="district"
                    className="form-label font-semibold text-base"
                  >
                    District
                  </label>
                  <div className="form-input-wrapper">
                    <Input
                      type="text"
                      name="district"
                      id="district"
                      placeholder="Enter district"
                      className="form-elem-control"
                      value={formData.district}
                      onChange={handleChange}
                    />
                  </div>
                </FormElement>

                <FormElement className="form-elem">
                  <label
                    htmlFor="city"
                    className="form-label font-semibold text-base"
                  >
                    City
                  </label>
                  <div className="form-input-wrapper">
                    <Input
                      type="text"
                      name="city"
                      id="city"
                      placeholder="Enter city"
                      className="form-elem-control"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.city && (
                    <div className="error-message">{errors.city}</div>
                  )}
                </FormElement>

                <FormElement className="form-elem">
                  <label
                    htmlFor="country"
                    className="form-label font-semibold text-base"
                  >
                    Country
                  </label>
                  <div className="form-input-wrapper">
                    <Input
                      type="text"
                      name="country"
                      id="country"
                      placeholder="Enter country"
                      className="form-elem-control"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.country && (
                    <div className="error-message">{errors.country}</div>
                  )}
                </FormElement>

                <FormElement className="form-elem">
                  <label
                    htmlFor="tag"
                    className="form-label font-semibold text-base"
                  >
                    Address Label
                  </label>
                  <div className="form-input-wrapper">
                    <select
                      name="tag"
                      id="tag"
                      className="form-elem-control"
                      value={formData.tag}
                      onChange={handleChange}
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </FormElement>

                <FormElement className="form-elem form-elem-wide">
                  <div className="form-check-elem flex items-center">
                    <div className="form-elem-checkbox">
                      <input
                        type="checkbox"
                        name="is_default"
                        id="is_default"
                        checked={formData.is_default}
                        onChange={handleChange}
                      />
                      <span className="checkmark flex items-center justify-center">
                        <i className="bi bi-check"></i>
                      </span>
                    </div>
                    <label
                      htmlFor="is_default"
                      className="text-outerspace flex-1"
                    >
                      Set as default address
                    </label>
                  </div>
                </FormElement>
              </div>

              <div className="form-btns">
                <BaseButtonBlack type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : isEditMode
                    ? "Update Address"
                    : "Save Address"}
                </BaseButtonBlack>
                <BaseLinkBlack to="/account" className="ml-4">
                  Cancel
                </BaseLinkBlack>
              </div>
            </form>
          </UserContent>
        </UserDashboardWrapper>
      </Container>
    </AddressScreenWrapper>
  );
};

export default AddressScreen;
