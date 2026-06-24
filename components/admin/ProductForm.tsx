"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, categoriesApi, productsApi, type Category, type Product, type ProductSize } from "@/lib/api";

type PendingFile = { file: File; previewUrl: string };

type SizeRow = {
  key: string;
  subCategoryId: string;
  label: string;
  keptImages: { url: string; publicId: string }[]; // already uploaded, will be sent in JSON
  newFiles: PendingFile[];                          // to be uploaded, sent as image_{si}_{fi}
};

let _key = 0;
const uid = () => String(++_key);

function rowFromSize(s: ProductSize): SizeRow {
  return {
    key: uid(),
    subCategoryId: s.subCategoryId,
    label: s.label,
    keptImages: s.images ?? [],
    newFiles: [],
  };
}

type Props = { mode: "create" | "edit"; initial?: Product };

export default function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameAR, setNameAR] = useState(initial?.nameAR ?? "");
  const [nameEN, setNameEN] = useState(initial?.nameEN ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category?._id ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [features, setFeatures] = useState<string[]>(initial?.features ?? []);
  const [featureInput, setFeatureInput] = useState("");
  const [sizes, setSizes] = useState<SizeRow[]>((initial?.sizes ?? []).map(rowFromSize));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c._id === categoryId);
  const subCats = selectedCategory?.subCategories ?? [];

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch((err) => setError(err instanceof ApiError ? err.message : "فشل تحميل الفئات"));
  }, []);

  function addSize() {
    setSizes((prev) => [...prev, { key: uid(), subCategoryId: "", label: "", keptImages: [], newFiles: [] }]);
  }

  function removeSize(key: string) {
    setSizes((prev) => prev.filter((r) => r.key !== key));
  }

  function updateSize(key: string, patch: Partial<SizeRow>) {
    setSizes((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addSizeFiles(key: string, files: FileList | null) {
    if (!files) return;
    const newFiles: PendingFile[] = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setSizes((prev) => prev.map((r) => r.key === key ? { ...r, newFiles: [...r.newFiles, ...newFiles] } : r));
  }

  function removeKeptImage(key: string, idx: number) {
    setSizes((prev) => prev.map((r) => r.key === key
      ? { ...r, keptImages: r.keptImages.filter((_, i) => i !== idx) }
      : r
    ));
  }

  function removeNewFile(key: string, idx: number) {
    setSizes((prev) => prev.map((r) => r.key === key
      ? { ...r, newFiles: r.newFiles.filter((_, i) => i !== idx) }
      : r
    ));
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

    if (!nameAR) { setError("الاسم بالعربية مطلوب"); return; }
    if (!categoryId) { setError("يرجى اختيار الفئة"); return; }
    if (sizes.length === 0) { setError("يرجى إضافة حجم واحد على الأقل مع صورته"); return; }

    for (const s of sizes) {
      if (!s.label) { setError("يرجى إدخال تسمية لكل حجم"); return; }
      const totalImages = s.keptImages.length + s.newFiles.length;
      if (totalImages === 0) { setError(`يرجى رفع صورة واحدة على الأقل للحجم: ${s.label || "#"}`); return; }
    }

    const form = new FormData();
    form.append("nameAR", nameAR);
    form.append("nameEN", nameEN);
    form.append("description", description);
    form.append("category", categoryId);
    form.append("featured", String(featured));
    form.append("features", JSON.stringify(features));

    // sizes JSON: label + subCategoryId + kept images (already uploaded)
    form.append("sizes", JSON.stringify(sizes.map((s) => ({
      subCategoryId: s.subCategoryId,
      label: s.label,
      images: s.keptImages,
    }))));

    // New files per size: image_{sizeIdx}_{fileIdx}
    sizes.forEach((s, si) => {
      s.newFiles.forEach((pf, fi) => {
        form.append(`image_${si}_${fi}`, pf.file);
      });
    });

    setSubmitting(true);
    try {
      if (mode === "create") await productsApi.create(form);
      else if (initial) await productsApi.update(initial._id, form);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "فشل الحفظ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="pf-form" onSubmit={onSubmit}>
      {error && <div className="admin-alert admin-alert-error pf-error">{error}</div>}

      <div className="pf-grid">
        {/* ─── LEFT COLUMN: Basic Info ─── */}
        <div className="pf-col">
          <div className="pf-section-title">المعلومات الأساسية</div>

          <div className="pf-field">
            <label className="pf-label">الاسم بالعربية <span className="pf-req">*</span></label>
            <input className="pf-input" value={nameAR} onChange={(e) => setNameAR(e.target.value)} required placeholder="مثال: تمر المجدول الفاخر" />
          </div>

          <div className="pf-field">
            <label className="pf-label">الاسم بالإنجليزية <span className="pf-opt">(اختياري)</span></label>
            <input className="pf-input" value={nameEN} onChange={(e) => setNameEN(e.target.value)} placeholder="e.g. Medjool Dates" dir="ltr" />
          </div>

          <div className="pf-field">
            <label className="pf-label">الفئة <span className="pf-req">*</span></label>
            <select className="pf-select" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSizes((prev) => prev.map((s) => ({ ...s, subCategoryId: "" }))); }} required>
              <option value="">-- اختر الفئة --</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.nameAR}{c.nameEN ? ` — ${c.nameEN}` : ""}</option>)}
            </select>
          </div>

          <div className="pf-field">
            <label className="pf-label">الوصف المختصر <span className="pf-opt">(اختياري)</span></label>
            <textarea className="pf-input pf-textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="جملة أو جملتان تظهران في صفحة المنتج" />
          </div>

          <div className="pf-field">
            <label className="pf-label">المميزات <span className="pf-opt">(اختياري)</span></label>
            <div className="pf-tags-list">
              {features.map((f) => (
                <span key={f} className="pf-tag">{f}<button type="button" onClick={() => removeFeature(f)}>×</button></span>
              ))}
            </div>
            <div className="pf-tag-row">
              <input className="pf-input" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                placeholder="مثال: طبيعي 100%" />
              <button type="button" className="pf-btn-secondary" onClick={addFeature}>إضافة</button>
            </div>
          </div>

          <div className="pf-field">
            <label className="pf-checkbox-label">
              <input type="checkbox" className="pf-checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              <span>عرض على الصفحة الرئيسية (مميز)</span>
            </label>
            <p className="pf-hint">يُعرض بحد أقصى 3 منتجات مميزة على الصفحة الرئيسية</p>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Sizes & Images ─── */}
        <div className="pf-col">
          <div className="pf-section-title">
            الأحجام والصور
            <span className="pf-section-sub">يمكن إضافة عدة صور لكل حجم</span>
          </div>

          {sizes.length === 0 && (
            <div className="pf-empty-sizes">اضغط «+ إضافة حجم» لبدء إضافة الأحجام والصور</div>
          )}

          <div className="pf-sizes-list">
            {sizes.map((row, i) => (
              <SizeCard
                key={row.key}
                row={row}
                index={i}
                subCats={subCats}
                onUpdate={(patch) => updateSize(row.key, patch)}
                onAddFiles={(files) => addSizeFiles(row.key, files)}
                onRemoveKept={(idx) => removeKeptImage(row.key, idx)}
                onRemoveNew={(idx) => removeNewFile(row.key, idx)}
                onRemove={() => removeSize(row.key)}
              />
            ))}
          </div>

          <button type="button" className="pf-add-size" onClick={addSize}>
            + إضافة حجم
          </button>
        </div>
      </div>

      <div className="pf-actions">
        <button type="submit" className="pf-btn-primary" disabled={submitting}>
          {submitting ? "جاري الحفظ..." : mode === "create" ? "إضافة المنتج" : "حفظ التغييرات"}
        </button>
        <button type="button" className="pf-btn-secondary" onClick={() => router.push("/admin/products")}>
          إلغاء
        </button>
      </div>
    </form>
  );
}

