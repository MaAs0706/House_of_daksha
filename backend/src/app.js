import { randomUUID } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import multer from "multer";
import { pool } from "./db.js";
import { clearAdminCookie, requireAdmin, requireTrustedOrigin, setAdminCookie } from "./auth.js";
import { deleteImage, uploadImage } from "./cloudinary.js";

const app = express();
const api = Router();
const allowedOrigins = (process.env.WEB_ORIGIN || "http://localhost:5173").split(",").map((value) => value.trim());
const dummyPasswordHash = bcrypt.hashSync("house-of-daksha-login-timing-guard", 12);

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api", api);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Please wait a little and try again." },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.mimetype)) {
      return callback(new Error("Upload a JPG, PNG, WebP, or AVIF image."));
    }
    callback(null, true);
  },
});

const slugify = (value) => String(value || "")
  .trim()
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 90);

const boolValue = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1) return true;
  if (value === "false" || value === 0) return false;
  return fallback;
};

const rupeesToPaise = (value) => {
  const rupees = Number(value);
  if (!Number.isFinite(rupees) || rupees < 0 || rupees > 10_000_000) return null;
  return Math.round(rupees * 100);
};

const normalizedSizes = (value) => {
  if (Array.isArray(value)) return value.map((size) => String(size).trim()).filter(Boolean).slice(0, 30);
  if (typeof value === "string") return value.split(",").map((size) => size.trim()).filter(Boolean).slice(0, 30);
  return [];
};

api.get("/health", (_req, res) => res.json({ status: "ok" }));

api.post("/auth/login", requireTrustedOrigin, loginLimiter, async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password || password.length > 200) return res.status(400).json({ error: "Enter your email and password." });
    const { rows } = await pool.query("SELECT id, email, password_hash FROM admins WHERE email = $1", [email]);
    const admin = rows[0];
    const matches = await bcrypt.compare(password, admin?.password_hash || dummyPasswordHash);
    if (!admin || !matches) return res.status(401).json({ error: "The email or password is incorrect." });
    setAdminCookie(res, admin);
    res.json({ admin: { id: admin.id, email: admin.email } });
  } catch (error) {
    next(error);
  }
});

api.post("/auth/logout", requireTrustedOrigin, (_req, res) => {
  clearAdminCookie(res);
  res.status(204).end();
});

api.get("/auth/me", requireAdmin, (req, res) => res.json({ admin: req.admin }));

api.get("/collections", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.name, c.slug, c.description, c.image_url, c.sort_order,
             COUNT(p.id)::int AS product_count
      FROM collections c
      LEFT JOIN products p ON p.collection_id = c.id AND p.is_published = TRUE
      WHERE c.is_published = TRUE
      GROUP BY c.id
      ORDER BY c.sort_order, c.name
    `);
    res.json({ collections: rows });
  } catch (error) { next(error); }
});

api.get("/collections/:slug", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.name, c.slug, c.description, c.image_url, c.sort_order
      FROM collections c WHERE c.slug = $1 AND c.is_published = TRUE
    `, [req.params.slug]);
    const collection = rows[0];
    if (!collection) return res.status(404).json({ error: "That collection could not be found." });
    const products = await pool.query(`${PUBLIC_PRODUCT_SELECT} WHERE p.collection_id = $1 AND p.is_published = TRUE ORDER BY p.created_at DESC`, [collection.id]);
    res.json({ collection, products: products.rows });
  } catch (error) { next(error); }
});

const PUBLIC_PRODUCT_SELECT = `
  SELECT p.id, p.name, p.slug, p.description, p.price_paise / 100.0 AS price,
         p.compare_at_price_paise / 100.0 AS compare_at_price, p.sizes, p.fabric, p.care,
         p.image_url, p.collection_id, c.name AS collection_name, c.slug AS collection_slug
  FROM products p LEFT JOIN collections c ON c.id = p.collection_id
`;

api.get("/products", async (req, res, next) => {
  try {
    const params = [];
    let where = "WHERE p.is_published = TRUE";
    if (req.query.collection) {
      params.push(String(req.query.collection));
      where += ` AND c.slug = $${params.length}`;
    }
    const { rows } = await pool.query(`${PUBLIC_PRODUCT_SELECT} ${where} ORDER BY p.created_at DESC`, params);
    res.json({ products: rows });
  } catch (error) { next(error); }
});

