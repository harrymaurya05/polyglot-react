import React from "react";
import { useTranslateDynamic, useTranslate } from "i18nsolutions";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface ProductTableProps {
  products: Product[];
}

/**
 * Example: Translating database/API data
 * - Fetches products from API/database
 * - Translates product names and descriptions dynamically
 * - Caches translations automatically
 */
export default function ProductTable({ products }: ProductTableProps) {
  const t = useTranslate();
  const translateDynamic = useTranslateDynamic();
  const [translatedProducts, setTranslatedProducts] = React.useState<Product[]>(
    []
  );
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Auto-translate when products change
    translateAllProducts();
  }, [products]);

  const translateAllProducts = async () => {
    setLoading(true);
    try {
      // Translate all products in parallel
      const translated = await Promise.all(
        products.map(async (product) => ({
          ...product,
          name: await translateDynamic(product.name),
          description: await translateDynamic(product.description),
          category: await translateDynamic(product.category),
        }))
      );
      setTranslatedProducts(translated);
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>{t("Loading products...")}</div>;
  }

  return (
    <div>
      <h3>{t("Products from Database")}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
              {t("Product")}
            </th>
            <th style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
              {t("Description")}
            </th>
            <th style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
              {t("Category")}
            </th>
            <th style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
              {t("Price")}
            </th>
          </tr>
        </thead>
        <tbody>
          {translatedProducts.map((product) => (
            <tr key={product.id}>
              <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
                {product.name}
              </td>
              <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
                {product.description}
              </td>
              <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
                {product.category}
              </td>
              <td style={{ padding: "0.5rem", border: "1px solid #ddd" }}>
                ${product.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
