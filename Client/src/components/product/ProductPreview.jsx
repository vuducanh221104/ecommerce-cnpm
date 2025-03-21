import styled from "styled-components";
import { PropTypes } from "prop-types";
import { useState, useEffect } from "react";
import { breakpoints, defaultTheme } from "../../styles/themes/default";

const ProductPreviewWrapper = styled.div`
  grid-template-columns: 72px auto;
  gap: 24px;

  @media (max-width: ${breakpoints.xl}) {
    gap: 16px;
  }

  @media (max-width: ${breakpoints.sm}) {
    gap: 12px;
    grid-template-columns: 42px auto;
  }

  @media (max-width: ${breakpoints.xs}) {
    grid-template-columns: 100%;
  }

  .preview-items {
    @media (max-width: ${breakpoints.xs}) {
      width: 80%;
      margin-right: auto;
      margin-left: auto;
      order: 2;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .preview-item {
    width: 70px;
    height: 70px;
    overflow: hidden;
    border-radius: 8px;
    cursor: pointer;
    transition: ${defaultTheme.default_transition};

    @media (max-width: ${breakpoints.sm}) {
      width: 40px;
      height: 40px;
    }

    &:hover {
      opacity: 0.9;
      outline: 1px solid ${defaultTheme.color_gray};
    }

    &-wrapper {
      padding-top: 4px;
      padding-bottom: 4px;

      @media (max-width: ${breakpoints.xs}) {
        display: flex;
        justify-content: center;
      }
    }
  }

  .preview-display {
    height: 600px;
    overflow: hidden;

    @media (max-width: ${breakpoints.md}) {
      height: 520px;
    }

    @media (max-width: ${breakpoints.sm}) {
      height: 400px;
    }

    @media (max-width: ${breakpoints.xs}) {
      height: 320px;
    }
  }
`;

const ProductPreview = ({ previewImages }) => {
  const [activePreviewImage, setActivePreviewImage] = useState(
    previewImages && previewImages.length > 0 ? previewImages[0] : ""
  );

  // Reset active preview image when previewImages changes (when color changes)
  useEffect(() => {
    if (previewImages && previewImages.length > 0) {
      setActivePreviewImage(previewImages[0]);
    }
  }, [previewImages]);

  const handlePreviewImageChange = (previewImage) => {
    setActivePreviewImage(previewImage);
  };

  if (!previewImages || previewImages.length === 0) {
    return <div>No images available</div>;
  }

  return (
    <ProductPreviewWrapper className="grid items-center">
      <div className="preview-items w-full">
        {previewImages.map((imageUrl, index) => {
          return (
            <div
              className="preview-item-wrapper"
              key={index}
              onClick={() => handlePreviewImageChange(imageUrl)}
            >
              <div className="preview-item">
                <img
                  src={imageUrl}
                  alt={`Product preview ${index + 1}`}
                  className="object-fit-cover"
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="preview-display">
        <img
          src={activePreviewImage}
          className="object-fit-cover"
          alt="Product main preview"
        />
      </div>
    </ProductPreviewWrapper>
  );
};

export default ProductPreview;

ProductPreview.propTypes = {
  previewImages: PropTypes.array,
};
