import styled from "styled-components";
import { Container } from "../../styles/styles";
import Title from "../common/Title";
import ProductItem from "../product/ProductItem";
import { breakpoints } from "../../styles/themes/default";
import { Link } from "react-router-dom";
import { PropTypes } from "prop-types";

const CatalogWrapper = styled.div`
  padding: 80px 0;

  @media (max-width: ${breakpoints.lg}) {
    padding: 60px 0;
  }

  @media (max-width: ${breakpoints.sm}) {
    padding: 40px 0;
  }

  .catalog-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;

    .view-all {
      color: #666;
      font-weight: 500;
      transition: all 0.3s ease;
      &:hover {
        color: #000;
      }
    }
  }

  .catalog-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;

    @media (max-width: ${breakpoints.sm}) {
      gap: 16px;
    }
  }
`;

const Catalog = ({ catalogTitle, products = [] }) => {
  // Get category slug from title if it's Men's Fashion or Women's Fashion
  let categorySlug;
  if (catalogTitle === "Men's Fashion") {
    categorySlug = "men";
  } else if (catalogTitle === "Women's Fashion") {
    categorySlug = "women";
  } else if (products.length > 0 && products[0]?.category_id?.length > 0) {
    // Otherwise try to get from first product
    categorySlug = products[0].category_id[0].slug;
  }

  return (
    <CatalogWrapper>
      <Container>
        <div className="catalog-title">
          <Title titleText={catalogTitle} />
          {categorySlug && (
            <Link to={`/category/${categorySlug}`} className="view-all">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          )}
        </div>
        <div className="catalog-list grid">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductItem key={product._id} product={product} />
            ))
          ) : (
            <p className="text-center col-span-full py-10 text-gray-500">
              No products found in this category.
            </p>
          )}
        </div>
      </Container>
    </CatalogWrapper>
  );
};

export default Catalog;

Catalog.propTypes = {
  catalogTitle: PropTypes.string,
  products: PropTypes.array,
};
