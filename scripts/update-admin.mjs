// Run with: node scripts/update-admin.mjs
// Edit the values below before running

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");

// Load environment from the project root rather than the current working directory
dotenv.config({ path: path.join(projectRoot, ".env.local") });
dotenv.config({ path: path.join(projectRoot, ".env") });

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
