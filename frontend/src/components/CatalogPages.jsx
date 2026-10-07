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
            <span className="catalog-product-open">VIEW THE DRESS ↗</span>
          </div>
          <div className="catalog-product-meta">
            <div><h2>{product.name}</h2><p>{product.collection_name || "HOUSE OF DAKSHA"}</p></div>
            <strong>{formatPrice(product.price)}</strong>
          </div>
        </a>
      ))}
    </div>
  );
}

export function ShopCatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    apiRequest("/products")
      .then((data) => setProducts(data.products || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="inner-page shop-page">
      <header className="inner-page-intro">
        <p className="section-kicker">THE HOUSE OF DAKSHA SHOP</p>
        <h1>Good clothes for<br /><em>the life you live.</em></h1>
        <p>Thoughtfully handpicked cotton dresses, easy co-ords and comfortable maternity wear—made for workdays, slow mornings and everything between.</p>
      </header>
      <PageState loading={loading} error={error} empty={!products.length && !loading && !error ? "The first pieces are being prepared. Come back soon." : ""}>
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
          <p className="product-detail-price">{formatPrice(product.price)}</p>
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
