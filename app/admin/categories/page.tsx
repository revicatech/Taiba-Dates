"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { ApiError, categoriesApi, type Category } from "@/lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [nameEN, setNameEN] = useState("");
  const [nameAR, setNameAR] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function refresh() {
    try {
      setCategories(await categoriesApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "فشل تحميل الفئات");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await categoriesApi.create({ nameEN, nameAR });
      setNameEN("");
      setNameAR("");
      await refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "فشل الإنشاء");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("حذف هذه الفئة؟")) return;
    try {
      await categoriesApi.remove(id);
      await refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "فشل الحذف");
    }
  }

  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Categories — الفئات</span>
          <h1 className="admin-page-title">إدارة الفئات</h1>
        </div>
      </div>

      <form className="admin-form" onSubmit={onCreate}>
        {formError && <div className="admin-alert admin-alert-error">{formError}</div>}
        <div className="admin-form-row">
          <label htmlFor="nameAR">الاسم بالعربية</label>
          <input
            id="nameAR"
            className="admin-input"
            value={nameAR}
            onChange={(e) => setNameAR(e.target.value)}
            required
          />
        </div>
        <div className="admin-form-row">
          <label htmlFor="nameEN">English name</label>
          <input
            id="nameEN"
            className="admin-input"
            value={nameEN}
            onChange={(e) => setNameEN(e.target.value)}
            required
            dir="ltr"
          />
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
            {submitting ? "..." : "إضافة فئة"}
          </button>
        </div>
      </form>

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
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>{c.nameAR}</td>
                  <td dir="ltr" style={{ textAlign: "left" }}>{c.nameEN}</td>
                  <td>
                    <div className="admin-table-actions">
                      <Link href={`/admin/categories/${c._id}`} className="admin-btn admin-btn-secondary admin-btn-sm">
                        تعديل
                      </Link>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => onDelete(c._id)}
                      >
                        حذف
                      </button>
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
