import { useCallback, useEffect, useState } from "react";
import { apiRequest, formatPrice } from "../lib/api.js";

// Temporary dashboard preview. Enable explicitly in hosted builds until the API is deployed.
const ADMIN_TEST_MODE = import.meta.env.DEV || import.meta.env.VITE_ADMIN_TEST_MODE === "true";

function AdminBrand() {
  return <a className="admin-brand" href="#/home">HOUSE <i>OF</i> DAKSHA <span>✳</span></a>;
}

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ADMIN_TEST_MODE) return;
    apiRequest("/auth/me").then(() => { window.location.hash = "#/admin"; }).catch(() => {});
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    if (ADMIN_TEST_MODE) {
      window.location.hash = "#/admin";
      return;
    }
    try {
      await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      window.location.hash = "#/admin";
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-page">
      <svg className="login-vine login-vine-left" viewBox="0 0 280 760" aria-hidden="true">
        <path className="vine-stem" d="M23 750C112 650 25 566 101 472S160 302 96 219 126 91 182 12" />
        <path className="vine-leaf" d="M99 474c-49-5-68-36-63-67 36 3 60 27 63 67Zm5-8c6-43 34-62 64-57-5 34-29 55-64 57ZM101 300c-44-8-59-39-51-68 34 6 54 30 51 68Zm2-6c12-37 40-50 67-39-11 29-35 43-67 39ZM135 127c-35-17-41-47-25-71 27 13 39 40 25 71Zm1-5c21-29 50-33 72-14-18 22-43 28-72 14Z" />
        <path className="vine-flower" d="M43 645c-24-19-10-44 9-39 4-24 34-22 35 2 22-8 38 18 18 35 8 22-18 38-35 20-21 9-39-7-27-18Z" />
        <circle className="vine-center" cx="75" cy="647" r="7" />
        <path className="vine-flower" d="M177 325c-18-16-6-34 8-30 3-18 25-16 26 2 17-6 28 14 14 26 6 16-14 27-26 14-16 7-29-5-22-12Z" />
        <circle className="vine-center" cx="203" cy="325" r="5" />
      </svg>
      <svg className="login-vine login-vine-right" viewBox="0 0 280 760" aria-hidden="true">
        <path className="vine-stem" d="M258 750C168 650 255 566 179 472S120 302 184 219 154 91 98 12" />
        <path className="vine-leaf" d="M181 474c49-5 68-36 63-67-36 3-60 27-63 67Zm-5-8c-6-43-34-62-64-57 5 34 29 55 64 57ZM179 300c44-8 59-39 51-68-34 6-54 30-51 68Zm-2-6c-12-37-40-50-67-39 11 29 35 43 67 39ZM145 127c35-17 41-47 25-71-27 13-39 40-25 71Zm-1-5c-21-29-50-33-72-14 18 22 43 28 72 14Z" />
        <path className="vine-flower" d="M237 645c24-19 10-44-9-39-4-24-34-22-35 2-22-8-38 18-18 35-8 22 18 38 35 20 21 9 39-7 27-18Z" />
        <circle className="vine-center" cx="205" cy="647" r="7" />
        <path className="vine-flower" d="M103 325c18-16 6-34-8-30-3-18-25-16-26 2-17-6-28 14-14 26-6 16 14 27 26 14 16 7 29-5 22-12Z" />
        <circle className="vine-center" cx="77" cy="325" r="5" />
      </svg>
      <AdminBrand />
      <section className="admin-login-card">
        <span className="login-card-flower" aria-hidden="true">✿</span>
        <p className="section-kicker">HOUSE OF DAKSHA · ADMIN</p>
        <h1>Welcome back.</h1>
        <p className="admin-login-intro">Sign in to tend to your collections and pieces.</p>
        <form onSubmit={handleSubmit}>
          <label>Email address<input autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required={!ADMIN_TEST_MODE} /></label>
          <label>Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required={!ADMIN_TEST_MODE} /></label>
          {error && <p className="admin-form-error" role="alert">{error}</p>}
          <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? "Opening…" : ADMIN_TEST_MODE ? "Open dashboard" : "Sign in"}</button>
        </form>
        <a className="admin-back-link" href="#/home">← Back to the storefront</a>
      </section>
    </main>
  );
}

