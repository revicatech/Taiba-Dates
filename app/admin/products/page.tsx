"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { ApiError, productsApi, type Product } from "@/lib/api";

const MAX_FEATURED = 3;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function refresh() {
    try { setProducts((await productsApi.list({ limit: 100 })).items); }
    catch (err) { setError(err instanceof ApiError ? err.message : "فشل تحميل المنتجات"); }
  }

  useEffect(() => { refresh(); }, []);

  async function onDelete(id: string) {
    if (!confirm("حذف هذا المنتج؟")) return;
    try { await productsApi.remove(id); await refresh(); }
    catch (err) { alert(err instanceof ApiError ? err.message : "فشل الحذف"); }
  }

  async function onToggleFeatured(p: Product) {
    setTogglingId(p._id);
    try {
      await productsApi.toggleFeatured(p._id, !p.featured);
      await refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "فشل التحديث");
    } finally {
      setTogglingId(null);
    }
  }

  const featuredCount = products?.filter((p) => p.featured).length ?? 0;

  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Products — المنتجات</span>
          <h1 className="admin-page-title">إدارة المنتجات</h1>
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">+ منتج جديد</Link>
      </div>

      {products !== null && (
        <div className="admin-featured-counter">
          <span className={featuredCount >= MAX_FEATURED ? "admin-featured-full" : ""}>
            ⭐ مميز: {featuredCount} / {MAX_FEATURED}
          </span>
          {featuredCount >= MAX_FEATURED && (
            <span className="admin-featured-limit-note">الحد الأقصى — أزل تمييز منتج لتمييز آخر</span>
          )}
        </div>
      )}

      <div className="admin-table-wrap">
        {error ? (
          <div className="admin-alert admin-alert-error" style={{ margin: 16 }}>{error}</div>
        ) : products === null ? (
          <div className="admin-loading">جاري التحميل…</div>
        ) : products.length === 0 ? (
          <div className="admin-empty">لا توجد منتجات بعد.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>الصورة</th>
                <th>الاسم</th>
                <th>الفئة</th>
                <th>الأحجام</th>
                <th style={{ width: 80, textAlign: "center" }}>مميز</th>
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cover = p.sizes[0]?.images[0]?.url ?? "";
                const canFeature = p.featured || featuredCount < MAX_FEATURED;
                const isToggling = togglingId === p._id;
                return (
                  <tr key={p._id}>
                    <td data-label="">
                      {cover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt={p.nameAR} className="admin-table-thumb" />
                      )}
                    </td>
                    <td data-label="الاسم">
                      <div className="admin-table-name">{p.nameAR}</div>
                      {p.nameEN && <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{p.nameEN}</div>}
                    </td>
                    <td data-label="الفئة">{p.category?.nameAR ?? "—"}</td>
                    <td data-label="الأحجام">
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {p.sizes.slice(0, 4).map((s) => <span key={s.label} className="cat-sub-chip">{s.label}</span>)}
                        {p.sizes.length > 4 && <span className="cat-sub-chip">+{p.sizes.length - 4}</span>}
                      </div>
                    </td>
                    <td data-label="مميز" style={{ textAlign: "center" }}>
                      <button
                        className={`admin-star-btn${p.featured ? " admin-star-on" : ""}${!canFeature ? " admin-star-disabled" : ""}`}
                        onClick={() => onToggleFeatured(p)}
                        disabled={isToggling || !canFeature}
                        title={
                          p.featured ? "إلغاء التمييز"
                          : !canFeature ? "الحد الأقصى 3 منتجات مميزة"
                          : "تمييز على الصفحة الرئيسية"
                        }
                      >
                        {isToggling ? "…" : "⭐"}
                      </button>
                    </td>
                    <td data-label="">
                      <div className="admin-table-actions">
                        <Link href={`/admin/products/${p._id}`} className="admin-btn admin-btn-secondary admin-btn-sm">تعديل</Link>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => onDelete(p._id)}>حذف</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
