import jwt from "jsonwebtoken";
import { pool } from "./db.js";

const COOKIE_NAME = "daksha_admin";

export function cookieOptions() {
  const production = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? (process.env.COOKIE_SAME_SITE || "none") : "lax",
    path: "/api",
    maxAge: 8 * 60 * 60 * 1000,
  };
}

export function setAdminCookie(res, admin) {
  const token = jwt.sign(
    { sub: admin.id, email: admin.email, role: "admin" },
    process.env.JWT_SECRET,
    { algorithm: "HS256", expiresIn: "8h", issuer: "house-of-daksha-api", audience: "house-of-daksha-admin" },
  );
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

export function clearAdminCookie(res) {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(COOKIE_NAME, options);
}

export async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Sign in to continue." });
    const claims = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "house-of-daksha-api",
      audience: "house-of-daksha-admin",
    });
    const { rows } = await pool.query("SELECT id, email FROM admins WHERE id = $1", [claims.sub]);
    if (!rows[0]) return res.status(401).json({ error: "Admin account is no longer available." });
    req.admin = rows[0];
    next();
  } catch {
    res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
}

export function requireTrustedOrigin(req, res, next) {
  const origin = req.get("origin");
  if (!origin) return next();
  const allowed = (process.env.WEB_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((value) => value.trim());
  if (!allowed.includes(origin)) return res.status(403).json({ error: "This origin is not allowed." });
  next();
}
