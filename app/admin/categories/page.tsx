"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { ApiError, categoriesApi, type Category } from "@/lib/api";

type SubInput = { key: string; nameAR: string; nameEN: string };
let _k = 0;
const uid = () => String(++_k);

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [nameAR, setNameAR] = useState("");
  const [nameEN, setNameEN] = useState("");
  const [subs, setSubs] = useState<SubInput[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function refresh() {
    try { setCategories(await categoriesApi.list()); }
    catch (err) { setError(err instanceof ApiError ? err.message : "فشل تحميل الفئات"); }
  }

  useEffect(() => { refresh(); }, []);

  function addSub() { setSubs((p) => [...p, { key: uid(), nameAR: "", nameEN: "" }]); }
  function removeSub(key: string) { setSubs((p) => p.filter((s) => s.key !== key)); }
  function updateSub(key: string, field: "nameAR" | "nameEN", val: string) {
    setSubs((p) => p.map((s) => s.key === key ? { ...s, [field]: val } : s));
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!nameAR) { setFormError("الاسم بالعربية مطلوب"); return; }
    const invalidSub = subs.find((s) => !s.nameAR);
    if (invalidSub) { setFormError("يرجى إدخال اسم عربي لكل تصنيف فرعي"); return; }
    setSubmitting(true);
    try {
      await categoriesApi.create({ nameAR, nameEN, subCategories: subs.map((s) => ({ nameAR: s.nameAR, nameEN: s.nameEN })) });
      setNameAR(""); setNameEN(""); setSubs([]);
      await refresh();
    } catch (err) { setFormError(err instanceof ApiError ? err.message : "فشل الإنشاء"); }
    finally { setSubmitting(false); }
  }

  async function onDelete(id: string) {
    if (!confirm("حذف هذه الفئة؟")) return;
    try { await categoriesApi.remove(id); await refresh(); }
    catch (err) { alert(err instanceof ApiError ? err.message : "فشل الحذف"); }
  }

  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Categories — الفئات</span>
          <h1 className="admin-page-title">إدارة الفئات</h1>
        </div>
      </div>

      {/* Add Category Form */}
      <form className="admin-form" onSubmit={onCreate}>
        {formError && <div className="admin-alert admin-alert-error">{formError}</div>}

        <div className="admin-form-two-col">
          <div className="admin-form-row">
            <label htmlFor="nameAR">الاسم بالعربية *</label>
            <input id="nameAR" className="admin-input" value={nameAR} onChange={(e) => setNameAR(e.target.value)} required placeholder="مثال: تمور مجدول" />
          </div>
          <div className="admin-form-row">
            <label htmlFor="nameEN">English name <span style={{ fontWeight: 400, fontSize: 12 }}>(optional)</span></label>
            <input id="nameEN" className="admin-input" value={nameEN} onChange={(e) => setNameEN(e.target.value)} placeholder="e.g. Medjool Dates" dir="ltr" />
          </div>
        </div>

        {/* Sub-categories */}
        <div className="admin-form-row">
          <label>التصنيفات الفرعية <span style={{ fontWeight: 400, fontSize: 12 }}>(اختياري)</span></label>
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
          <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
            {submitting ? "..." : "إضافة الفئة"}
          </button>
        </div>
      </form>

      {/* Categories Table */}
      <div className="admin-table-wrap">
        {error ? (
          <div className="admin-alert admin-alert-error" style={{ margin: 16 }}>{error}</div>
        ) : categories === null ? (
          <div className="admin-loading">جاري التحميل…</div>
        ) : categories.length === 0 ? (
          <div className="admin-empty">لا توجد فئات بعد.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>العربية</th>
                <th>English</th>
                <th>التصنيفات الفرعية</th>
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.nameAR}</strong></td>
                  <td dir="ltr" style={{ textAlign: "left" }}>{c.nameEN || "—"}</td>
                  <td>
                    {c.subCategories.length > 0 ? (
                      <div className="cat-sub-chips">
                        {c.subCategories.map((s) => <span key={s._id} className="cat-sub-chip">{s.nameAR}</span>)}
                      </div>
                    ) : <span style={{ color: "var(--color-text-muted)" }}>—</span>}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link href={`/admin/categories/${c._id}`} className="admin-btn admin-btn-secondary admin-btn-sm">تعديل</Link>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => onDelete(c._id)}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
