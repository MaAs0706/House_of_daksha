import "dotenv/config";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import { initializeDatabase, pool } from "../src/db.js";

const terminal = createInterface({ input, output });
try {
  const email = (process.argv[2] || await terminal.question("Admin email: ")).trim().toLowerCase();
  const password = await terminal.question("Admin password (12+ characters): ");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  if (password.length < 12 || password.length > 200) throw new Error("Password must be 12 to 200 characters.");
  await initializeDatabase();
  const hash = await bcrypt.hash(password, 12);
  await pool.query("INSERT INTO admins (id, email, password_hash) VALUES ($1,$2,$3)", [randomUUID(), email, hash]);
  console.log(`Admin account created for ${email}.`);
} finally {
  terminal.close();
  await pool.end();
}