api.get("/products/:slug", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${PUBLIC_PRODUCT_SELECT} WHERE p.slug = $1 AND p.is_published = TRUE`, [req.params.slug]);
    if (!rows[0]) return res.status(404).json({ error: "That dress could not be found." });
    res.json({ product: rows[0] });
  } catch (error) { next(error); }
});

api.use("/admin", requireAdmin);
api.use("/admin", requireTrustedOrigin);

api.get("/admin/collections", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, COUNT(p.id)::int AS product_count
      FROM collections c LEFT JOIN products p ON p.collection_id = c.id
      GROUP BY c.id ORDER BY c.sort_order, c.created_at DESC
    `);
    res.json({ collections: rows });
  } catch (error) { next(error); }
});

api.post("/admin/collections", async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    const slug = slugify(req.body?.slug || name);
    if (name.length < 2 || name.length > 120 || !slug) return res.status(400).json({ error: "Add a collection name." });
    const { rows } = await pool.query(`
      INSERT INTO collections (id, name, slug, description, image_url, image_public_id, is_published, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [randomUUID(), name, slug, String(req.body.description || "").slice(0, 4000), String(req.body.image_url || ""), String(req.body.image_public_id || ""), boolValue(req.body.is_published), Number(req.body.sort_order) || 0]);
    res.status(201).json({ collection: rows[0] });
  } catch (error) { next(error); }
});

api.patch("/admin/collections/:id", async (req, res, next) => {
  try {
    const before = await pool.query("SELECT * FROM collections WHERE id = $1", [req.params.id]);
    if (!before.rows[0]) return res.status(404).json({ error: "Collection not found." });
    const current = before.rows[0];
    const name = String(req.body?.name ?? current.name).trim();
    const slug = slugify(req.body?.slug ?? name);
    const { rows } = await pool.query(`
      UPDATE collections SET name=$2, slug=$3, description=$4, image_url=$5, image_public_id=$6,
        is_published=$7, sort_order=$8, updated_at=NOW()
      WHERE id=$1 RETURNING *
    `, [current.id, name, slug, String(req.body?.description ?? current.description).slice(0, 4000), String(req.body?.image_url ?? current.image_url), String(req.body?.image_public_id ?? current.image_public_id), boolValue(req.body?.is_published, current.is_published), Number(req.body?.sort_order ?? current.sort_order) || 0]);
    if (current.image_public_id && current.image_public_id !== rows[0].image_public_id) deleteImage(current.image_public_id).catch(console.error);
    res.json({ collection: rows[0] });
  } catch (error) { next(error); }
});

api.delete("/admin/collections/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("DELETE FROM collections WHERE id = $1 RETURNING image_public_id", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Collection not found." });
    if (rows[0].image_public_id) deleteImage(rows[0].image_public_id).catch(console.error);
    res.status(204).end();
  } catch (error) { next(error); }
});

api.get("/admin/products", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.collection_id, p.name, p.slug, p.description,
             p.price_paise / 100.0 AS price, p.compare_at_price_paise / 100.0 AS compare_at_price,
             p.sizes, p.fabric, p.care, p.image_url, p.image_public_id,
             p.is_published, p.created_at, p.updated_at,
             c.name AS collection_name, c.slug AS collection_slug
      FROM products p LEFT JOIN collections c ON c.id=p.collection_id
      ORDER BY p.created_at DESC
    `);
    res.json({ products: rows });
  } catch (error) { next(error); }
});

api.post("/admin/products", async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    const slug = slugify(req.body?.slug || name);
    const price = rupeesToPaise(req.body?.price);
    const compareAt = req.body?.compare_at_price === "" || req.body?.compare_at_price == null ? null : rupeesToPaise(req.body.compare_at_price);
    if (name.length < 2 || name.length > 160 || !slug || price == null || (req.body?.compare_at_price && compareAt == null)) {
      return res.status(400).json({ error: "Add a product name and valid price." });
    }
    const collectionId = req.body.collection_id || null;
    if (collectionId) {
      const collection = await pool.query("SELECT id FROM collections WHERE id=$1", [collectionId]);
      if (!collection.rows[0]) return res.status(400).json({ error: "Choose a valid collection." });
    }
    const { rows } = await pool.query(`
      INSERT INTO products (id, collection_id, name, slug, description, price_paise, compare_at_price_paise, sizes, fabric, care, image_url, image_public_id, is_published)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12,$13) RETURNING *
    `, [randomUUID(), collectionId, name, slug, String(req.body.description || "").slice(0, 6000), price, compareAt, JSON.stringify(normalizedSizes(req.body.sizes)), String(req.body.fabric || "").slice(0, 160), String(req.body.care || "").slice(0, 2000), String(req.body.image_url || ""), String(req.body.image_public_id || ""), boolValue(req.body.is_published)]);
    res.status(201).json({ product: rows[0] });
  } catch (error) { next(error); }
});

