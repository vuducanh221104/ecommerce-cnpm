import { useState, useEffect } from "react";
import styled from "styled-components";
import Hero from "../../components/home/Hero";
import Featured from "../../components/home/Featured";
import NewArrival from "../../components/home/NewArrival";
import SavingZone from "../../components/home/SavingZone";
import Catalog from "../../components/home/Catalog";
import { limelightCatalog, mensCatalog, womensCatalog } from "../../data/data";
import Brands from "../../components/home/Brands";
import Feedback from "../../components/home/Feedback";
import { getAllProducts } from "../../services/productService";

const HomeScreenWrapper = styled.main``;

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  console.log(products);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  console.log(products);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const result = await getAllProducts();
        console.log(result.data);
        if (result) {
          setProducts(result.data);
        }
      } catch (err) {
        setError("Failed to fetch products");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <HomeScreenWrapper>
      <Hero />
      <Featured />
      {/* <NewArrival products={products} /> */}
      {/* <SavingZone /> */}
      <Catalog catalogTitle={"All Product"} products={products.slice(0, 6)} />
      <Catalog
        catalogTitle={"Men's Fashion"}
        products={products
          .filter(
            (p) =>
              p.category_id && p.category_id.some((cat) => cat.slug === "men")
          )
          .slice(0, 6)}
      />
      <Catalog
        catalogTitle={"Women's Fashion"}
        products={products
          .filter(
            (p) =>
              p.category_id && p.category_id.some((cat) => cat.slug === "women")
          )
          .slice(0, 6)}
      />
      <Catalog
        catalogTitle={"Children's Fashion"}
        products={products
          .filter(
            (p) =>
              p.category_id &&
              p.category_id.some((cat) => cat.slug === "children")
          )
          .slice(0, 6)}
      />
      <Catalog
        catalogTitle={"Sale"}
        products={products
          .filter(
            (p) =>
              p.category_id && p.category_id.some((cat) => cat.slug === "sale")
          )
          .slice(0, 6)}
      />
      <Brands />
      {/* <Catalog catalogTitle={"In The LimeLight"} products={limelightCatalog} /> */}
      <Feedback />
    </HomeScreenWrapper>
  );
};

export default HomeScreen;