function ImageField({ label, kind, imageUrl, imagePublicId, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      body.append("kind", kind);
      const result = await apiRequest("/admin/uploads", { method: "POST", body });
      onChange({ image_url: result.image_url, image_public_id: result.image_public_id });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-image-field">
      <span className="admin-field-label">{label}</span>
      {imageUrl ? <img className="admin-image-preview" src={imageUrl} alt="Selected upload preview" /> : <div className="admin-image-empty">A product photo helps customers picture the piece.</div>}
      <label className="admin-upload-button">
        {busy ? "Uploading to Cloudinary…" : imageUrl ? "Replace image" : "Upload image"}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} disabled={busy} />
      </label>
      {error && <p className="admin-form-error" role="alert">{error}</p>}
      {imagePublicId && <small className="admin-upload-success">Image stored securely in Cloudinary.</small>}
    </div>
  );
}

const emptyCollection = { name: "", slug: "", description: "", image_url: "", image_public_id: "", is_published: false, sort_order: 0 };
const emptyProduct = { name: "", slug: "", collection_id: "", category: "daily-wear", description: "", price: "", compare_at_price: "", sizes: "", fabric: "", care: "", image_url: "", image_public_id: "", is_published: false };

function CollectionForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyCollection);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError("");
    try { await onSave(form); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }
  return (
    <form className="admin-edit-form" onSubmit={submit}>
      <div className="admin-form-heading"><div><p className="section-kicker">COLLECTION DETAILS</p><h2>{initial?.id ? "Edit collection" : "Add a collection"}</h2></div><button type="button" className="admin-text-button" onClick={onCancel}>Cancel</button></div>
      <div className="admin-form-grid">
        <label>Collection name<input value={form.name} onChange={(event) => set("name", event.target.value)} required maxLength="120" /></label>
        <label>URL slug<input placeholder="Created from the name if blank" value={form.slug} onChange={(event) => set("slug", event.target.value)} /></label>
        <label className="admin-full-field">Short description<textarea rows="4" value={form.description} onChange={(event) => set("description", event.target.value)} maxLength="4000" /></label>
        <label>Display order<input type="number" min="0" value={form.sort_order ?? 0} onChange={(event) => set("sort_order", event.target.value)} /></label>
        <ImageField label="Collection image" kind="collection" imageUrl={form.image_url} imagePublicId={form.image_public_id} onChange={(image) => setForm((current) => ({ ...current, ...image }))} />
        <label className="admin-checkbox"><input type="checkbox" checked={Boolean(form.is_published)} onChange={(event) => set("is_published", event.target.checked)} /> Publish this collection</label>
      </div>
      {error && <p className="admin-form-error" role="alert">{error}</p>}
      <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : "Save collection"}</button>
    </form>
  );
}

function ProductForm({ initial, collections, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? { ...initial, sizes: Array.isArray(initial.sizes) ? initial.sizes.join(", ") : initial.sizes } : emptyProduct);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError("");
    try { await onSave(form); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }
  return (
    <form className="admin-edit-form" onSubmit={submit}>
      <div className="admin-form-heading"><div><p className="section-kicker">DRESS DETAILS</p><h2>{initial?.id ? "Edit dress" : "Add a dress"}</h2></div><button type="button" className="admin-text-button" onClick={onCancel}>Cancel</button></div>
      <div className="admin-form-grid">
        <label>Dress name<input value={form.name} onChange={(event) => set("name", event.target.value)} required maxLength="160" /></label>
        <label>URL slug<input placeholder="Created from the name if blank" value={form.slug} onChange={(event) => set("slug", event.target.value)} /></label>
        <label>Collection<select value={form.collection_id || ""} onChange={(event) => set("collection_id", event.target.value)}><option value="">No collection</option>{collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}</select></label>
        <label>Shop category<select value={form.category || "daily-wear"} onChange={(event) => set("category", event.target.value)}><option value="daily-wear">Daily wear Kurti / Dresses</option><option value="co-ord-sets">Co-Ord Sets</option><option value="maternity-wear">Maternity Wear</option></select></label>
        <label>Price (₹)<input inputMode="decimal" type="number" min="0" step="0.01" value={form.price} onChange={(event) => set("price", event.target.value)} required /></label>
        <label>Original price (₹)<small>Set higher than the sale price to show this piece under On Sale.</small><input inputMode="decimal" type="number" min="0" step="0.01" value={form.compare_at_price ?? ""} onChange={(event) => set("compare_at_price", event.target.value)} /></label>
        <label>Sizes <small>Separate sizes with commas</small><input placeholder="S, M, L, XL" value={form.sizes || ""} onChange={(event) => set("sizes", event.target.value)} /></label>
        <label className="admin-full-field">Description<textarea rows="5" value={form.description || ""} onChange={(event) => set("description", event.target.value)} maxLength="6000" /></label>
        <label>Fabric<input placeholder="For example, handpicked cotton" value={form.fabric || ""} onChange={(event) => set("fabric", event.target.value)} maxLength="160" /></label>
        <label>Care instructions<input value={form.care || ""} onChange={(event) => set("care", event.target.value)} maxLength="2000" /></label>
        <ImageField label="Dress photograph" kind="product" imageUrl={form.image_url} imagePublicId={form.image_public_id} onChange={(image) => setForm((current) => ({ ...current, ...image }))} />
        <label className="admin-checkbox"><input type="checkbox" checked={Boolean(form.is_published)} onChange={(event) => set("is_published", event.target.checked)} /> Publish this dress</label>
      </div>
      {error && <p className="admin-form-error" role="alert">{error}</p>}
      <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : "Save dress"}</button>
    </form>
  );
}

