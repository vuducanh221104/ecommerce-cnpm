import styled from "styled-components";
import { PropTypes } from "prop-types";

const FilterWrapper = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;

  .filter-section {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
    }
  }

  .price-range {
    display: flex;
    gap: 10px;
    align-items: center;

    .price-input-wrapper {
      position: relative;
      flex: 1;

      input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        transition: all 0.2s;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: #000;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
        }

        &:hover {
          border-color: #999;
        }

        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      }

      &.active input {
        border-color: #000;
        background-color: #f8f8f8;
        font-weight: 500;
      }
    }

    .separator {
      color: #666;
      font-weight: 500;
    }
  }

  .sort-options {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .sort-option {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #666;
      transition: all 0.2s;
      padding: 8px;
      border-radius: 4px;

      &:hover {
        color: #000;
        background-color: #f5f5f5;
      }

      &.active {
        color: #000;
        background-color: #f0f0f0;
        font-weight: 500;
      }

      label {
        cursor: pointer;
        flex: 1;
        user-select: none;
        position: relative;
        padding-left: 24px;
      }
      input {
        cursor: pointer;
      }

      input[type="radio"]:checked + label:before {
        border-color: #000;
      }

      input[type="radio"]:checked + label:after {
        opacity: 1;
      }
    }
  }
`;

const Filter = ({ onFilterChange, filters }) => {
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value ? Number(value) : "",
    });
  };

  const handleSortChange = (e) => {
    onFilterChange({
      ...filters,
      sortBy: e.target.value,
    });
  };

  return (
    <FilterWrapper>
      <div className="filter-section">
        <h3>Price Range</h3>
        <div className="price-range">
          <div
            className={`price-input-wrapper ${
              filters.minPrice ? "active" : ""
            }`}
          >
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              value={filters.minPrice || ""}
              onChange={handlePriceChange}
              onClick={(e) => e.target.select()}
            />
          </div>
          <span className="separator">-</span>
          <div
            className={`price-input-wrapper ${
              filters.maxPrice ? "active" : ""
            }`}
          >
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              value={filters.maxPrice || ""}
              onChange={handlePriceChange}
              onClick={(e) => e.target.select()}
            />
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h3>Sort By</h3>
        <div className="sort-options">
          <div
            className={`sort-option ${
              filters.sortBy === "price-asc" ? "active" : ""
            }`}
          >
            <input
              type="radio"
              id="price-asc"
              name="sort"
              value="price-asc"
              checked={filters.sortBy === "price-asc"}
              onChange={handleSortChange}
            />
            <label htmlFor="price-asc">Price: Low to High</label>
          </div>
          <div
            className={`sort-option ${
              filters.sortBy === "price-desc" ? "active" : ""
            }`}
          >
            <input
              type="radio"
              id="price-desc"
              name="sort"
              value="price-desc"
              checked={filters.sortBy === "price-desc"}
              onChange={handleSortChange}
            />
            <label htmlFor="price-desc">Price: High to Low</label>
          </div>
          <div
            className={`sort-option ${
              filters.sortBy === "name-asc" ? "active" : ""
            }`}
          >
            <input
              type="radio"
              id="name-asc"
              name="sort"
              value="name-asc"
              checked={filters.sortBy === "name-asc"}
              onChange={handleSortChange}
            />
            <label htmlFor="name-asc">Name: A to Z</label>
          </div>
          <div
            className={`sort-option ${
              filters.sortBy === "name-desc" ? "active" : ""
            }`}
          >
            <input
              type="radio"
              id="name-desc"
              name="sort"
              value="name-desc"
              checked={filters.sortBy === "name-desc"}
              onChange={handleSortChange}
            />
            <label htmlFor="name-desc">Name: Z to A</label>
          </div>
          <div
            className={`sort-option ${
              filters.sortBy === "date-desc" ? "active" : ""
            }`}
          >
            <input
              type="radio"
              id="date-desc"
              name="sort"
              value="date-desc"
              checked={filters.sortBy === "date-desc"}
              onChange={handleSortChange}
            />
            <label htmlFor="date-desc">Newest First</label>
          </div>
          <div
            className={`sort-option ${
              filters.sortBy === "date-asc" ? "active" : ""
            }`}
          >
            <input
              type="radio"
              id="date-asc"
              name="sort"
              value="date-asc"
              checked={filters.sortBy === "date-asc"}
              onChange={handleSortChange}
            />
            <label htmlFor="date-asc">Oldest First</label>
          </div>
        </div>
      </div>
    </FilterWrapper>
  );
};

Filter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  filters: PropTypes.shape({
    minPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    maxPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    sortBy: PropTypes.string,
  }).isRequired,
};

export default Filter;
