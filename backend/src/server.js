import "dotenv/config";
import app from "./app.js";
import { initializeDatabase, pool } from "./db.js";

const required = ["DATABASE_URL", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
if (process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be at least 32 characters long.");

const port = Number(process.env.PORT || 4000);
await initializeDatabase();
const server = app.listen(port, () => console.log(`House of Daksha API listening on port ${port}`));

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
