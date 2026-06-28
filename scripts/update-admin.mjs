// Run with: node scripts/update-admin.mjs
// Edit the values below before running

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";

// Load .env.local
try {
  const env = readFileSync(".env.local", "utf8");
  dotenv.populate(process.env, Object.fromEntries(
    env.split("\n").filter(l => l.includes("=")).map(l => {
      const [k, ...v] = l.split("=");
      return [k.trim(), v.join("=").trim()];
    })
  ));
} catch { /* .env.local not found, rely on existing env */ }

// ── CHANGE THESE ──────────────────────────────────────────────
const NEW_USERNAME = "racine zeinab";        // ← new username
const NEW_PASSWORD = "Rawan123456789"; // ← new password
// ─────────────────────────────────────────────────────────────

const uri = process.env.MONGO_URI;
if (!uri) { console.error("MONGO_URI not set"); process.exit(1); }

const AdminSchema = new mongoose.Schema({
  username: String,
  passwordHash: String,
});

const Admin = mongoose.models.Admin ?? mongoose.model("Admin", AdminSchema);

await mongoose.connect(uri);

const hash = await bcrypt.hash(NEW_PASSWORD, 10);

const existing = await Admin.findOne();
if (!existing) {
  await Admin.create({ username: NEW_USERNAME, passwordHash: hash });
  console.log("✓ Admin created:", NEW_USERNAME);
} else {
  existing.username = NEW_USERNAME;
  existing.passwordHash = hash;
  await existing.save();
  console.log("✓ Admin updated:", NEW_USERNAME);
}

await mongoose.disconnect();
