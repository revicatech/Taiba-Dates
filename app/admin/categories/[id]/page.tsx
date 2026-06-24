"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { ApiError, categoriesApi, type SubCategory } from "@/lib/api";

type SubInput = { key: string; _id?: string; nameAR: string; nameEN: string };
let _k = 0;
const uid = () => String(++_k);

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [nameAR, setNameAR] = useState("");
  const [nameEN, setNameEN] = useState("");
  const [subs, setSubs] = useState<SubInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    categoriesApi.get(id)
      .then((c) => {
        setNameAR(c.nameAR);
        setNameEN(c.nameEN ?? "");
        setSubs((c.subCategories ?? []).map((s: SubCategory) => ({ key: uid(), _id: s._id, nameAR: s.nameAR, nameEN: s.nameEN ?? "" })));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "فشل التحميل"))
      .finally(() => setLoading(false));
  }, [id]);

  function addSub() { setSubs((p) => [...p, { key: uid(), nameAR: "", nameEN: "" }]); }
  function removeSub(key: string) { setSubs((p) => p.filter((s) => s.key !== key)); }
  function updateSub(key: string, field: "nameAR" | "nameEN", val: string) {
    setSubs((p) => p.map((s) => s.key === key ? { ...s, [field]: val } : s));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    const invalidSub = subs.find((s) => !s.nameAR);
    if (invalidSub) { setError("يرجى إدخال اسم عربي لكل تصنيف فرعي"); return; }
    setSubmitting(true);
    setError(null);
    try {
      await categoriesApi.update(id, {
        nameAR,
        nameEN,
        subCategories: subs.map((s) => ({ nameAR: s.nameAR, nameEN: s.nameEN })),
      });
      router.push("/admin/categories");
    } catch (err) { setError(err instanceof ApiError ? err.message : "فشل الحفظ"); }
    finally { setSubmitting(false); }
  }

  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Edit Category — تعديل</span>
          <h1 className="admin-page-title">تعديل الفئة</h1>
        </div>
      </div>

      {loading ? <div className="admin-loading">جاري التحميل…</div> : (
        <form className="admin-form" onSubmit={onSubmit}>
          {error && <div className="admin-alert admin-alert-error">{error}</div>}

          <div className="admin-form-two-col">
            <div className="admin-form-row">
              <label htmlFor="nameAR">الاسم بالعربية *</label>
              <input id="nameAR" className="admin-input" value={nameAR} onChange={(e) => setNameAR(e.target.value)} required />
            </div>
            <div className="admin-form-row">
              <label htmlFor="nameEN">English name <span style={{ fontWeight: 400, fontSize: 12 }}>(optional)</span></label>
              <input id="nameEN" className="admin-input" value={nameEN} onChange={(e) => setNameEN(e.target.value)} dir="ltr" />
            </div>
          </div>

          <div className="admin-form-row">
            <label>التصنيفات الفرعية</label>
            {subs.length > 0 && (
              <div className="cat-subs-list">
                {subs.map((s) => (
                  <div key={s.key} className="cat-sub-row">
                    <input className="admin-input" value={s.nameAR} onChange={(e) => updateSub(s.key, "nameAR", e.target.value)} placeholder="الاسم بالعربية *" />
                    <input className="admin-input" value={s.nameEN} onChange={(e) => updateSub(s.key, "nameEN", e.target.value)} placeholder="English name (optional)" dir="ltr" />
                    <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => removeSub(s.key)}>×</button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" className="admin-btn admin-btn-secondary" style={{ marginTop: 8 }} onClick={addSub}>
              + إضافة تصنيف فرعي
            </button>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>{submitting ? "..." : "حفظ"}</button>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => router.push("/admin/categories")}>إلغاء</button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
