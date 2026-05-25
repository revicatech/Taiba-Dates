"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { ApiError, productsApi, type Product } from "@/lib/api";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const data = await productsApi.list({ limit: 100 });
      setProducts(data.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "فشل تحميل المنتجات");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onDelete(id: string) {
    if (!confirm("حذف هذا المنتج؟")) return;
    try {
      await productsApi.remove(id);
      await refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "فشل الحذف");
    }
  }

  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Our Collection — مجموعتنا</span>
          <h1 className="admin-page-title">المنتجات</h1>
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          + منتج جديد
        </Link>
      </div>

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
                <th>الوصف</th>
                <th>الفئة</th>
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt={p.name} className="admin-table-thumb" />
                  </td>
                  <td>
                    <div className="admin-table-name">{p.name}</div>
                  </td>
                  <td>
                    <div style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--color-text-muted, #888)" }}>
                      {p.description || "—"}
                    </div>
                  </td>
                  <td>{p.category?.nameAR ?? "—"}</td>
                  <td>
                    <div className="admin-table-actions">
                      <Link
                        href={`/admin/products/${p._id}`}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                      >
                        تعديل
                      </Link>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => onDelete(p._id)}
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
