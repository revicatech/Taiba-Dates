// One-time category seed for طيبة للتمور.
// Run with: node scripts/seed-categories.mjs
//
// Creates the 4 main categories (and the Saudi varieties). Existing categories
// (matched by Arabic name) are left untouched so it won't clobber admin edits.

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";

// Load .env.local (same approach as scripts/update-admin.mjs)
try {
  const env = readFileSync(".env.local", "utf8");
  dotenv.populate(process.env, Object.fromEntries(
    env.split("\n").filter(l => l.includes("=")).map(l => {
      const [k, ...v] = l.split("=");
      return [k.trim(), v.join("=").trim()];
    })
  ));
} catch { /* .env.local not found, rely on existing env */ }

const uri = process.env.MONGO_URI;
if (!uri) { console.error("MONGO_URI not set"); process.exit(1); }

// ── The categories to seed ────────────────────────────────────
const CATEGORIES = [
  {
    nameAR: "تمر سعودي",
    nameEN: "Saudi Dates",
    isDates: true,
    subCategories: [
      { nameAR: "خويلدي فاخر", nameEN: "" },
      { nameAR: "عنبري أسود", nameEN: "" },
      { nameAR: "سلطاني ملكي", nameEN: "" },
      { nameAR: "خضري إكسترا", nameEN: "" },
      { nameAR: "سلطاني فاخر", nameEN: "" },
    ],
  },
  { nameAR: "مدجول", nameEN: "Medjool", isDates: true, subCategories: [] },
  { nameAR: "تمر محشي", nameEN: "Stuffed Dates", isDates: true, subCategories: [] },
  { nameAR: "فواكه مجففة", nameEN: "Dried Fruits", isDates: false, subCategories: [] },
];
// ──────────────────────────────────────────────────────────────

const subCategorySchema = new mongoose.Schema({
  nameAR: { type: String, required: true, trim: true },
  nameEN: { type: String, trim: true, default: "" },
});

const categorySchema = new mongoose.Schema(
  {
    nameAR: { type: String, required: true, unique: true, trim: true },
    nameEN: { type: String, trim: true },
    isDates: { type: Boolean, default: true },
    subCategories: { type: [subCategorySchema], default: [] },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category ?? mongoose.model("Category", categorySchema);

await mongoose.connect(uri);

for (const cat of CATEGORIES) {
  const existing = await Category.findOne({ nameAR: cat.nameAR });
  if (existing) {
    console.log("• skip (exists):", cat.nameAR);
    continue;
  }
  await Category.create(cat);
  console.log("✓ created:", cat.nameAR, cat.subCategories.length ? `(+${cat.subCategories.length} أصناف)` : "");
}

await mongoose.disconnect();
console.log("done.");
