import styled from "styled-components";
import { useState } from "react";
import { PropTypes } from "prop-types";

const MobileFilterWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;

  .filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;

    h3 {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin: 0;
    }

    i {
      transition: transform 0.3s ease;
      &.open {
        transform: rotate(180deg);
      }
    }
  }

  .filter-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-top: 8px;
    padding: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    display: none;

    &.open {
      display: block;
    }
  }

  .price-range {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 16px;

    input {
      width: 100px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  }

  .sort-options {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #666;
      transition: color 0.2s;

      &:hover {
        color: #000;
      }

      input[type="radio"] {
        margin: 0;
      }
    }
  }
`;

const MobileFilter = ({ onFilterChange, filters }) => {
  const [isOpen, setIsOpen] = useState(false);

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
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <MobileFilterWrapper>
      <div className="filter-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>Filter & Sort</h3>
        <i className={`bi bi-chevron-down ${isOpen ? "open" : ""}`}></i>
      </div>
      <div className={`filter-dropdown ${isOpen ? "open" : ""}`}>
        <div className="price-range">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={handlePriceChange}
          />
          <span>-</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={handlePriceChange}
          />
        </div>
        <div className="sort-options">
          <label>
            <input
              type="radio"
              name="sort"
              value="price-asc"
              checked={filters.sortBy === "price-asc"}
              onChange={handleSortChange}
            />
            Price: Low to High
          </label>
          <label>
            <input
              type="radio"
              name="sort"
              value="price-desc"
              checked={filters.sortBy === "price-desc"}
              onChange={handleSortChange}
            />
            Price: High to Low
          </label>
          <label>
            <input
              type="radio"
              name="sort"
              value="name-asc"
              checked={filters.sortBy === "name-asc"}
              onChange={handleSortChange}
            />
            Name: A to Z
          </label>
          <label>
            <input
              type="radio"
              name="sort"
              value="name-desc"
              checked={filters.sortBy === "name-desc"}
              onChange={handleSortChange}
            />
            Name: Z to A
          </label>
          <label>
            <input
              type="radio"
              name="sort"
              value="date-desc"
              checked={filters.sortBy === "date-desc"}
              onChange={handleSortChange}
            />
            Newest First
          </label>
          <label>
            <input
              type="radio"
              name="sort"
              value="date-asc"
              checked={filters.sortBy === "date-asc"}
              onChange={handleSortChange}
            />
            Oldest First
          </label>
        </div>
      </div>
    </MobileFilterWrapper>
  );
};

MobileFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  filters: PropTypes.shape({
    minPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    maxPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    sortBy: PropTypes.string,
  }).isRequired,
};

export default MobileFilter;
