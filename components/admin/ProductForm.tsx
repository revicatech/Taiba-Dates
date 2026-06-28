"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, categoriesApi, productsApi, type Category, type Product } from "@/lib/api";

type PendingFile = { file: File; previewUrl: string };

// Quick-pick weights that are always shown; admins can toggle these or add more.
const PRESET_WEIGHTS = ["400 g", "500 g", "800 g", "1 KG"];

// Quick-pick box quantities (pieces per box) that are always shown.
const PRESET_BOXES = [10, 20];

// Suggested features always offered as quick-pick chips (stored as plain text;
// the emoji is rendered on the product page via its FEATURE_ICONS map).
const PRESET_FEATURES = [
  { label: "جودة استثنائية", icon: "✨" },
  { label: "طبيعي 100%", icon: "🌿" },
  { label: "تغليف فاخر", icon: "📦" },
];

const norm = (s: string) => s.trim().toLowerCase();

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
  const [grades, setGrades] = useState<string[]>(initial?.grades ?? []);
  const [gradeInput, setGradeInput] = useState("");
  const [weights, setWeights] = useState<string[]>(initial?.weights ?? []);
  const [weightInput, setWeightInput] = useState("");
  const [sellByPiece, setSellByPiece] = useState(initial?.sellByPiece ?? true);
  const [boxEnabled, setBoxEnabled] = useState((initial?.boxQuantities?.length ?? 0) > 0);
  const [boxQuantities, setBoxQuantities] = useState<number[]>(initial?.boxQuantities ?? []);
  const [boxInput, setBoxInput] = useState("");
  const [variantRows, setVariantRows] = useState<{ grade: string; weight: string }[]>(
    (initial?.variants ?? []).map((v) => ({ grade: v.grade ?? "", weight: v.weight ?? "" }))
  );
  const [addingVariant, setAddingVariant] = useState(false);
  const [variantGrade, setVariantGrade] = useState("");
  const [variantWeight, setVariantWeight] = useState("");
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

  // ── Grades (الأحجام / الأصناف, e.g. جامبو) — free-text chips ──
  function addGrade() {
    const v = gradeInput.trim();
    if (v && !grades.some((g) => norm(g) === norm(v))) setGrades((prev) => [...prev, v]);
    setGradeInput("");
  }
  function removeGrade(label: string) {
    setGrades((prev) => prev.filter((g) => g !== label));
  }

  // ── Weights (الأوزان, e.g. 500g) — presets + custom ──
  const hasWeight = (label: string) => weights.some((w) => norm(w) === norm(label));
  function togglePresetWeight(label: string) {
    setWeights((prev) =>
      prev.some((w) => norm(w) === norm(label))
        ? prev.filter((w) => norm(w) !== norm(label))
        : [...prev, label]
    );
  }
  function addCustomWeight() {
    const v = weightInput.trim();
    if (v && !hasWeight(v)) setWeights((prev) => [...prev, v]);
    setWeightInput("");
  }
  function removeWeight(label: string) {
    setWeights((prev) => prev.filter((w) => w !== label));
  }
  const customWeights = weights.filter((w) => !PRESET_WEIGHTS.some((p) => norm(p) === norm(w)));

  // Box is off by default (product sold by piece). Turning it off clears the quantities.
  function toggleBoxEnabled(on: boolean) {
    setBoxEnabled(on);
    if (!on) setBoxQuantities([]);
  }

  function toggleBox(qty: number) {
    setBoxQuantities((prev) =>
      prev.includes(qty) ? prev.filter((n) => n !== qty) : [...prev, qty]
    );
  }

  function addCustomBox() {
    const n = Number(boxInput.trim());
    if (Number.isFinite(n) && n > 0 && !boxQuantities.includes(n)) {
      setBoxQuantities((prev) => [...prev, n]);
    }
    setBoxInput("");
  }

  // Custom box quantities the admin added beyond the presets — removable chips.
  const customBoxes = boxQuantities.filter((n) => !PRESET_BOXES.includes(n));

  function addVariantRow() {
    const g = variantGrade.trim();
    const w = variantWeight.trim();
    if (!g && !w) return;
    if (variantRows.some((v) => v.grade === g && v.weight === w)) return;
    setVariantRows((prev) => [...prev, { grade: g, weight: w }]);
    setVariantGrade("");
    setVariantWeight("");
    setAddingVariant(false);
  }

  function removeVariantRow(idx: number) {
    setVariantRows((prev) => prev.filter((_, i) => i !== idx));
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

  function toggleFeature(label: string) {
    setFeatures((prev) =>
      prev.some((f) => norm(f) === norm(label))
        ? prev.filter((f) => norm(f) !== norm(label))
        : [...prev, label]
    );
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
    form.append("grades", JSON.stringify(grades));
    form.append("weights", JSON.stringify(weights));
    form.append("sellByPiece", String(sellByPiece));
    form.append("boxQuantities", JSON.stringify(boxQuantities));
    form.append("variants", JSON.stringify(variantRows));

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

            {/* Always-on suggestions */}
            <div className="pf-size-presets" style={{ marginBottom: 8 }}>
              {PRESET_FEATURES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className={`pf-size-chip${features.some((f) => norm(f) === norm(s.label)) ? " pf-size-chip-on" : ""}`}
                  onClick={() => toggleFeature(s.label)}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            <div className="pf-tags-list">
              {features
                .filter((f) => !PRESET_FEATURES.some((s) => norm(s.label) === norm(f)))
                .map((f) => (
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

          {/* Grades / sizes (e.g. جامبو) */}
          <div className="pf-panel">
            <div className="pf-panel-title">
              الأحجام / الأصناف
              <span className="pf-section-sub">اختياري — مثل: جامبو</span>
            </div>

            {grades.length > 0 && (
              <div className="pf-size-customs">
                {grades.map((g) => (
                  <span key={g} className="pf-size-chip pf-size-chip-on pf-size-chip-custom">
                    {g}
                    <button type="button" onClick={() => removeGrade(g)} title="حذف">×</button>
                  </span>
                ))}
              </div>
            )}

            <div className="pf-tag-row">
              <input
                className="pf-input pf-input-sm"
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGrade(); } }}
                placeholder="مثال: جامبو"
              />
              <button type="button" className="pf-btn-secondary" onClick={addGrade}>إضافة</button>
            </div>
          </div>

          {/* Weights (e.g. 500g) */}
          <div className="pf-panel">
            <div className="pf-panel-title">
              الأوزان
              <span className="pf-section-sub">اختياري — اختر أو أضف</span>
            </div>

            {/* Preset quick-pick chips (always shown) */}
            <div className="pf-size-presets">
              {PRESET_WEIGHTS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`pf-size-chip${hasWeight(label) ? " pf-size-chip-on" : ""}`}
                  onClick={() => togglePresetWeight(label)}
                  dir="ltr"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Custom weights added by the admin */}
            {customWeights.length > 0 && (
              <div className="pf-size-customs">
                {customWeights.map((w) => (
                  <span key={w} className="pf-size-chip pf-size-chip-on pf-size-chip-custom" dir="ltr">
                    {w}
                    <button type="button" onClick={() => removeWeight(w)} title="حذف">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Add a custom weight */}
            <div className="pf-tag-row">
              <input
                className="pf-input pf-input-sm"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomWeight(); } }}
                placeholder="وزن مخصص — مثال: 2 KG"
                dir="ltr"
              />
              <button type="button" className="pf-btn-secondary" onClick={addCustomWeight}>إضافة</button>
            </div>
          </div>

          {/* Packaging / selling unit */}
          <div className="pf-panel">
            <div className="pf-panel-title">
              الوحدة / التغليف
              <span className="pf-section-sub">مفرد وجملة</span>
            </div>

            <label className="pf-checkbox-label" style={{ marginBottom: 10 }}>
              <input type="checkbox" className="pf-checkbox" checked={sellByPiece} onChange={(e) => setSellByPiece(e.target.checked)} />
              <span>يُباع بالحبة (مفرق)</span>
            </label>

            {/* Box toggle — off by default; turning it on reveals the box info below */}
            <label className="pf-checkbox-label" style={{ marginBottom: boxEnabled ? 14 : 0 }}>
              <input type="checkbox" className="pf-checkbox" checked={boxEnabled} onChange={(e) => toggleBoxEnabled(e.target.checked)} />
              <span>يُباع بالصندوق (جملة)</span>
            </label>

            {boxEnabled && (
              <>
                <label className="pf-label-sm" style={{ display: "block", marginBottom: 6 }}>
                  عدد القطع في الصندوق
                </label>

                {/* Preset box quantities */}
                <div className="pf-size-presets">
                  {PRESET_BOXES.map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      className={`pf-size-chip${boxQuantities.includes(qty) ? " pf-size-chip-on" : ""}`}
                      onClick={() => toggleBox(qty)}
                    >
                      صندوق {qty} قطعة
                    </button>
                  ))}
                </div>

                {/* Custom box quantities */}
                {customBoxes.length > 0 && (
                  <div className="pf-size-customs">
                    {customBoxes.map((qty) => (
                      <span key={qty} className="pf-size-chip pf-size-chip-on pf-size-chip-custom">
                        صندوق {qty} قطعة
                        <button type="button" onClick={() => toggleBox(qty)} title="حذف">×</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add a custom box quantity */}
                <div className="pf-tag-row">
                  <input
                    className="pf-input pf-input-sm"
                    value={boxInput}
                    onChange={(e) => setBoxInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomBox(); } }}
                    placeholder="عدد مخصص — مثال: 12"
                    type="number"
                    min={1}
                    dir="ltr"
                  />
                  <button type="button" className="pf-btn-secondary" onClick={addCustomBox}>إضافة</button>
                </div>
              </>
            )}
          </div>

          {/* Explicit variant combos (optional) */}
          <div className="pf-panel">
            <div className="pf-panel-title">
              متغيرات المنتج
              <span className="pf-section-sub">اختياري</span>
            </div>
            <p className="pf-hint">اتركه فارغاً لاستخدام كل توليفات الأصناف والأوزان تلقائياً. أضف توليفات محددة فقط إذا أردت تقييد الاختيارات المتاحة.</p>

            {variantRows.length > 0 && (
              <div className="pf-variant-list">
                {variantRows.map((v, i) => (
                  <div key={i} className="pf-variant-row">
                    <span className="pf-variant-label">{v.grade || "—"}</span>
                    <span className="pf-variant-sep">+</span>
                    <span className="pf-variant-label" dir="ltr">{v.weight || "—"}</span>
                    <button type="button" className="pf-variant-remove" onClick={() => removeVariantRow(i)} title="حذف">×</button>
                  </div>
                ))}
              </div>
            )}

            {addingVariant ? (
              <div className="pf-variant-form">
                <input
                  list="vf-grade-list"
                  className="pf-input pf-input-sm"
                  value={variantGrade}
                  onChange={(e) => setVariantGrade(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVariantRow(); } }}
                  placeholder="الصنف — مثال: جامبو"
                />
                <datalist id="vf-grade-list">
                  {grades.map((g) => <option key={g} value={g} />)}
                </datalist>
                <input
                  list="vf-weight-list"
                  className="pf-input pf-input-sm"
                  value={variantWeight}
                  onChange={(e) => setVariantWeight(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVariantRow(); } }}
                  placeholder="الوزن — مثال: 500 g"
                  dir="ltr"
                />
                <datalist id="vf-weight-list">
                  {weights.map((w) => <option key={w} value={w} />)}
                </datalist>
                <div className="pf-tag-row">
                  <button type="button" className="pf-btn-secondary" onClick={addVariantRow}>إضافة</button>
                  <button type="button" className="pf-btn-ghost" onClick={() => { setAddingVariant(false); setVariantGrade(""); setVariantWeight(""); }}>إلغاء</button>
                </div>
              </div>
            ) : (
              <button type="button" className="pf-btn-secondary" onClick={() => setAddingVariant(true)}>
                + إضافة توليفة
              </button>
            )}
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
