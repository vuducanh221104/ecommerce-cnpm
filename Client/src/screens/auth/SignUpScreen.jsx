import styled from "styled-components";
import {
  CheckboxGroup,
  FormGridWrapper,
  FormTitle,
} from "../../styles/form_grid";
import { Container } from "../../styles/styles";
import { staticImages } from "../../utils/images";
import AuthOptions from "../../components/auth/AuthOptions";
import { FormElement, Input } from "../../styles/form";
import PasswordInput from "../../components/auth/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { BaseButtonBlack } from "../../styles/button";
import { useState } from "react";
import { registerUser } from "../../services/authService";
import { toast } from "react-hot-toast";

const SignUpScreenWrapper = styled.section`
  form {
    margin-top: 40px;
    .form-elem-text {
      margin-top: -16px;
      display: block;
    }
  }

  .text-space {
    margin: 0 4px;
  }

  .error-message {
    color: #dc3545;
    font-size: 14px;
    margin-top: 5px;
  }

  .form-submit-btn {
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
`;

const SignUpScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    password: "",
    agreeToTerms: false,
    subscribeNewsletter: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_name.trim()) {
      newErrors.user_name = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms =
        "You must agree to the Terms of Use and Privacy Policy";
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
      setIsLoading(true);

      const userData = {
        user_name: formData.user_name,
        email: formData.email,
        password: formData.password,
        // Additional fields
        type: "WEBSITE",
        role: 0, // Regular user
        status: 1, // Active
      };

      const response = await registerUser(userData);

      if (response.success) {
        toast.success("Registration successful!");
        navigate("/sign_in"); // Redirect to sign in page
      } else {
        setErrors({
          general: response.message || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      const errorMessage =
        error.message || "Registration failed. Please try again.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignUpScreenWrapper>
      <FormGridWrapper>
        <Container>
          <div className="form-grid-content">
            <div className="form-grid-left">
              <img
                src={staticImages.form_img2}
                className="object-fit-cover"
                alt="Sign Up"
              />
            </div>
            <div className="form-grid-right">
              <FormTitle>
                <h3>Sign Up</h3>
                <p className="text-base">
                  Sign up for free to access to in any of our products
                </p>
              </FormTitle>
              <AuthOptions />

              {errors.general && (
                <div className="error-message text-center mt-3">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <FormElement>
                  <label htmlFor="user_name" className="forme-elem-label">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter username"
                    name="user_name"
                    id="user_name"
                    value={formData.user_name}
                    onChange={handleChange}
                    className="form-elem-control"
                  />
                  {errors.user_name && (
                    <div className="error-message">{errors.user_name}</div>
                  )}
                </FormElement>

                <FormElement>
                  <label htmlFor="email" className="forme-elem-label">
                    Email address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-elem-control"
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </FormElement>

                <PasswordInput
                  fieldName="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />
                <span className="form-elem-text font-medium">
                  Use 8 or more characters with a mix of letters, numbers &
                  symbols
                </span>

                <CheckboxGroup>
                  <li className="flex items-center">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                    />
                    <span className="text-sm">
                      Agree to our
                      <Link to="/" className="text-underline">
                        Terms of use
                      </Link>
                      <span className="text-space">and</span>
                      <Link to="/" className="text-underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </li>
                  {errors.agreeToTerms && (
                    <div className="error-message">{errors.agreeToTerms}</div>
                  )}
                  <li className="flex items-center">
                    <input
                      type="checkbox"
                      name="subscribeNewsletter"
                      checked={formData.subscribeNewsletter}
                      onChange={handleChange}
                    />
                    <span className="text-sm">
                      Subscribe to our monthly newsletter
                    </span>
                  </li>
                </CheckboxGroup>

                <BaseButtonBlack
                  type="submit"
                  className="form-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </BaseButtonBlack>
              </form>
              <p className="flex flex-wrap account-rel-text">
                Already have an account?
                <Link to="/sign_in" className="font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </FormGridWrapper>
    </SignUpScreenWrapper>
  );
};

export default SignUpScreen;
