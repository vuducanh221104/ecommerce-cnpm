import styled from "styled-components";
import { PropTypes } from "prop-types";
import ProductItem from "../product/ProductItem";
import { breakpoints } from "../../styles/themes/default";

const GridWrapper = styled.div`
  .grid-container {
    display: grid;
    gap: 24px;
    margin-top: 24px;

    /* Desktop - 4 items per row */
    @media (min-width: 1300px) {
      grid-template-columns: repeat(4, 1fr);
    }

    /* Laptop - 3 items per row */
    @media (min-width: 1000px) and (max-width: 1299px) {
      grid-template-columns: repeat(3, 1fr);
    }

    /* Tablet - 2 items per row */
    @media (min-width: 640px) and (max-width: 999px) {
      grid-template-columns: repeat(2, 1fr);
    }

    /* Mobile - 2 items per row */
    @media (min-width: 480px) and (max-width: 639px) {
      grid-template-columns: repeat(2, 1fr);
    }

    /* Small Mobile - 1 item per row */
    @media (max-width: 479px) {
      grid-template-columns: 1fr;
    }
  }

  .no-products {
    text-align: center;
    padding: 40px 0;
    color: #666;
    font-size: 16px;
  }
`;

const CategoryGrid = ({ products }) => {
  return (
    <GridWrapper>
      <div className="grid-container">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductItem key={product._id} product={product} />
          ))
        ) : (
          <div className="no-products">No products found in this category.</div>
        )}
      </div>
    </GridWrapper>
  );
};

CategoryGrid.propTypes = {
  products: PropTypes.array.isRequired,
};

export default CategoryGrid;
