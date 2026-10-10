"""House of Daksha catalog and admin API, implemented with FastAPI."""

from __future__ import annotations

import os
import re
import json
import threading
import time
import unicodedata
import uuid
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from typing import Any

import bcrypt
import cloudinary
import cloudinary.uploader
import jwt
from fastapi import Body, Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from dotenv import load_dotenv
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
JWT_SECRET = os.getenv("JWT_SECRET", "")
COOKIE_NAME = "daksha_admin"
MAX_UPLOAD_BYTES = 12 * 1024 * 1024
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/avif"}
PRODUCT_CATEGORIES = {"daily-wear", "co-ord-sets", "maternity-wear"}
ALLOWED_ORIGINS = [value.strip() for value in os.getenv("WEB_ORIGIN", "http://localhost:5173").split(",") if value.strip()]

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

pool: ConnectionPool | None = None
rate_lock = threading.Lock()
login_attempts: dict[str, deque[float]] = defaultdict(deque)
dummy_password_hash = bcrypt.hashpw(b"house-of-daksha-login-timing-guard", bcrypt.gensalt(rounds=12))


SCHEMA = [
    """CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
    """CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '',
      image_public_id TEXT NOT NULL DEFAULT '', is_published BOOLEAN NOT NULL DEFAULT FALSE,
      sort_order INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
    """CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
      category TEXT NOT NULL DEFAULT 'daily-wear', name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '', price_paise BIGINT NOT NULL CHECK (price_paise >= 0),
      compare_at_price_paise BIGINT CHECK (compare_at_price_paise IS NULL OR compare_at_price_paise >= 0),
      sizes JSONB NOT NULL DEFAULT '[]'::jsonb, fabric TEXT NOT NULL DEFAULT '', care TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '', image_public_id TEXT NOT NULL DEFAULT '',
      is_published BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())""",
    "CREATE INDEX IF NOT EXISTS products_collection_id_idx ON products(collection_id)",
    "CREATE INDEX IF NOT EXISTS products_published_idx ON products(is_published)",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'daily-wear'",
]


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global pool
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is required")
    if len(JWT_SECRET) < 32:
        raise RuntimeError("JWT_SECRET must be at least 32 characters long")
    pool = ConnectionPool(
        conninfo=DATABASE_URL,
        min_size=1,
        max_size=int(os.getenv("DATABASE_POOL_SIZE", "5")),
        kwargs={"row_factory": dict_row, "sslmode": "require" if os.getenv("DATABASE_SSL") == "true" else "prefer"},
        open=False,
    )
    pool.open()
    with pool.connection() as connection:
        for statement in SCHEMA:
            connection.execute(statement)
    yield
    pool.close()


