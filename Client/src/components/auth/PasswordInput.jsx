import styled from "styled-components";
import { FormElement, Input } from "../../styles/form";
import { PropTypes } from "prop-types";
import { useState } from "react";

const PasswordToggleButton = styled.button`
  position: absolute;
  bottom: 100%;
  right: 0;

  .pwd-toggle-text {
    padding-left: 5px;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
`;

const PasswordInput = ({ fieldName, name, value, onChange, error = "" }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormElement>
      <label htmlFor={name} className="form-elem-label">
        {fieldName}
      </label>
      <div className="form-elem-block">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          className="form-elem-control"
        />

        <PasswordToggleButton
          type="button"
          className="pwd-value-toggle flex items-center"
          onClick={togglePassword}
        >
          {showPassword ? (
            <>
              <i className="bi bi-eye-fill"></i>
              <span className="pwd-toggle-text text-sm">Hide</span>
            </>
          ) : (
            <>
              <i className="bi bi-eye-slash-fill"></i>
              <span className="pwd-toggle-text text-sm">Show</span>
            </>
          )}
        </PasswordToggleButton>
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormElement>
  );
};

export default PasswordInput;

PasswordInput.propTypes = {
  fieldName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
};
