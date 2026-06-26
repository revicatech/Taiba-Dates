"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, categoriesApi, productsApi, type Category, type Product } from "@/lib/api";

type PendingFile = { file: File; previewUrl: string };

let _key = 0;
const uid = () => String(++_key);

type SizeRow = { key: string; label: string };

type Props = { mode: "create" | "edit"; initial?: Product };

export default function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [nameAR, setNameAR] = useState(initial?.nameAR ?? "");
  const [nameEN, setNameEN] = useState(initial?.nameEN ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category?._id ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [soldOut, setSoldOut] = useState(initial?.soldOut ?? false);
  const [features, setFeatures] = useState<string[]>(initial?.features ?? []);
  const [featureInput, setFeatureInput] = useState("");
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>(initial?.subCategoryIds ?? []);
  const [sizes, setSizes] = useState<SizeRow[]>(
    (initial?.sizes ?? []).map((s) => ({ key: uid(), label: s.label }))
  );
  const [keptImages, setKeptImages] = useState<{ url: string; publicId: string }[]>(initial?.images ?? []);
  const [newFiles, setNewFiles] = useState<PendingFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c._id === categoryId);
  const subCats = selectedCategory?.subCategories ?? [];

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch((err) => setError(err instanceof ApiError ? err.message : "فشل تحميل الفئات"));
  }, []);

  // When category changes, clear subcategory selections that no longer exist
  function handleCategoryChange(id: string) {
    setCategoryId(id);
    const cat = categories.find((c) => c._id === id);
    const validIds = new Set((cat?.subCategories ?? []).map((s) => s._id));
    setSelectedSubIds((prev) => prev.filter((sid) => validIds.has(sid)));
  }

  function toggleSubCat(id: string) {
    setSelectedSubIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function addSize() {
    setSizes((prev) => [...prev, { key: uid(), label: "" }]);
  }

  function removeSize(key: string) {
    setSizes((prev) => prev.filter((r) => r.key !== key));
  }

  function updateSizeLabel(key: string, label: string) {
    setSizes((prev) => prev.map((r) => r.key === key ? { ...r, label } : r));
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const added: PendingFile[] = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewFiles((prev) => [...prev, ...added]);
  }

  function removeKept(idx: number) {
    setKeptImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeNew(idx: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
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
    const form = new FormData();
    form.append("nameAR", nameAR);
    form.append("nameEN", nameEN);
    form.append("description", description);
    form.append("category", categoryId);
    form.append("featured", String(featured));
    form.append("soldOut", String(soldOut));
    form.append("features", JSON.stringify(features));
    form.append("subCategoryIds", JSON.stringify(selectedSubIds));
    form.append("sizes", JSON.stringify(sizes.filter((s) => s.label).map((s) => ({ label: s.label }))));

    if (mode === "edit") {
      form.append("keptImages", JSON.stringify(keptImages));
    }

    newFiles.forEach((pf, i) => form.append(`image_${i}`, pf.file));

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

  const totalImages = keptImages.length + newFiles.length;

  return (
    <form className="pf-form" onSubmit={onSubmit}>
      {error && <div className="admin-alert admin-alert-error pf-error">{error}</div>}

      <div className="pf-grid">
        {/* ─── RIGHT COLUMN: Basic Info ─── */}
        <div className="pf-col">
          <div className="pf-section-title">المعلومات الأساسية</div>

          <div className="pf-field">
            <label className="pf-label">الاسم بالعربية <span className="pf-req">*</span></label>
            <input className="pf-input" value={nameAR} onChange={(e) => setNameAR(e.target.value)} required placeholder="مثال: تمر المدجول الفاخر" />
          </div>

          <div className="pf-field">
            <label className="pf-label">الاسم بالإنجليزية <span className="pf-opt">(اختياري)</span></label>
            <input className="pf-input" value={nameEN} onChange={(e) => setNameEN(e.target.value)} placeholder="e.g. Medjool Dates" dir="ltr" />
          </div>

          <div className="pf-field">
            <label className="pf-label">الفئة <span className="pf-req">*</span></label>
            <select className="pf-select" value={categoryId} onChange={(e) => handleCategoryChange(e.target.value)} required>
              <option value="">-- اختر الفئة --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.nameAR}{c.nameEN ? ` — ${c.nameEN}` : ""}</option>
              ))}
            </select>
          </div>

          <div className="pf-field">
            <label className="pf-label">الوصف المختصر <span className="pf-opt">(اختياري)</span></label>
            <textarea className="pf-input pf-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="جملة أو جملتان تظهران في صفحة المنتج" />
          </div>

          <div className="pf-field">
            <label className="pf-label">المميزات <span className="pf-opt">(اختياري)</span></label>
            <div className="pf-tags-list">
              {features.map((f) => (
                <span key={f} className="pf-tag">{f}<button type="button" onClick={() => removeFeature(f)}>×</button></span>
              ))}
            </div>
            <div className="pf-tag-row">
              <input
                className="pf-input"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                placeholder="مثال: طبيعي 100%"
              />
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

          <div className="pf-field">
            <label className="pf-checkbox-label">
              <input type="checkbox" className="pf-checkbox" checked={soldOut} onChange={(e) => setSoldOut(e.target.checked)} />
              <span>نفذت الكمية (إخفاء من الموقع)</span>
            </label>
            <p className="pf-hint">عند التفعيل، لن يظهر المنتج للزوار في الموقع</p>
          </div>
        </div>

        {/* ─── LEFT COLUMN: SubCats + Sizes + Images ─── */}
        <div className="pf-col">

          {/* Subcategories */}
          {subCats.length > 0 && (
            <div className="pf-panel">
              <div className="pf-panel-title">التصنيفات الفرعية</div>
              <div className="pf-subcats-grid">
                {subCats.map((s) => (
                  <label key={s._id} className={`pf-subcat-chip${selectedSubIds.includes(s._id) ? " pf-subcat-chip-on" : ""}`}>
                    <input
                      type="checkbox"
                      checked={selectedSubIds.includes(s._id)}
                      onChange={() => toggleSubCat(s._id)}
                      className="pf-subcat-cb"
                    />
                    <span>{s.nameAR}</span>
                    {s.nameEN && <span className="pf-subcat-en">{s.nameEN}</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          <div className="pf-panel">
            <div className="pf-panel-title">
              الأوزان / الأحجام
              <span className="pf-section-sub">اختياري</span>
            </div>

            {sizes.length === 0 && (
              <p className="pf-panel-empty">لا توجد أحجام — اضغط «+ إضافة» لإضافة خيارات وزن</p>
            )}

            <div className="pf-sizes-pills">
              {sizes.map((row) => (
                <div key={row.key} className="pf-size-pill-row">
                  <input
                    className="pf-input pf-input-sm"
                    value={row.label}
                    onChange={(e) => updateSizeLabel(row.key, e.target.value)}
                    placeholder="مثال: 500g أو 1kg"
                    dir="ltr"
                  />
                  <button type="button" className="pf-pill-remove" onClick={() => removeSize(row.key)} title="حذف">×</button>
                </div>
              ))}
            </div>

            <button type="button" className="pf-add-size" onClick={addSize}>
              + إضافة حجم
            </button>
          </div>

          {/* Images */}
          <div className="pf-panel">
            <div className="pf-panel-title">
              الصور <span className="pf-req">*</span>
              <span className="pf-section-sub">{totalImages} صورة</span>
            </div>

            <div className="pf-imgs-grid">
              {keptImages.map((img, ki) => (
                <div key={img.url} className="pf-img-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" />
                  <button type="button" className="pf-img-remove" onClick={() => removeKept(ki)}>×</button>
                </div>
              ))}
              {newFiles.map((pf, fi) => (
                <div key={pf.previewUrl} className="pf-img-thumb pf-img-thumb-new">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pf.previewUrl} alt="" />
                  <button type="button" className="pf-img-remove" onClick={() => removeNew(fi)}>×</button>
                </div>
              ))}
              <button
                type="button"
                className="pf-img-add"
                onClick={() => fileRef.current?.click()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>إضافة</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>
          </div>

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
