import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import CategoryGrid from "../../components/category/CategoryGrid";
import Filter from "../../components/category/Filter";
import MobileFilter from "../../components/category/MobileFilter";
import { getAllProducts } from "../../services/productService";

const SearchScreenWrapper = styled.main`
  padding: 40px 0;
`;

const SearchContent = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
  margin-top: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchHeader = styled.div`
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

  .search-query {
    color: #000;
    font-weight: 600;
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

const SearchScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("q") || "";

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sortBy: "date-desc",
  });

  // Function to fetch all products and filter by search query
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const result = await getAllProducts();

        if (result?.data) {
          const products = result.data;
          // Filter products by search query (case insensitive)
          const searchResults = products.filter(
            (product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (product.description &&
                product.description
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())) ||
              (product.category_id &&
                product.category_id.some(
                  (cat) =>
                    cat.name &&
                    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
                ))
          );

          setAllProducts(searchResults);
        } else {
          setError("Failed to fetch products");
        }
      } catch (err) {
        setError("An error occurred while fetching products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchProducts();
    } else {
      setAllProducts([]);
      setLoading(false);
    }
  }, [searchQuery]);

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

  // Handle search input in this page itself (not the header search)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get("search-query");
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (loading) {
    return (
      <SearchScreenWrapper>
        <Container>
          <LoadingWrapper>Searching for products...</LoadingWrapper>
        </Container>
      </SearchScreenWrapper>
    );
  }

  if (error) {
    return (
      <SearchScreenWrapper>
        <Container>
          <ErrorWrapper>{error}</ErrorWrapper>
        </Container>
      </SearchScreenWrapper>
    );
  }

  const breadcrumbItems = [
    { label: "Home", link: "/" },
    { label: "Search Results", link: "" },
  ];

  return (
    <SearchScreenWrapper>
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <SearchHeader>
          <h1>
            Search Results for{" "}
            <span className="search-query">"{searchQuery}"</span>
          </h1>
          <p>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"} found
          </p>

          {/* Additional search box for refining search */}
          <form onSubmit={handleSearchSubmit} className="mt-4">
            <div className="flex max-w-md">
              <input
                type="text"
                name="search-query"
                defaultValue={searchQuery}
                placeholder="Refine your search"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-r-md hover:bg-gray-800"
              >
                Search
              </button>
            </div>
          </form>
        </SearchHeader>

        {!searchQuery ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              Please enter a search term to find products.
            </p>
          </div>
        ) : (
          <SearchContent>
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
              {filteredProducts.length > 0 ? (
                <CategoryGrid products={filteredProducts} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600">
                    No products match your search criteria.
                  </p>
                  <p className="mt-4">
                    Try adjusting your search or browse our categories.
                  </p>
                </div>
              )}
            </div>
          </SearchContent>
        )}
      </Container>
    </SearchScreenWrapper>
  );
};

export default SearchScreen;