export function AdminDashboardPage() {
  const [admin, setAdmin] = useState(null);
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("overview");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (ADMIN_TEST_MODE) {
      setAdmin({ email: "Local preview" });
      setCollections([]);
      setProducts([]);
      return;
    }
    const session = await apiRequest("/auth/me");
    setAdmin(session.admin);
    const [collectionData, productData] = await Promise.all([
      apiRequest("/admin/collections"),
      apiRequest("/admin/products"),
    ]);
    setCollections(collectionData.collections || []);
    setProducts(productData.products || []);
  }, []);

  useEffect(() => {
    loadData().catch((requestError) => {
      if (requestError.message.includes("session") || requestError.message.includes("Sign in")) window.location.hash = "#/admin/login";
      else setError(requestError.message);
    }).finally(() => setLoading(false));
  }, [loadData]);

  async function saveCollection(form) {
    const editingId = editing?.type === "collection" ? editing.item.id : null;
    await apiRequest(editingId ? `/admin/collections/${editingId}` : "/admin/collections", {
      method: editingId ? "PATCH" : "POST", body: JSON.stringify(form),
    });
    setEditing(null); setView("collections"); await loadData();
  }

  async function saveProduct(form) {
    const editingId = editing?.type === "product" ? editing.item.id : null;
    await apiRequest(editingId ? `/admin/products/${editingId}` : "/admin/products", {
      method: editingId ? "PATCH" : "POST", body: JSON.stringify(form),
    });
    setEditing(null); setView("products"); await loadData();
  }

  async function removeItem(type, item) {
    if (!window.confirm(`Remove “${item.name}”? This cannot be undone.`)) return;
    setError("");
    try { await apiRequest(`/admin/${type === "collection" ? "collections" : "products"}/${item.id}`, { method: "DELETE" }); await loadData(); }
    catch (requestError) { setError(requestError.message); }
  }

  async function logout() {
    try { await apiRequest("/auth/logout", { method: "POST" }); }
    finally { window.location.hash = "#/admin/login"; }
  }

  const title = view === "collections" ? "Collections" : view === "products" ? "Dresses" : "Your shop, at a glance";
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <AdminBrand />
        <p className="admin-sidebar-label">STOREFRONT</p>
        {[["overview", "Overview"], ["collections", "Collections"], ["products", "Dresses"]].map(([key, label]) => (
          <button key={key} className={`admin-nav-item ${view === key ? "is-active" : ""}`} onClick={() => { setEditing(null); setView(key); }}>{label}<span>{key === "collections" ? collections.length : key === "products" ? products.length : ""}</span></button>
        ))}
        <a className="admin-store-link" href="#/home">↗ View storefront</a>
        <button className="admin-logout" onClick={logout}>Sign out</button>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><p className="section-kicker">HOUSE OF DAKSHA · STORE MANAGEMENT</p><h1>{title}</h1></div><span>{admin?.email}</span></header>
        {ADMIN_TEST_MODE && <p className="admin-preview-notice" role="status"><span aria-hidden="true">✳</span> Preview mode · sign-in and saving changes are not connected yet.</p>}
        {error && <p className="admin-form-error" role="alert">{error}</p>}
        {loading ? <p className="admin-loading">Opening your dashboard…</p> : <>
          {view === "overview" && <section className="admin-overview">
            <div className="admin-overview-hero">
              <div className="admin-overview-copy">
                <p className="section-kicker">YOUR LITTLE CORNER OF THE DAKSHA WORLD</p>
                <h2>A little space<br />to <em>grow.</em></h2>
                <p>Bring your thoughtful cotton edits together, one lovely piece at a time.</p>
                <div className="admin-quick-actions">
                  <button className="admin-action-primary" onClick={() => { setEditing({ type: "product", item: null }); setView("products"); }}>＋ Add a dress</button>
                  <button onClick={() => { setEditing({ type: "collection", item: null }); setView("collections"); }}>＋ Create a collection</button>
                </div>
              </div>
              <div className="admin-overview-bloom" aria-hidden="true">
                <svg viewBox="0 0 300 270" fill="none">
                  <path d="M150 244c-7-49 13-94 54-132M150 244c-9-53-45-83-91-98m91 98c18-33 49-46 91-46" />
                  <path d="M201 112c-22-20-19-48 4-62 22 15 27 41 4 62m-4 1c2-29 19-44 43-39-1 24-17 40-43 39ZM60 146c-1-28 17-46 43-41 2 24-13 41-43 41m-1 0c25-15 48-10 59 11-19 15-42 12-59-11Zm185 21c6-27 29-39 51-25-5 24-25 36-51 25m-1 0c28-7 47 5 50 29-23 9-44-1-50-29Z" />
                  <path d="M150 152c-33-20-30-53-6-60 2-30 39-34 48-5 30-7 47 22 24 44 8 29-23 47-45 28-23 13-43-1-36-7Z" />
                  <circle cx="162" cy="143" r="6" />
                  <path d="M149 245c-12 11-27 16-44 15m46-15c12 11 27 16 44 15" />
                </svg>
                <span>HOUSE OF DAKSHA <i>✳</i></span>
              </div>
            </div>
            <div className="admin-stats">
              <article><span>YOUR COLLECTIONS</span><strong>{collections.length.toString().padStart(2, "0")}</strong><small>{collections.filter((item) => item.is_published).length} available to shoppers</small></article>
              <article><span>YOUR DRESSES</span><strong>{products.length.toString().padStart(2, "0")}</strong><small>{products.filter((item) => item.is_published).length} pieces published</small></article>
              <article><span>SHOP STATUS</span><strong className="admin-stat-word">{products.filter((item) => item.is_published).length ? "In bloom" : "A new page"}</strong><small>{products.filter((item) => item.is_published).length ? "Your collection is visible" : "Your first piece is waiting"}</small></article>
            </div>
          </section>}
          {view === "collections" && <section className="admin-content-panel">
            {!editing && <div className="admin-panel-heading"><div><p className="section-kicker">YOUR EDITS</p><h2>Collections</h2></div><button className="admin-primary-button" onClick={() => setEditing({ type: "collection", item: null })}>＋ Add collection</button></div>}
            {editing?.type === "collection" ? <CollectionForm key={editing.item?.id || "new-collection"} initial={editing.item} onSave={saveCollection} onCancel={() => setEditing(null)} /> : <ItemList items={collections} type="collection" onEdit={(item) => setEditing({ type: "collection", item })} onRemove={(item) => removeItem("collection", item)} />}
          </section>}
          {view === "products" && <section className="admin-content-panel">
            {!editing && <div className="admin-panel-heading"><div><p className="section-kicker">YOUR PIECES</p><h2>Dresses</h2></div><button className="admin-primary-button" onClick={() => setEditing({ type: "product", item: null })}>＋ Add dress</button></div>}
            {editing?.type === "product" ? <ProductForm key={editing.item?.id || "new-product"} initial={editing.item} collections={collections} onSave={saveProduct} onCancel={() => setEditing(null)} /> : <ItemList items={products} type="product" onEdit={(item) => setEditing({ type: "product", item })} onRemove={(item) => removeItem("product", item)} />}
          </section>}
        </>}
      </main>
    </div>
  );
}

