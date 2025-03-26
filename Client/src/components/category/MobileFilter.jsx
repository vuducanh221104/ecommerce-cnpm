import styled from "styled-components";
import { useState, useEffect } from "react";
import { PropTypes } from "prop-types";
import * as categoryService from "../../services/categoryService";
import * as materialService from "../../services/materialService";

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

  .filter-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;

    .tab {
      padding: 8px 16px;
      background: #f0f0f0;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;

      &.active {
        background: #000;
        color: #fff;
      }

      &:hover {
        background: #ddd;
      }
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

  .filter-list {
    margin-bottom: 16px;

    .filter-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #666;
      transition: color 0.2s;

      &:hover {
        color: #000;
      }

      input[type="checkbox"] {
        margin: 0;
      }
    }
  }

  .no-items {
    text-align: center;
    color: #666;
  }

  .loading {
    text-align: center;
    color: #666;
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

  .apply-button {
    width: 100%;
    padding: 12px;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #333;
    }
  }
`;

const MobileFilter = ({ onFilterChange, filters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    filters.categories || []
  );
  const [selectedMaterials, setSelectedMaterials] = useState(
    filters.materials || []
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("price"); // 'price', 'categories', 'materials', 'sort'

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

  // Update state when filters prop changes
  useEffect(() => {
    setSelectedCategories(filters.categories || []);
    setSelectedMaterials(filters.materials || []);
  }, [filters.categories, filters.materials]);

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
    <MobileFilterWrapper>
      <div className="filter-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>Filter & Sort</h3>
        <i className={`bi bi-chevron-down ${isOpen ? "open" : ""}`}></i>
      </div>
      <div className={`filter-dropdown ${isOpen ? "open" : ""}`}>
        <div className="filter-tabs">
          <div
            className={`tab ${activeTab === "price" ? "active" : ""}`}
            onClick={() => setActiveTab("price")}
          >
            Price
          </div>
          <div
            className={`tab ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            Categories
          </div>
          <div
            className={`tab ${activeTab === "materials" ? "active" : ""}`}
            onClick={() => setActiveTab("materials")}
          >
            Materials
          </div>
          <div
            className={`tab ${activeTab === "sort" ? "active" : ""}`}
            onClick={() => setActiveTab("sort")}
          >
            Sort
          </div>
        </div>

        {activeTab === "price" && (
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
        )}

        {activeTab === "categories" && (
          <div className="filter-list">
            {categories.map((category) => (
              <label key={category._id} className="filter-item">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category._id)}
                  onChange={() => handleCategoryChange(category._id)}
                />
                {category.name}
              </label>
            ))}
            {categories.length === 0 && !loading && (
              <div className="no-items">No categories found</div>
            )}
            {loading && <div className="loading">Loading categories...</div>}
          </div>
        )}

        {activeTab === "materials" && (
          <div className="filter-list">
            {materials.map((material) => (
              <label key={material._id} className="filter-item">
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(material._id)}
                  onChange={() => handleMaterialChange(material._id)}
                />
                {material.name}
              </label>
            ))}
            {materials.length === 0 && !loading && (
              <div className="no-items">No materials found</div>
            )}
            {loading && <div className="loading">Loading materials...</div>}
          </div>
        )}

        {activeTab === "sort" && (
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
        )}

        <button className="apply-button" onClick={() => setIsOpen(false)}>
          Apply Filters
        </button>
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
    categories: PropTypes.array,
    materials: PropTypes.array,
  }).isRequired,
};

export default MobileFilter;