// ─── Size Card sub-component ───
type SizeCardProps = {
  row: SizeRow;
  index: number;
  subCats: { _id: string; nameAR: string; nameEN: string }[];
  onUpdate: (patch: Partial<SizeRow>) => void;
  onAddFiles: (files: FileList | null) => void;
  onRemoveKept: (idx: number) => void;
  onRemoveNew: (idx: number) => void;
  onRemove: () => void;
};

function SizeCard({ row, index, subCats, onUpdate, onAddFiles, onRemoveKept, onRemoveNew, onRemove }: SizeCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const totalImages = row.keptImages.length + row.newFiles.length;

  return (
    <div className="pf-size-card">
      <div className="pf-size-header">
        <span className="pf-size-num">#{index + 1}</span>
        <button type="button" className="pf-size-remove" onClick={onRemove} title="حذف هذا الحجم">×</button>
      </div>

      <div className="pf-size-body">
        {/* Fields */}
        <div className="pf-size-fields">
          {subCats.length > 0 && (
            <div className="pf-field">
              <label className="pf-label-sm">النوع الفرعي <span className="pf-opt">(اختياري)</span></label>
              <select className="pf-select pf-select-sm" value={row.subCategoryId} onChange={(e) => onUpdate({ subCategoryId: e.target.value })}>
                <option value="">-- بدون تصنيف فرعي --</option>
                {subCats.map((s) => <option key={s._id} value={s._id}>{s.nameAR}{s.nameEN ? ` — ${s.nameEN}` : ""}</option>)}
              </select>
            </div>
          )}
          <div className="pf-field">
            <label className="pf-label-sm">الحجم / الوزن <span className="pf-req">*</span></label>
            <input className="pf-input pf-input-sm" value={row.label} onChange={(e) => onUpdate({ label: e.target.value })} placeholder="مثال: 500g أو 1kg" dir="ltr" required />
          </div>
        </div>

        {/* Image grid */}
        <div className="pf-imgs-grid">
          {/* Kept images */}
          {row.keptImages.map((img, ki) => (
            <div key={img.url} className="pf-img-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" />
              <button type="button" className="pf-img-remove" onClick={() => onRemoveKept(ki)}>×</button>
            </div>
          ))}
          {/* New pending files */}
          {row.newFiles.map((pf, fi) => (
            <div key={pf.previewUrl} className="pf-img-thumb pf-img-thumb-new">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pf.previewUrl} alt="" />
              <button type="button" className="pf-img-remove" onClick={() => onRemoveNew(fi)}>×</button>
            </div>
          ))}
          {/* Add button */}
          <button
            type="button"
            className="pf-img-add"
            onClick={() => fileRef.current?.click()}
            title={`إضافة صور (${totalImages} حالياً)`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>إضافة صور</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: "none" }}
            onChange={(e) => onAddFiles(e.target.files)}
          />
        </div>
      </div>
    </div>
  );
}
