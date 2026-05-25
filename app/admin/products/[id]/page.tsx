"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { ApiError, productsApi, type Product } from "@/lib/api";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    productsApi
      .get(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof ApiError ? err.message : "فشل التحميل"));
  }, [id]);

  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Edit Product — تعديل</span>
          <h1 className="admin-page-title">تعديل المنتج</h1>
        </div>
      </div>
      {error ? (
        <div className="admin-alert admin-alert-error">{error}</div>
      ) : !product ? (
        <div className="admin-loading">جاري التحميل…</div>
      ) : (
        <ProductForm mode="edit" initial={product} />
      )}
    </AdminShell>
  );
}
