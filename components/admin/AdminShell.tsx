"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, authApi, type Admin } from "@/lib/api";
import Logo from "@/components/Logo";

const navItems = [
  { href: "/admin/products", label: "المنتجات", icon: "🌴" },
  { href: "/admin/categories", label: "الفئات", icon: "✨" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then(({ admin }) => {
        if (!cancelled) {
          setAdmin(admin);
          setChecking(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/admin/login");
        } else {
          setChecking(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    router.replace("/admin/login");
  }

  if (checking || !admin) {
    return <div className="admin-loading">جاري التحقق…</div>;
  }

  const avatar = admin.username.charAt(0).toUpperCase();

  return (
    <div className={`admin-shell${menuOpen ? " menu-open" : ""}`}>
      <header className="admin-topbar">
        <button
          type="button"
          className={`admin-hamburger${menuOpen ? " open" : ""}`}
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <Link href="/admin/products" className="admin-topbar-brand" aria-label="طيبه">
          <Logo size={40} />
        </Link>
        <span className="admin-topbar-spacer" />
      </header>
      <button
        type="button"
        className="admin-backdrop"
        aria-hidden={!menuOpen}
        tabIndex={-1}
        onClick={() => setMenuOpen(false)}
      />
      <aside className="admin-sidebar">
        <Link href="/admin/products" className="admin-sidebar-brand" aria-label="طيبه — لوحة التحكم">
          <Logo size={72} priority />
        </Link>
        <span className="admin-sidebar-brand-en">Admin Panel</span>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link${active ? " active" : ""}`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">{avatar}</div>
            <span>{admin.username}</span>
          </div>
          <button className="admin-logout" onClick={handleLogout}>
            تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
