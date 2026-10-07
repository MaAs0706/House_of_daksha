import { useEffect, useState } from "react";
import { apiRequest, formatPrice } from "../lib/api.js";

function PageState({ loading, error, empty, children }) {
  if (loading) return <p className="catalog-state">A moment while we gather the collection…</p>;
  if (error) return <p className="catalog-state" role="alert">{error}</p>;
  if (empty) return <p className="catalog-state">{empty}</p>;
  return children;
}

function ProductCards({ products }) {
  if (!products.length) return <p className="catalog-state">We’re getting the next edit ready. Check back soon.</p>;
  return (
    <div className="catalog-products">
      {products.map((product) => (
        <a className="catalog-product" href={`#/product/${product.slug}`} key={product.id}>
          <div className="catalog-product-image">
            {product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" /> : <span>✿</span>}
            {Number(product.compare_at_price) > Number(product.price) && <span className="catalog-sale-badge">ON SALE</span>}
            <span className="catalog-product-open">VIEW THIS PIECE ↗</span>
          </div>
          <div className="catalog-product-meta">
            <div><h2>{product.name}</h2><p>{product.collection_name || "HOUSE OF DAKSHA"}</p></div>
            <strong>{formatPrice(product.price)} {Number(product.compare_at_price) > Number(product.price) && <del>{formatPrice(product.compare_at_price)}</del>}</strong>
          </div>
        </a>
      ))}
    </div>
  );
}

const SHOP_CATEGORY_INFO = {
  "daily-wear": {
    title: "Effortless Everyday Cottons",
    accent: "Daily wear Kurti / Dresses",
    description: "Breathable, handpicked cotton dresses designed for all-day comfort. From morning meetings to evening errands, stay light, comfortable, and polished without breaking your budget.",
  },
  "co-ord-sets": {
    title: "Matching Style,",
    accent: "Zero Hassle",
    description: "Perfectly paired cotton co-ords for work, travel, and casual outings. Easy to style, soft on the skin, and tailored for effortless daily elegance.",
  },
  "maternity-wear": {
    title: "Comfort & Confidence",
    accent: "for New Moms",
    description: "Soft, budget-friendly outerwear crafted for expectant and new mothers. Thoughtfully designed to give you flattering fits, easy movement, and total confidence whenever you step out.",
  },
};

export function ShopCatalogPage({ category = "", onSale = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    setError("");
    setProducts([]);
    const query = onSale ? "?on_sale=true" : category ? `?category=${encodeURIComponent(category)}` : "";
    apiRequest(`/products${query}`)
      .then((data) => setProducts(data.products || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [category, onSale]);
  const info = SHOP_CATEGORY_INFO[category];
  return (
    <div className="inner-page shop-page">
      <header className="inner-page-intro">
        <p className="section-kicker">{onSale ? "A LITTLE SOMETHING FOR LESS" : info ? "A HOUSE OF DAKSHA EDIT" : "THE HOUSE OF DAKSHA SHOP"}</p>
        <h1>{onSale ? <>Good things,<br /><em>softer prices.</em></> : info ? <>{info.title}<br /><em>{info.accent}</em></> : <>Good clothes for<br /><em>the life you live.</em></>}</h1>
        <p>{onSale ? "Thoughtfully handpicked pieces, now at special prices. Find a little more room in your wardrobe and your budget." : info?.description || "Thoughtfully handpicked cotton dresses, easy co-ords and comfortable maternity wear—made for workdays, slow mornings and everything between."}</p>
      </header>
      <PageState loading={loading} error={error} empty={!products.length && !loading && !error ? onSale ? "No pieces are on sale right now. Check back for the next little treat." : "The first pieces are being prepared. Come back soon." : ""}>
        <ProductCards products={products} />
      </PageState>
      <a className="shop-gallery-link" href="#/gallery">See the pieces in real life <span aria-hidden="true">↗</span></a>
    </div>
  );
}

export function CollectionDirectory() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    apiRequest("/collections")
      .then((data) => setCollections(data.collections || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <section className="collection-directory">
      <header><p className="section-kicker">THE LATEST FROM DAKSHA</p><h2>Collections to live in.</h2></header>
      <PageState loading={loading} error={error} empty={!collections.length && !loading && !error ? "Our first collection is being prepared. Come back soon." : ""}>
        <div className="collection-directory-grid">
          {collections.map((collection) => (
            <a className="collection-directory-card" href={`#/collection/${collection.slug}`} key={collection.id}>
              {collection.image_url && <img src={collection.image_url} alt="" loading="lazy" />}
              <span>{String(collection.product_count).padStart(2, "0")} PIECES</span>
              <h3>{collection.name}</h3>
              <p>{collection.description}</p>
              <b>EXPLORE THE COLLECTION ↗</b>
            </a>
          ))}
        </div>
      </PageState>
    </section>
  );
}

export function CollectionDetailPage({ slug }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setResult(null);
    setError("");
    apiRequest(`/collections/${encodeURIComponent(slug)}`)
      .then(setResult)
      .catch((requestError) => setError(requestError.message));
  }, [slug]);
  return (
    <div className="inner-page collection-detail-page">
      <PageState loading={!result && !error} error={error}>
        {result && <>
          <header className="inner-page-intro">
            <p className="section-kicker">A HOUSE OF DAKSHA COLLECTION</p>
            <h1>{result.collection.name}</h1>
            <p>{result.collection.description}</p>
          </header>
          <ProductCards products={result.products} />
        </>}
      </PageState>
    </div>
  );
}

export function ProductDetailPage({ slug }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setProduct(null);
    setError("");
    apiRequest(`/products/${encodeURIComponent(slug)}`)
      .then((data) => setProduct(data.product))
      .catch((requestError) => setError(requestError.message));
  }, [slug]);

  if (!product && !error) return <div className="inner-page"><p className="catalog-state">A moment while we find that piece…</p></div>;
  if (error) return <div className="inner-page"><p className="catalog-state" role="alert">{error}</p><a className="collection-link" href="#/shop">Back to the shop ↗</a></div>;
  return (
    <div className="inner-page product-detail-page">
      <a className="product-back-link" href={product.collection_slug ? `#/collection/${product.collection_slug}` : "#/shop"}>← BACK TO {product.collection_name || "THE SHOP"}</a>
      <div className="product-detail-layout">
        <div className="product-detail-image">{product.image_url && <img src={product.image_url} alt={product.name} />}</div>
        <article className="product-detail-copy">
          <p className="section-kicker">{product.collection_name || "HOUSE OF DAKSHA"}</p>
          <h1>{product.name}</h1>
          <p className="product-detail-price">{formatPrice(product.price)} {Number(product.compare_at_price) > Number(product.price) && <del>{formatPrice(product.compare_at_price)}</del>}</p>
          <p className="product-detail-description">{product.description}</p>
          {product.sizes?.length > 0 && <div className="product-detail-field"><span>AVAILABLE SIZES</span><p>{product.sizes.join(" · ")}</p></div>}
          {product.fabric && <div className="product-detail-field"><span>FABRIC</span><p>{product.fabric}</p></div>}
          {product.care && <div className="product-detail-field"><span>CARE</span><p>{product.care}</p></div>}
          <a className="product-detail-cta" href="#/contact">Ask us about this piece <span aria-hidden="true">↗</span></a>
        </article>
      </div>
    </div>
  );
}