function ItemList({ items, type, onEdit, onRemove }) {
  if (!items.length) return <div className="admin-empty"><span>✿</span><h3>Nothing here just yet.</h3><p>Add your first {type === "product" ? "dress" : "collection"} to begin building the shop.</p></div>;
  return <div className="admin-item-list">{items.map((item) => <article className="admin-item-row" key={item.id}>
    <div className="admin-item-thumb">{item.image_url ? <img src={item.image_url} alt="" /> : <span>✿</span>}</div>
    <div className="admin-item-info"><h3>{item.name}</h3><p>{type === "product" ? `${formatPrice(item.price)} · ${item.category?.replaceAll("-", " ") || "daily wear"} · ${item.collection_name || "Unassigned"}` : `${item.product_count || 0} dresses · /${item.slug}`}</p></div>
    <span className={`admin-status ${item.is_published ? "is-live" : ""}`}>{item.is_published ? "Published" : "Draft"}</span>
    {type === "product" && item.is_published && <a className="admin-item-view" href={`#/product/${item.slug}`} target="_blank" rel="noreferrer">View</a>}
    <button className="admin-text-button" onClick={() => onEdit(item)}>Edit</button>
    <button className="admin-delete-button" aria-label={`Remove ${item.name}`} onClick={() => onRemove(item)}>Remove</button>
  </article>)}</div>;
}
