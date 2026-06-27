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

    // middleware.ts is the real auth gate — if this component renders, the route
    // was already authorized server-side. me() is only used to show the username.
    // A 401 here right after a successful navigation is almost always a transient
    // serverless cold-start/race, so we retry once and never hard-logout on it
    // (that was causing the "logged out when opening categories" bug in prod).
    async function load(attempt = 0) {
      try {
        const { admin } = await authApi.me();
        if (!cancelled) {
          setAdmin(admin);
          setChecking(false);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401 && attempt === 0) {
          setTimeout(() => { if (!cancelled) load(1); }, 400);
          return;
        }
        // Don't bounce to login: middleware already gated this route. Show the
        // shell so a transient hiccup doesn't appear as a logout.
        setChecking(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    router.replace("/admin/login");
  }

  if (checking) {
    return <div className="admin-loading">جاري التحقق…</div>;
  }

  // admin may be null if me() failed transiently; middleware already gated entry,
  // so render the shell anyway with a neutral fallback for the username/avatar.
  const username = admin?.username ?? "المشرف";
  const avatar = username.charAt(0).toUpperCase();

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
            <span>{username}</span>
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