app = FastAPI(title="House of Daksha API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(Exception)
async def handle_unexpected_error(_request: Request, error: Exception):
    if getattr(error, "sqlstate", None) == "23505":
        return JSONResponse(status_code=409, content={"error": "That name or URL is already in use. Try a different one."})
    if getattr(error, "sqlstate", None) == "23503":
        return JSONResponse(status_code=409, content={"error": "This item is still in use and cannot be removed."})
    print(f"API error: {error}")
    return JSONResponse(status_code=500, content={"error": "Something went wrong. Please try again."})


def db_pool() -> ConnectionPool:
    if pool is None:
        raise HTTPException(503, "Database is not ready.")
    return pool


def query(sql: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    with db_pool().connection() as connection:
        return connection.execute(sql, params).fetchall()


def slugify(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode().lower().strip()
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", text))[:90].strip("-")


def bool_value(value: Any, fallback: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    if value in ("true", 1):
        return True
    if value in ("false", 0):
        return False
    return fallback


def rupees_to_paise(value: Any) -> int | None:
    try:
        amount = float(value)
        if amount < 0 or amount > 10_000_000:
            return None
        return round(amount * 100)
    except (TypeError, ValueError):
        return None


def normalized_sizes(value: Any) -> list[str]:
    if isinstance(value, str):
        value = value.split(",")
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()][:30]


def trusted_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    if origin and origin not in ALLOWED_ORIGINS:
        raise HTTPException(403, "This origin is not allowed.")


def cookie_settings() -> dict[str, Any]:
    production = os.getenv("NODE_ENV", "development") == "production"
    return {
        "key": COOKIE_NAME,
        "httponly": True,
        "secure": production,
        "samesite": os.getenv("COOKIE_SAME_SITE", "none" if production else "lax"),
        "path": "/api",
        "max_age": 8 * 60 * 60,
    }


def current_admin(request: Request) -> dict[str, str]:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(401, "Sign in to continue.")
    try:
        claims = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], issuer="house-of-daksha-api", audience="house-of-daksha-admin")
        admins = query("SELECT id, email FROM admins WHERE id = %s", (claims.get("sub"),))
        if not admins:
            raise HTTPException(401, "Admin account is no longer available.")
        return admins[0]
    except HTTPException:
        raise
    except jwt.PyJWTError:
        raise HTTPException(401, "Your session has expired. Please sign in again.")


def require_admin(request: Request) -> dict[str, str]:
    admin = current_admin(request)
    trusted_origin(request)
    return admin


def too_many_logins(ip: str) -> bool:
    now = time.monotonic()
    with rate_lock:
        attempts = login_attempts[ip]
        while attempts and attempts[0] <= now - 900:
            attempts.popleft()
        if len(attempts) >= 8:
            return True
        attempts.append(now)
        return False


def product_select(where: str) -> str:
    return f"""SELECT p.id, p.category, p.name, p.slug, p.description,
      p.price_paise / 100.0 AS price, p.compare_at_price_paise / 100.0 AS compare_at_price,
      p.sizes, p.fabric, p.care, p.image_url, p.collection_id,
      c.name AS collection_name, c.slug AS collection_slug
      FROM products p LEFT JOIN collections c ON c.id=p.collection_id {where}"""


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/login")
def login(request: Request, body: dict[str, Any] = Body(...)):
    trusted_origin(request)
    email = str(body.get("email") or "").strip().lower()
    password = str(body.get("password") or "")
    if not email or not password or len(password) > 200:
        raise HTTPException(400, "Enter your email and password.")
    if too_many_logins(request.client.host if request.client else "unknown"):
        raise HTTPException(429, "Too many sign-in attempts. Please wait a little and try again.")
    admins = query("SELECT id, email, password_hash FROM admins WHERE email = %s", (email,))
    admin = admins[0] if admins else None
    try:
        valid = len(password.encode()) <= 72 and bcrypt.checkpw(
            password.encode(), admin["password_hash"].encode() if admin else dummy_password_hash
        )
    except (ValueError, TypeError):
        valid = False
    if not admin or not valid:
        raise HTTPException(401, "The email or password is incorrect.")
    token = jwt.encode(
        {"sub": admin["id"], "email": admin["email"], "role": "admin", "iss": "house-of-daksha-api", "aud": "house-of-daksha-admin", "iat": int(time.time()), "exp": int(time.time()) + 8 * 60 * 60},
        JWT_SECRET,
        algorithm="HS256",
    )
    response = JSONResponse({"admin": {"id": admin["id"], "email": admin["email"]}})
    response.set_cookie(value=token, **cookie_settings())
    return response


@app.post("/api/auth/logout", status_code=204)
def logout(request: Request):
    trusted_origin(request)
    response = Response(status_code=204)
    response.delete_cookie(**{k: v for k, v in cookie_settings().items() if k != "max_age"})
    return response


@app.get("/api/auth/me")
def me(admin: dict = Depends(current_admin)):
    return {"admin": admin}


@app.get("/api/collections")
def get_collections():
    rows = query("""SELECT c.id, c.name, c.slug, c.description, c.image_url, c.sort_order,
      COUNT(p.id)::int AS product_count FROM collections c
      LEFT JOIN products p ON p.collection_id=c.id AND p.is_published=TRUE
      WHERE c.is_published=TRUE GROUP BY c.id ORDER BY c.sort_order,c.name""")
    return {"collections": rows}


@app.get("/api/collections/{slug}")
def get_collection(slug: str):
    rows = query("SELECT id,name,slug,description,image_url,sort_order FROM collections WHERE slug=%s AND is_published=TRUE", (slug,))
    if not rows:
        raise HTTPException(404, "That collection could not be found.")
    collection = rows[0]
    products = query(product_select("WHERE p.collection_id=%s AND p.is_published=TRUE ORDER BY p.created_at DESC"), (collection["id"],))
    return {"collection": collection, "products": products}


@app.get("/api/products")
def get_products(collection: str | None = None, category: str | None = None, on_sale: str | None = None):
    clauses = ["p.is_published=TRUE"]
    params: list[Any] = []
    if collection:
        clauses.append("c.slug=%s")
        params.append(collection)
    if category:
        if category not in PRODUCT_CATEGORIES:
            raise HTTPException(400, "Choose a valid shop category.")
        clauses.append("p.category=%s")
        params.append(category)
    if on_sale == "true":
        clauses.append("p.compare_at_price_paise > p.price_paise")
    return {"products": query(product_select("WHERE " + " AND ".join(clauses) + " ORDER BY p.created_at DESC"), tuple(params))}


@app.get("/api/products/{slug}")
def get_product(slug: str):
    products = query(product_select("WHERE p.slug=%s AND p.is_published=TRUE"), (slug,))
    if not products:
        raise HTTPException(404, "That dress could not be found.")
    return {"product": products[0]}


@app.get("/api/admin/collections")
def admin_collections(_admin: dict = Depends(require_admin)):
    return {"collections": query("""SELECT c.*,COUNT(p.id)::int AS product_count FROM collections c
      LEFT JOIN products p ON p.collection_id=c.id GROUP BY c.id ORDER BY c.sort_order,c.created_at DESC""")}


@app.post("/api/admin/collections", status_code=201)
def create_collection(body: dict[str, Any] = Body(...), _admin: dict = Depends(require_admin)):
    name = str(body.get("name") or "").strip()
    slug = slugify(body.get("slug") or name)
    if len(name) < 2 or len(name) > 120 or not slug:
        raise HTTPException(400, "Add a collection name.")
    rows = query("""INSERT INTO collections(id,name,slug,description,image_url,image_public_id,is_published,sort_order)
      VALUES(%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *""", (str(uuid.uuid4()), name, slug, str(body.get("description") or "")[:4000], str(body.get("image_url") or ""), str(body.get("image_public_id") or ""), bool_value(body.get("is_published")), int(body.get("sort_order") or 0)))
    return {"collection": rows[0]}


@app.patch("/api/admin/collections/{item_id}")
def update_collection(item_id: str, body: dict[str, Any] = Body(...), _admin: dict = Depends(require_admin)):
    before = query("SELECT * FROM collections WHERE id=%s", (item_id,))
    if not before:
        raise HTTPException(404, "Collection not found.")
    current = before[0]
    rows = query("""UPDATE collections SET name=%s,slug=%s,description=%s,image_url=%s,image_public_id=%s,
      is_published=%s,sort_order=%s,updated_at=NOW() WHERE id=%s RETURNING *""",
      (str(body.get("name", current["name"])).strip(), slugify(body.get("slug", body.get("name", current["name"]))), str(body.get("description", current["description"]))[:4000], str(body.get("image_url", current["image_url"])), str(body.get("image_public_id", current["image_public_id"])), bool_value(body.get("is_published"), current["is_published"]), int(body.get("sort_order", current["sort_order"]) or 0), item_id))
    if current["image_public_id"] and current["image_public_id"] != rows[0]["image_public_id"]:
        cloudinary.uploader.destroy(current["image_public_id"], resource_type="image", invalidate=True)
    return {"collection": rows[0]}


@app.delete("/api/admin/collections/{item_id}", status_code=204)
def delete_collection(item_id: str, _admin: dict = Depends(require_admin)):
    rows = query("DELETE FROM collections WHERE id=%s RETURNING image_public_id", (item_id,))
    if not rows:
        raise HTTPException(404, "Collection not found.")
    if rows[0]["image_public_id"]:
        cloudinary.uploader.destroy(rows[0]["image_public_id"], resource_type="image", invalidate=True)
    return Response(status_code=204)


@app.get("/api/admin/products")
def admin_products(_admin: dict = Depends(require_admin)):
    products = query("""SELECT p.id,p.collection_id,p.category,p.name,p.slug,p.description,
      p.price_paise/100.0 AS price,p.compare_at_price_paise/100.0 AS compare_at_price,p.sizes,p.fabric,p.care,
      p.image_url,p.image_public_id,p.is_published,p.created_at,p.updated_at,c.name AS collection_name,c.slug AS collection_slug
      FROM products p LEFT JOIN collections c ON c.id=p.collection_id ORDER BY p.created_at DESC""")
    return {"products": products}


def validate_product(body: dict[str, Any], current: dict[str, Any] | None = None) -> tuple[Any, ...]:
    current = current or {}
    name = str(body.get("name", current.get("name", ""))).strip()
    slug = slugify(body.get("slug", name))
    price_value = body.get("price")
    if price_value is None and current.get("price_paise") is not None:
        price_value = current["price_paise"] / 100
    price = rupees_to_paise(price_value)
    if "compare_at_price" in body:
        compare_value = body["compare_at_price"]
        compare = None if compare_value in (None, "") else rupees_to_paise(compare_value)
    else:
        compare_value = current.get("compare_at_price_paise")
        compare = None if compare_value is None else rupees_to_paise(compare_value / 100)
    category = str(body.get("category", current.get("category", "daily-wear")))
    if len(name) < 2 or len(name) > 160 or not slug or price is None or (compare_value not in (None, "") and compare is None):
        raise HTTPException(400, "Add a product name and valid price.")
    if category not in PRODUCT_CATEGORIES:
        raise HTTPException(400, "Choose a valid shop category.")
    if compare is not None and compare <= price:
        raise HTTPException(400, "Original price must be higher than sale price.")
    collection_id = body.get("collection_id", current.get("collection_id")) or None
    if collection_id and not query("SELECT id FROM collections WHERE id=%s", (collection_id,)):
        raise HTTPException(400, "Choose a valid collection.")
    return (collection_id, category, name, slug, str(body.get("description", current.get("description", "")))[:6000], price, compare,
            normalized_sizes(body.get("sizes", current.get("sizes", []))), str(body.get("fabric", current.get("fabric", "")))[:160],
            str(body.get("care", current.get("care", "")))[:2000], str(body.get("image_url", current.get("image_url", ""))),
            str(body.get("image_public_id", current.get("image_public_id", ""))), bool_value(body.get("is_published"), current.get("is_published", False)))


@app.post("/api/admin/products", status_code=201)
def create_product(body: dict[str, Any] = Body(...), _admin: dict = Depends(require_admin)):
    values = validate_product(body)
    rows = query("""INSERT INTO products(id,collection_id,category,name,slug,description,price_paise,compare_at_price_paise,
      sizes,fabric,care,image_url,image_public_id,is_published) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *""",
      (str(uuid.uuid4()), *values[:7], json.dumps(values[7]), *values[8:]))
    return {"product": rows[0]}


@app.patch("/api/admin/products/{item_id}")
def update_product(item_id: str, body: dict[str, Any] = Body(...), _admin: dict = Depends(require_admin)):
    before = query("SELECT * FROM products WHERE id=%s", (item_id,))
    if not before:
        raise HTTPException(404, "Product not found.")
    current = before[0]
    values = validate_product(body, current)
    rows = query("""UPDATE products SET collection_id=%s,category=%s,name=%s,slug=%s,description=%s,price_paise=%s,
      compare_at_price_paise=%s,sizes=%s::jsonb,fabric=%s,care=%s,image_url=%s,image_public_id=%s,is_published=%s,
      updated_at=NOW() WHERE id=%s RETURNING *""", (values[0], values[1], values[2], values[3], values[4], values[5], values[6], json.dumps(values[7]), *values[8:], item_id))
    if current["image_public_id"] and current["image_public_id"] != rows[0]["image_public_id"]:
        cloudinary.uploader.destroy(current["image_public_id"], resource_type="image", invalidate=True)
    return {"product": rows[0]}


@app.delete("/api/admin/products/{item_id}", status_code=204)
def delete_product(item_id: str, _admin: dict = Depends(require_admin)):
    rows = query("DELETE FROM products WHERE id=%s RETURNING image_public_id", (item_id,))
    if not rows:
        raise HTTPException(404, "Product not found.")
    if rows[0]["image_public_id"]:
        cloudinary.uploader.destroy(rows[0]["image_public_id"], resource_type="image", invalidate=True)
    return Response(status_code=204)


@app.post("/api/admin/uploads", status_code=201)
async def upload_image(request: Request, image: UploadFile = File(...), kind: str = Form("product"), _admin: dict = Depends(require_admin)):
    if image.content_type not in ALLOWED_MIME:
        raise HTTPException(400, "Upload a JPG, PNG, WebP, or AVIF image.")
    contents = await image.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(400, "Choose an image smaller than 12 MB.")
    if not all(os.getenv(key) for key in ("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET")):
        raise HTTPException(503, "Cloudinary is not configured on the backend yet.")
    folder = "house-of-daksha/collections" if kind == "collection" else "house-of-daksha/products"
    result = cloudinary.uploader.upload(contents, folder=folder, resource_type="image", allowed_formats=["jpg", "jpeg", "png", "webp", "avif"], transformation=[{"width": 1800, "height": 2200, "crop": "limit", "quality": "auto", "fetch_format": "auto"}])
    return {"image_url": result["secure_url"], "image_public_id": result["public_id"], "width": result.get("width"), "height": result.get("height")}
