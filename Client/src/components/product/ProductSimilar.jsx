import { products } from "../../data/data";
import { Section } from "../../styles/styles";
import Title from "../common/Title";
import ProductList from "./ProductList";
import { getAllProducts } from "../../services/productService";

const ProductSimilar = () => {
  const [products, setProducts] = useState([]);
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
    <Section>
      <Title titleText={"Similar Products"} />
      <ProductList products={products} />
    </Section>
  );
};

export default ProductSimilar;
