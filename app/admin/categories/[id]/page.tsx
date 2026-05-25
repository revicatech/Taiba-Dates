"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { ApiError, categoriesApi } from "@/lib/api";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [nameEN, setNameEN] = useState("");
  const [nameAR, setNameAR] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    categoriesApi
      .get(id)
      .then((c) => {
        setNameEN(c.nameEN);
        setNameAR(c.nameAR);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "فشل التحميل"))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setError(null);
    try {
      await categoriesApi.update(id, { nameEN, nameAR });
      router.push("/admin/categories");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "فشل الحفظ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Edit Category — تعديل</span>
          <h1 className="admin-page-title">تعديل الفئة</h1>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">جاري التحميل…</div>
      ) : (
        <form className="admin-form" onSubmit={onSubmit}>
          {error && <div className="admin-alert admin-alert-error">{error}</div>}
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
              {submitting ? "..." : "حفظ"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => router.push("/admin/categories")}
            >
              إلغاء
            </button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
