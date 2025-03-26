import { useState, useEffect } from "react";
import styled from "styled-components";
import { defaultTheme } from "../../styles/themes/default";
import * as productService from "../../services/productService";
import * as categoryService from "../../services/categoryService";
import * as materialService from "../../services/materialService";
import { PropTypes } from "prop-types";

const FilterWrapper = styled.div`
  padding: 16px;

  .filter-section {
    margin-bottom: 24px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      color: ${defaultTheme.color_outerspace};
    }

    .price-range {
      display: flex;
      align-items: center;
      gap: 8px;

      .price-input-wrapper {
        flex: 1;
        position: relative;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
        transition: all 0.2s;

        &.active {
          border-color: ${defaultTheme.color_sea_green};
        }

        input {
          width: 100%;
          padding: 8px 12px;
          border: none;
          outline: none;
          font-size: 14px;

          &::-webkit-outer-spin-button,
          &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          &[type="number"] {
            -moz-appearance: textfield;
          }
        }
      }

      .separator {
        font-weight: 500;
        color: #888;
      }
    }
  }

  .sort-section {
    margin-top: 16px;

    select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
      outline: none;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;

      &:focus {
        border-color: ${defaultTheme.color_sea_green};
      }
    }
  }

  .list-filter {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 20px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background: #aaa;
      border-radius: 8px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #888;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      padding: 8px 10px;
      border-radius: 4px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      cursor: pointer;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      &.selected {
        background-color: rgba(48, 160, 122, 0.1);
        color: ${defaultTheme.color_sea_green};
        font-weight: 500;
      }

      input {
        margin-right: 8px;
      }
    }
  }
`;

const Filter = ({ onFilterChange, filters }) => {
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and materials when component mounts
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoryResult = await categoryService.getAllCategories();
        if (categoryResult.success) {
          setCategories(categoryResult.data || []);
        }

        // Fetch materials
        const materialResult = await materialService.getAllMaterials();
        if (materialResult.success) {
          setMaterials(materialResult.data || []);
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltersData();
  }, []);

  // Handle price input changes
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value ? Number(value) : "",
    });
  };

  // Handle sort selection change
  const handleSortChange = (e) => {
    onFilterChange({
      ...filters,
      sortBy: e.target.value,
    });
  };

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(updatedCategories);

    onFilterChange({
      ...filters,
      categories: updatedCategories,
    });
  };

  // Handle material selection
  const handleMaterialChange = (materialId) => {
    const updatedMaterials = selectedMaterials.includes(materialId)
      ? selectedMaterials.filter((id) => id !== materialId)
      : [...selectedMaterials, materialId];

    setSelectedMaterials(updatedMaterials);

    onFilterChange({
      ...filters,
      materials: updatedMaterials,
    });
  };

  return (
    <FilterWrapper>
      {/* Categories Section */}
      <div className="filter-section">
        <h3>Categories</h3>
        <div className="list-filter">
          <ul>
            {categories.map((category) => (
              <li
                key={category._id}
                className={
                  selectedCategories.includes(category._id) ? "selected" : ""
                }
                onClick={() => handleCategoryChange(category._id)}
              >
                <input
                  type="checkbox"
                  id={`category-${category._id}`}
                  checked={selectedCategories.includes(category._id)}
                  onChange={() => {}}
                />
                <label htmlFor={`category-${category._id}`}>
                  {category.name}
                </label>
              </li>
            ))}
            {categories.length === 0 && !loading && (
              <li className="no-items">No categories found</li>
            )}
            {loading && <li className="loading">Loading categories...</li>}
          </ul>
        </div>
      </div>

      {/* Materials Section */}
      <div className="filter-section">
        <h3>Materials</h3>
        <div className="list-filter">
          <ul>
            {materials.map((material) => (
              <li
                key={material._id}
                className={
                  selectedMaterials.includes(material._id) ? "selected" : ""
                }
                onClick={() => handleMaterialChange(material._id)}
              >
                <input
                  type="checkbox"
                  id={`material-${material._id}`}
                  checked={selectedMaterials.includes(material._id)}
                  onChange={() => {}}
                />
                <label htmlFor={`material-${material._id}`}>
                  {material.name}
                </label>
              </li>
            ))}
            {materials.length === 0 && !loading && (
              <li className="no-items">No materials found</li>
            )}
            {loading && <li className="loading">Loading materials...</li>}
          </ul>
        </div>
      </div>

      {/* Price Range Section */}
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

      {/* Sort Section */}
      <div className="filter-section sort-section">
        <h3>Sort By</h3>
        <select
          value={filters.sortBy || "date-desc"}
          onChange={handleSortChange}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
        </select>
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
    categories: PropTypes.array,
    materials: PropTypes.array,
  }).isRequired,
};

export default Filter;
