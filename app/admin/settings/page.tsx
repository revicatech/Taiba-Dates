"use client";

import { FormEvent, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

export default function SettingsPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (next !== confirm) {
      setError("كلمة السر الجديدة وتأكيدها غير متطابقتين");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "حدث خطأ");
      } else {
        setSuccess(true);
        setCurrent("");
        setNext("");
        setConfirm("");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <div className="admin-page-header">
        <h1 className="admin-page-title">الإعدادات</h1>
      </div>

      <div className="admin-settings-card">
        <h2 className="admin-settings-card-title">تغيير كلمة السر</h2>

        {success && (
          <div className="admin-alert admin-alert-success">
            تم تغيير كلمة السر بنجاح ✓
          </div>
        )}
        {error && (
          <div className="admin-alert admin-alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-settings-form">
          <div className="admin-settings-field">
            <label className="admin-settings-label">كلمة السر الحالية</label>
            <div className="admin-settings-input-wrap">
              <input
                type={showCurrent ? "text" : "password"}
                className="admin-input"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="admin-settings-eye"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? "إخفاء" : "إظهار"}
              >
                {showCurrent ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="admin-settings-field">
            <label className="admin-settings-label">كلمة السر الجديدة</label>
            <div className="admin-settings-input-wrap">
              <input
                type={showNext ? "text" : "password"}
                className="admin-input"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="8 أحرف على الأقل"
              />
              <button
                type="button"
                className="admin-settings-eye"
                onClick={() => setShowNext((v) => !v)}
                aria-label={showNext ? "إخفاء" : "إظهار"}
              >
                {showNext ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="admin-settings-field">
            <label className="admin-settings-label">تأكيد كلمة السر الجديدة</label>
            <div className="admin-settings-input-wrap">
              <input
                type={showConfirm ? "text" : "password"}
                className="admin-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="admin-settings-eye"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "إخفاء" : "إظهار"}
              >
                {showConfirm ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading}
          >
            {loading ? "جاري الحفظ..." : "حفظ كلمة السر"}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