api.patch("/admin/products/:id", async (req, res, next) => {
  try {
    const before = await pool.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (!before.rows[0]) return res.status(404).json({ error: "Product not found." });
    const current = before.rows[0];
    const name = String(req.body?.name ?? current.name).trim();
    const slug = slugify(req.body?.slug ?? name);
    const price = req.body?.price == null ? Number(current.price_paise) : rupeesToPaise(req.body.price);
    const compareAt = req.body?.compare_at_price === undefined
      ? current.compare_at_price_paise
      : req.body.compare_at_price === "" || req.body.compare_at_price == null ? null : rupeesToPaise(req.body.compare_at_price);
    if (!name || !slug || price == null || (req.body?.compare_at_price && compareAt == null)) return res.status(400).json({ error: "Add a product name and valid price." });
    const collectionId = req.body?.collection_id === undefined ? current.collection_id : req.body.collection_id || null;
    if (collectionId) {
      const collection = await pool.query("SELECT id FROM collections WHERE id=$1", [collectionId]);
      if (!collection.rows[0]) return res.status(400).json({ error: "Choose a valid collection." });
    }
    const { rows } = await pool.query(`
      UPDATE products SET collection_id=$2, name=$3, slug=$4, description=$5, price_paise=$6,
        compare_at_price_paise=$7, sizes=$8::jsonb, fabric=$9, care=$10, image_url=$11,
        image_public_id=$12, is_published=$13, updated_at=NOW() WHERE id=$1 RETURNING *
    `, [current.id, collectionId, name, slug, String(req.body?.description ?? current.description).slice(0, 6000), price, compareAt, JSON.stringify(normalizedSizes(req.body?.sizes ?? current.sizes)), String(req.body?.fabric ?? current.fabric).slice(0, 160), String(req.body?.care ?? current.care).slice(0, 2000), String(req.body?.image_url ?? current.image_url), String(req.body?.image_public_id ?? current.image_public_id), boolValue(req.body?.is_published, current.is_published)]);
    if (current.image_public_id && current.image_public_id !== rows[0].image_public_id) deleteImage(current.image_public_id).catch(console.error);
    res.json({ product: rows[0] });
  } catch (error) { next(error); }
});

api.delete("/admin/products/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("DELETE FROM products WHERE id=$1 RETURNING image_public_id", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Product not found." });
    if (rows[0].image_public_id) deleteImage(rows[0].image_public_id).catch(console.error);
    res.status(204).end();
  } catch (error) { next(error); }
});

api.post("/admin/uploads", (req, res, next) => {
  upload.single("image")(req, res, (error) => error ? next(error) : next());
}, async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Choose an image to upload." });
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({ error: "Cloudinary is not configured on the backend yet." });
    }
    const folder = req.body?.kind === "collection" ? "house-of-daksha/collections" : "house-of-daksha/products";
    const image = await uploadImage(req.file.buffer, folder);
    res.status(201).json({ image_url: image.secure_url, image_public_id: image.public_id, width: image.width, height: image.height });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  if (error?.code === "23505") return res.status(409).json({ error: "That name or URL is already in use. Try a different one." });
  if (error?.code === "23503") return res.status(409).json({ error: "This item is still in use and cannot be removed." });
  if (error instanceof multer.MulterError) return res.status(400).json({ error: error.code === "LIMIT_FILE_SIZE" ? "Choose an image smaller than 12 MB." : "That image could not be uploaded." });
  if (error.message?.startsWith("Upload a JPG")) return res.status(400).json({ error: error.message });
  console.error(error);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

export default app;
