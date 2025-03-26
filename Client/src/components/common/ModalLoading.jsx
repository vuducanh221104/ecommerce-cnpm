import React from "react";
import styled from "styled-components";

const LoadingContainer = styled.div`
  width: 100%;
  height: 1000px;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalLoading = () => {
  return <LoadingContainer />;
};

export default ModalLoading;
