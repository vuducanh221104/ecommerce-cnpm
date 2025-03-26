import styled from "styled-components";
import { defaultTheme } from "../../styles/themes/default";

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  height: 200px;

  .spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: ${defaultTheme.color_sea_green};
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingSpinner = () => {
  return (
    <SpinnerWrapper>
      <div className="spinner"></div>
    </SpinnerWrapper>
  );
};

export default LoadingSpinner;
