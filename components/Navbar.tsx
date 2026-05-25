"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navLinks } from "@/data/nav";
import Logo from "@/components/Logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      <nav className={scrolled ? "scrolled" : undefined}>
        <div className="container">
          <Link href="/" className="nav-logo" aria-label="طيبه للتمور — الصفحة الرئيسية">
            <Logo size={56} priority />
          </Link>
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
          <button
            className="hamburger"
            aria-label="فتح القائمة"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`mobile-menu${open ? " open" : ""}`}
        aria-hidden={!open}
      >
        <button className="mobile-menu-close" aria-label="إغلاق القائمة" onClick={close}>
          ✕
        </button>
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} onClick={close}>
            {link.label}
          </a>
        ))}
      </div>
    </>
  );
}
