"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, categoriesApi, productsApi, type Category, type Product } from "@/lib/api";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Props = {
  mode: "create" | "edit";
  initial?: Product;
};

export default function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameAR, setNameAR] = useState(initial?.nameAR ?? "");
  const [nameEN, setNameEN] = useState(initial?.nameEN ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [fullDescription, setFullDescription] = useState(initial?.fullDescription ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category?._id ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [weights, setWeights] = useState<string[]>(initial?.weights ?? []);
  const [weightInput, setWeightInput] = useState("");
  const [features, setFeatures] = useState<string[]>(initial?.features ?? []);
  const [featureInput, setFeatureInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoriesApi
      .list()
      .then(setCategories)
      .catch((err) => setError(err instanceof ApiError ? err.message : "فشل تحميل الفئات"));
  }, []);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Auto-generate slug from nameEN when not manually edited
  useEffect(() => {
    if (!slugTouched && nameEN) {
      setSlug(slugify(nameEN));
    }
  }, [nameEN, slugTouched]);

  function addWeight() {
    const w = weightInput.trim();
    if (w && !weights.includes(w)) setWeights((prev) => [...prev, w]);
    setWeightInput("");
  }

  function removeWeight(w: string) {
    setWeights((prev) => prev.filter((x) => x !== w));
  }

  function addFeature() {
    const f = featureInput.trim();
    if (f && !features.includes(f)) setFeatures((prev) => [...prev, f]);
    setFeatureInput("");
  }

  function removeFeature(f: string) {
    setFeatures((prev) => prev.filter((x) => x !== f));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "create" && !file) {
      setError("يرجى اختيار صورة المنتج");
      return;
    }
    if (!categoryId) {
      setError("يرجى اختيار فئة");
      return;
    }
    if (!nameAR) {
      setError("الاسم بالعربية مطلوب");
      return;
    }
    if (!slug) {
      setError("يرجى إدخال slug المنتج");
      return;
    }

    const form = new FormData();
    form.append("nameAR", nameAR);
    form.append("nameEN", nameEN);
    form.append("slug", slug);
    form.append("description", description);
    form.append("fullDescription", fullDescription);
    form.append("category", categoryId);
    form.append("featured", String(featured));
    form.append("weights", JSON.stringify(weights));
    form.append("features", JSON.stringify(features));
    if (file) form.append("image", file);

    setSubmitting(true);
    try {
      if (mode === "create") {
        await productsApi.create(form);
      } else if (initial) {
        await productsApi.update(initial._id, form);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "فشل الحفظ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="admin-form-row">
        <label htmlFor="nameAR">اسم المنتج بالعربية *</label>
        <input
          id="nameAR"
          className="admin-input"
          value={nameAR}
          onChange={(e) => setNameAR(e.target.value)}
          required
          placeholder="مثال: تمر المجدول"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="nameEN">اسم المنتج بالإنجليزية</label>
        <input
          id="nameEN"
          className="admin-input"
          value={nameEN}
          onChange={(e) => setNameEN(e.target.value)}
          placeholder="e.g. Medjool Dates"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="slug">
          Slug (رابط المنتج) *
          <small style={{ fontWeight: 400, marginRight: 8, color: "var(--admin-text-muted, #888)" }}>
            — يُستخدم في الرابط: /products/<strong>{slug || "medjool-dates"}</strong>
          </small>
        </label>
        <input
          id="slug"
          className="admin-input"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
          required
          placeholder="medjool-dates"
          dir="ltr"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="category">الفئة *</label>
        <select
          id="category"
          className="admin-select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">-- اختر فئة --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.nameAR} — {c.nameEN}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-form-row">
        <label htmlFor="description">الوصف المختصر</label>
        <textarea
          id="description"
          className="admin-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="وصف قصير يظهر على بطاقة المنتج"
          style={{ resize: "vertical" }}
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="fullDescription">الوصف التفصيلي</label>
        <textarea
          id="fullDescription"
          className="admin-input"
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          rows={5}
          placeholder="وصف مفصل يظهر في صفحة المنتج"
          style={{ resize: "vertical" }}
        />
      </div>

      {/* Weights */}
      <div className="admin-form-row">
        <label>الأوزان المتاحة</label>
        <div className="admin-tags-input">
          <div className="admin-tags-list">
            {weights.map((w) => (
              <span key={w} className="admin-tag">
                {w}
                <button type="button" onClick={() => removeWeight(w)}>×</button>
              </span>
            ))}
          </div>
          <div className="admin-tag-add">
            <input
              className="admin-input"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addWeight(); } }}
              placeholder="مثال: 500g"
              dir="ltr"
            />
            <button type="button" className="admin-btn admin-btn-secondary" onClick={addWeight}>
              إضافة
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="admin-form-row">
        <label>مميزات المنتج</label>
        <div className="admin-tags-input">
          <div className="admin-tags-list">
            {features.map((f) => (
              <span key={f} className="admin-tag">
                {f}
                <button type="button" onClick={() => removeFeature(f)}>×</button>
              </span>
            ))}
          </div>
          <div className="admin-tag-add">
            <input
              className="admin-input"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
              placeholder="مثال: 100% Natural"
            />
            <button type="button" className="admin-btn admin-btn-secondary" onClick={addFeature}>
              إضافة
            </button>
          </div>
        </div>
      </div>

      {/* Featured */}
      <div className="admin-form-row">
        <label className="admin-checkbox-label">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="admin-checkbox"
          />
          عرض على الصفحة الرئيسية (منتج مميز)
        </label>
        <small style={{ color: "var(--admin-text-muted, #888)", display: "block", marginTop: 4 }}>
          يُعرض بحد أقصى 3 منتجات مميزة على الصفحة الرئيسية.
        </small>
      </div>

      {/* Image */}
      <div className="admin-form-row">
        <label htmlFor="image">
          صورة المنتج {mode === "edit" && "(اتركها فارغة للإبقاء على الصورة الحالية)"}
        </label>
        <input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="admin-file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="معاينة" className="admin-image-preview" />
        )}
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
          {submitting ? "..." : mode === "create" ? "إضافة منتج" : "حفظ التغييرات"}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => router.push("/admin/products")}
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
