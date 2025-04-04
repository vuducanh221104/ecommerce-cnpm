import styled from "styled-components";
import { FormGridWrapper, FormTitle } from "../../styles/form_grid";
import { Container } from "../../styles/styles";
import { staticImages } from "../../utils/images";
import AuthOptions from "../../components/auth/AuthOptions";
import { FormElement, Input } from "../../styles/form";
import PasswordInput from "../../components/auth/PasswordInput";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BaseButtonBlack } from "../../styles/button";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useState, useEffect } from "react";
import { loginUser } from "../../services/authService";
import { toast } from "react-hot-toast";

const SignInScreenWrapper = styled.section`
  .form-separator {
    margin: 32px 0;
    column-gap: 18px;

    @media (max-width: ${breakpoints.lg}) {
      margin: 24px 0;
    }

    .separator-text {
      border-radius: 50%;
      min-width: 36px;
      height: 36px;
      background-color: ${defaultTheme.color_purple};
      position: relative;
    }

    .separator-line {
      width: 100%;
      height: 1px;
      background-color: ${defaultTheme.color_platinum};
    }
  }

  .form-elem-text {
    margin-top: -16px;
    display: block;
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

const SignInScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [returnUrl, setReturnUrl] = useState("/");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlReturnPath = searchParams.get("returnUrl");
    if (urlReturnPath) {
      setReturnUrl(urlReturnPath);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = "Username or email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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
      const response = await loginUser(
        formData.usernameOrEmail,
        formData.password
      );

      if (response.success) {
        toast.success("Login successful!");
        // Redirect to returnUrl instead of home page
        navigate(returnUrl);
      } else {
        setErrors({
          general: response.message || "Login failed. Please try again.",
        });
      }
    } catch (error) {
      const errorMessage = error.message || "Login failed. Please try again.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignInScreenWrapper>
      <FormGridWrapper>
        <Container>
          <div className="form-grid-content">
            <div className="form-grid-left">
              <img
                src={staticImages.form_img1}
                className="object-fit-cover"
                alt="Sign In"
              />
            </div>
            <div className="form-grid-right">
              <FormTitle>
                <h3>Sign In</h3>
              </FormTitle>
              <AuthOptions />
              <div className="form-separator flex items-center justify-center">
                <span className="separator-line"></span>
                <span className="separator-text inline-flex items-center justify-center text-white">
                  OR
                </span>
                <span className="separator-line"></span>
              </div>

              {errors.general && (
                <div className="error-message text-center mb-3">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <FormElement>
                  <label htmlFor="usernameOrEmail" className="form-elem-label">
                    User name or email address
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter username or email"
                    name="usernameOrEmail"
                    id="usernameOrEmail"
                    className="form-elem-control"
                    value={formData.usernameOrEmail}
                    onChange={handleChange}
                  />
                  {errors.usernameOrEmail && (
                    <div className="error-message">
                      {errors.usernameOrEmail}
                    </div>
                  )}
                </FormElement>

                <PasswordInput
                  fieldName="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />

                <Link
                  to="/reset"
                  className="form-elem-text text-end font-medium"
                >
                  Forgot your password?
                </Link>

                <BaseButtonBlack
                  type="submit"
                  className="form-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </BaseButtonBlack>
              </form>

              <p className="flex flex-wrap account-rel-text">
                Don&apos;t have a account?
                <Link to="/sign_up" className="font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </FormGridWrapper>
    </SignInScreenWrapper>
  );
};

export default SignInScreen;
