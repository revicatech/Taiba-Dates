"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, authApi } from "@/lib/api";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authApi.login(username, password);
      router.replace("/admin/products");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "حدث خطأ غير متوقع";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-shell">
      <div className="admin-login-watermark" aria-hidden>ط</div>

      <div className="admin-login-card">
        <span className="admin-login-card-corner admin-login-card-corner-tr" aria-hidden />
        <span className="admin-login-card-corner admin-login-card-corner-bl" aria-hidden />

        <div className="admin-login-card-inner">
          <div className="admin-login-logo">
            <Logo size={110} priority />
          </div>
          <span className="admin-login-eyebrow">Admin Panel — لوحة التحكم</span>
          <h1 className="admin-login-title">مرحبًا بعودتك</h1>
          <p className="admin-login-subtitle">Sign in to continue</p>

          <div className="admin-login-divider" aria-hidden>
            <span className="admin-login-divider-line" />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L12 8 M8 4 Q10 8 12 8 Q14 8 16 4" stroke="#F4AF2E" strokeWidth="1.5" strokeLinecap="round" />
              <ellipse cx="12" cy="14" rx="4" ry="6" fill="#F4AF2E" opacity="0.9" />
              <path d="M8 10 Q9 14 12 14 Q15 14 16 10" stroke="#C49A40" strokeWidth="1" fill="none" />
            </svg>
            <span className="admin-login-divider-line" />
          </div>

          <form className="admin-login-form" onSubmit={onSubmit}>
            {error && <div className="admin-alert admin-alert-error">{error}</div>}
            <div className="admin-form-row">
              <label htmlFor="username">اسم المستخدم</label>
              <input
                id="username"
                className="admin-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="admin-form-row">
              <label htmlFor="password">كلمة المرور</label>
              <input
                id="password"
                type="password"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary admin-login-submit"
              disabled={submitting}
            >
              {submitting ? "..." : "دخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
