"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ProductSize, SubCategory } from "@/data/products";

const FEATURE_ICONS: Record<string, string> = {
  "100% Natural": "🌴", "طبيعي 100%": "🌴",
  "Premium Packaging": "📦", "تغليف فاخر": "📦",
  "Fast Shipping": "🚚", "شحن سريع": "🚚",
  "High Quality": "⭐", "جودة عالية": "⭐",
  "Handpicked": "✋", "مختار بعناية": "✋",
  "Corporate Gifts": "🎁", "هدايا مؤسسية": "🎁",
};

const WA_NUMBER = "96176993533";
const SLIDE_INTERVAL = 3000;

type Props = {
  nameAR: string;
  nameEN: string;
  description: string;
  categoryNameAR: string;
  categoryNameEN: string;
  features: string[];
  sizes: ProductSize[];
  subCategories: SubCategory[];
};

export default function ProductDetailClient({
  nameAR, nameEN, description, categoryNameAR, categoryNameEN,
  features, sizes, subCategories,
}: Props) {
  // All sizes become slides — one slide per size, always
  const slides = sizes.map((s) => ({
    size: s,
    imageUrl: s.images[0]?.url ?? "",
    subId: s.subCategoryId || "",
  }));

  const usedSubIds = [...new Set(slides.map((sl) => sl.subId))];
  const hasSubCats = usedSubIds.some((id) => id !== "");

  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Derive active state from current slide — no separate state needed
  const currentSlide = slides[slideIdx] ?? slides[0];
  const activeSize = currentSlide?.size ?? null;
  const activeSub = currentSlide?.subId ?? "";

  const goTo = useCallback((idx: number) => setSlideIdx(idx), []);

  const goNext = useCallback(() => {
    setSlideIdx((i) => (i + 1) % Math.max(slides.length, 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setSlideIdx((i) => (i - 1 + slides.length) % Math.max(slides.length, 1));
  }, [slides.length]);

  // Auto-slide always runs (2+ slides needed)
  useEffect(() => {
    if (paused || slides.length < 2) return;
    intervalRef.current = setInterval(goNext, SLIDE_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, slides.length, goNext]);

  // Clicking a sub-category tab → jump to first slide of that group
  function pickSub(subId: string) {
    const idx = slides.findIndex((sl) => sl.subId === subId);
    if (idx >= 0) setSlideIdx(idx);
  }

  // Clicking a size chip → jump to that slide
  function pickSize(s: ProductSize) {
    const idx = slides.findIndex(
      (sl) => sl.size.label === s.label && sl.subId === (s.subCategoryId || "")
    );
    if (idx >= 0) setSlideIdx(idx);
  }

  // Touch swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  }

  function buildWA() {
    const sub = hasSubCats && activeSub
      ? subCategories.find((s) => s._id === activeSub)
      : null;
    const subLabel = sub ? ` - ${sub.nameAR}` : "";
    const sizeLabel = activeSize ? ` - ${activeSize.label}` : "";
    const msg = `مرحباً،\nأريد طلب ${nameAR}${subLabel}${sizeLabel}`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  const categoryLabel = categoryNameAR || categoryNameEN;

  // Size chips: show all sizes for the current sub-category
  const visibleSizes = hasSubCats
    ? sizes.filter((s) => (s.subCategoryId || "") === activeSub)
    : sizes;

  return (
    <div className="pdv2-grid">

      {/* ── RIGHT: Image Slider ── */}
      <div className="pdv2-img-col">
        <div
          className="pdv2-img-card"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {currentSlide?.imageUrl
            ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={slideIdx}
                src={currentSlide.imageUrl}
                alt={nameAR}
                className="pdv2-img"
              />
            )
            : <div className="pdv2-img-empty" />
          }
          {categoryLabel && <span className="pdv2-badge">{categoryLabel}</span>}
        </div>

        {/* Indicator lines — one per size/slide, always visible */}
        {slides.length > 0 && (
          <div className="pdv2-indicators">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`pdv2-indicator${i === slideIdx ? " pdv2-indicator-active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`صورة ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── LEFT: Info ── */}
      <div className="pdv2-info-col">

        <h1 className="pdv2-title">{nameAR}</h1>
        {nameEN && <p className="pdv2-title-en">{nameEN}</p>}

        {description && (
          <div className="pdv2-desc">
            <p>{description}</p>
          </div>
        )}

        {features.length > 0 && (
          <ul className="pdv2-features">
            {features.map((f, i) => (
              <li key={f} className="pdv2-feature-row">
                {i > 0 && <div className="pdv2-feature-divider" />}
                <span className="pdv2-feature-icon">{FEATURE_ICONS[f] ?? "✦"}</span>
                <span className="pdv2-feature-label">{f}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Sub-category tabs */}
        {hasSubCats && (
          <div className="pdv2-sub-section">
            <p className="pdv2-selector-label">النوع:</p>
            <div className="pdv2-chips">
              {usedSubIds.map((subId) => {
                const sub = subCategories.find((s) => s._id === subId);
                return (
                  <button
                    key={subId}
                    type="button"
                    className={`pdv2-chip${activeSub === subId ? " pdv2-chip-active" : ""}`}
                    onClick={() => pickSub(subId)}
                  >
                    {sub?.nameAR ?? "عام"}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size chips — shows sizes of the current sub-category, active = current slide */}
        {visibleSizes.length > 0 && (
          <div className="pdv2-sub-section">
            <p className="pdv2-selector-label">الحجم / الوزن:</p>
            <div className="pdv2-chips">
              {visibleSizes.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className={`pdv2-chip${activeSize?.label === s.label ? " pdv2-chip-active" : ""}`}
                  onClick={() => pickSize(s)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* WhatsApp CTA */}
        <a href={buildWA()} target="_blank" rel="noopener noreferrer" className="pdv2-wa-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          اطلب عبر واتساب
        </a>

        <p className="pdv2-trust">توصيل سريع · جودة مضمونة · تمور طازجة</p>

      </div>
    </div>
  );
}
