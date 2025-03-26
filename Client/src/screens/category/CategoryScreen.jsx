import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import CategoryGrid from "../../components/category/CategoryGrid";
import Filter from "../../components/category/Filter";
import MobileFilter from "../../components/category/MobileFilter";
import ModalLoading from "../../components/common/ModalLoading";
import {
  getProductsByCategory,
  getAllProducts,
} from "../../services/productService";

const CategoryScreenWrapper = styled.main`
  padding: 40px 0;
`;

const CategoryContent = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
  margin-top: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryHeader = styled.div`
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #666;
    font-size: 14px;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 18px;
`;

const ErrorWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: red;
  font-size: 18px;
`;

const DesktopFilter = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileFilterWrapper = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;

const CategoryScreen = () => {
  const { categorySlug } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sortBy: "date-desc",
    categories: [],
    materials: [],
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let result;

        if (categorySlug === "all") {
          // Fetch all products for the "Shop" page
          result = await getAllProducts();
          if (result?.success) {
            setAllProducts(result.data);
            setCategory({
              name: "Shop",
              slug: "all",
            });
          }
        } else {
          // Fetch products for specific category
          result = await getProductsByCategory(categorySlug, filters);
          if (result?.success) {
            setAllProducts(result.data.products);
            setCategory(result.data.category);
          }
        }

        if (!result?.success) {
          setError("Failed to fetch products");
        }
      } catch (err) {
        setError("An error occurred while fetching products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchProducts();
    }
  }, [categorySlug]);

  // Apply filters whenever filters change
  useEffect(() => {
    let filtered = [...allProducts];

    // Apply price filters
    if (filters.minPrice) {
      filtered = filtered.filter(
        (product) => product.price.original >= Number(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (product) => product.price.original <= Number(filters.maxPrice)
      );
    }

    // Apply category filters if any
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter((product) => {
        // Extract all category IDs from the product
        const productCategoryIds = product.category_id.map((cat) =>
          typeof cat === "object" ? cat._id : cat
        );
        // Check if any of the product's category IDs are in the selected categories
        return filters.categories.some((id) => productCategoryIds.includes(id));
      });
    }

    // Apply material filters if any
    if (filters.materials && filters.materials.length > 0) {
      filtered = filtered.filter((product) => {
        // Extract all material IDs from the product
        const productMaterialIds = product.material_id.map((mat) =>
          typeof mat === "object" ? mat._id : mat
        );
        // Check if any of the product's material IDs are in the selected materials
        return filters.materials.some((id) => productMaterialIds.includes(id));
      });
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price.original - b.price.original);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price.original - a.price.original);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "date-desc":
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "date-asc":
        filtered.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [allProducts, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (error || !category) {
    return (
      <CategoryScreenWrapper>
        <Container>
          <CategoryHeader>
            <h1>Shop</h1>
            <p>
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} products found`}
            </p>
          </CategoryHeader>
          <CategoryContent>
            <DesktopFilter>
              <Filter onFilterChange={handleFilterChange} filters={filters} />
            </DesktopFilter>
            <div>
              <MobileFilterWrapper>
                <MobileFilter
                  onFilterChange={handleFilterChange}
                  filters={filters}
                />
              </MobileFilterWrapper>
              <ModalLoading />
            </div>
          </CategoryContent>
        </Container>
      </CategoryScreenWrapper>
    );
  }

  const breadcrumbItems = [
    { label: "Home", link: "/" },
    { label: category.name, link: "" },
  ];

  return (
    <CategoryScreenWrapper>
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <CategoryHeader>
          <h1>{category.name}</h1>
          <p>
            {loading
              ? "Loading products..."
              : `${filteredProducts.length} products found`}
          </p>
        </CategoryHeader>
        <CategoryContent>
          <DesktopFilter>
            <Filter onFilterChange={handleFilterChange} filters={filters} />
          </DesktopFilter>
          <div>
            <MobileFilterWrapper>
              <MobileFilter
                onFilterChange={handleFilterChange}
                filters={filters}
              />
            </MobileFilterWrapper>
            {loading ? (
              <ModalLoading />
            ) : (
              <CategoryGrid products={filteredProducts} />
            )}
          </div>
        </CategoryContent>
      </Container>
    </CategoryScreenWrapper>
  );
};

export default CategoryScreen;
