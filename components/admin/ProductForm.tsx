"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, categoriesApi, productsApi, type Category, type Product } from "@/lib/api";

type Props = {
  mode: "create" | "edit";
  initial?: Product;
};

export default function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category?._id ?? "");
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

    const form = new FormData();
    form.append("name", name);
    form.append("description", description);
    form.append("category", categoryId);
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
        <label htmlFor="name">اسم المنتج</label>
        <input
          id="name"
          className="admin-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="description">الوصف</label>
        <textarea
          id="description"
          className="admin-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="وصف اختياري للمنتج"
          style={{ resize: "vertical" }}
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="category">الفئة</label>
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
