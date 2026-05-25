"use client";

import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <AdminShell>
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">New Product — منتج جديد</span>
          <h1 className="admin-page-title">إضافة منتج</h1>
        </div>
      </div>
      <ProductForm mode="create" />
    </AdminShell>
  );
}
