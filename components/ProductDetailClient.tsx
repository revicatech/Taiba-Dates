"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ProductSizeImage, SubCategory } from "@/data/products";
import { useCart } from "@/components/cart/CartProvider";
import { orderLine, waLink } from "@/lib/whatsapp";

const FEATURE_ICONS: Record<string, string> = {
  "100% Natural": "🌴", "طبيعي 100%": "🌴",
  "Premium Packaging": "📦", "تغليف فاخر": "📦",
  "Fast Shipping": "🚚", "شحن سريع": "🚚",
  "High Quality": "⭐", "جودة عالية": "⭐",
  "Handpicked": "✋", "مختار بعناية": "✋",
  "Corporate Gifts": "🎁", "هدايا مؤسسية": "🎁",
};

const SLIDE_INTERVAL = 3000;

type Props = {
  productId: string;
  nameAR: string;
  nameEN: string;
  description: string;
  categoryNameAR: string;
  categoryNameEN: string;
  features: string[];
  grades: string[];
  weights: string[];
  subCategoryIds: string[];
  subCategories: SubCategory[];
  images: ProductSizeImage[];
  sellByPiece: boolean;
  boxQuantities: number[];
};

// Unit (packaging) options: a single "piece" option and one per box quantity.
type UnitOption = { key: string; label: string };
function buildUnitOptions(sellByPiece: boolean, boxQuantities: number[]): UnitOption[] {
  const opts: UnitOption[] = [];
  if (sellByPiece) opts.push({ key: "piece", label: "بالحبة" });
  for (const qty of boxQuantities) opts.push({ key: `box:${qty}`, label: `صندوق ${qty} قطعة` });
  return opts;
}

export default function ProductDetailClient({
  productId, nameAR, nameEN, description, categoryNameAR, categoryNameEN,
  features, grades, weights, subCategoryIds, subCategories, images,
  sellByPiece, boxQuantities,
}: Props) {
  const unitOptions = buildUnitOptions(sellByPiece, boxQuantities);
  const cart = useCart();

  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(grades[0] ?? null);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(weights[0] ?? null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(unitOptions[0]?.key ?? null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(subCategoryIds[0] ?? null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const resolvedSubCats = subCategoryIds
    .map((id) => subCategories.find((s) => s._id === id))
    .filter(Boolean) as SubCategory[];

  // The variety name (subcategory) and chosen unit label, used for cart + WhatsApp.
  const subName = selectedSubId
    ? resolvedSubCats.find((s) => s._id === selectedSubId)?.nameAR
    : undefined;
  const unitName = selectedUnit
    ? unitOptions.find((u) => u.key === selectedUnit)?.label
    : undefined;
  // Grade label combines the variety + grade for a clear order line.
  const gradeForOrder = [subName, selectedGrade].filter(Boolean).join(" - ") || undefined;

  const goNext = useCallback(() => {
    setSlideIdx((i) => (i + 1) % Math.max(images.length, 1));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setSlideIdx((i) => (i - 1 + images.length) % Math.max(images.length, 1));
  }, [images.length]);

  useEffect(() => {
    if (paused || images.length < 2) return;
    intervalRef.current = setInterval(goNext, SLIDE_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, images.length, goNext]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  }

  // Order directly via WhatsApp for just this product.
  function buildWA() {
    const line = orderLine({
      name: nameAR,
      grade: gradeForOrder,
      weight: selectedWeight ?? undefined,
      unitLabel: unitName,
    });
    return waLink(`مرحباً،\nأريد طلب ${line}`);
  }

  function addToCart() {
    cart.addItem({
      productId,
      name: nameAR,
      grade: gradeForOrder,
      weight: selectedWeight ?? undefined,
      unitLabel: unitName,
      imageUrl: images[0]?.url,
    });
  }

  const categoryLabel = categoryNameAR || categoryNameEN;
  const currentImage = images[slideIdx];

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
          {currentImage
            ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={slideIdx}
                src={currentImage.url}
                alt={nameAR}
                className="pdv2-img"
              />
            )
            : <div className="pdv2-img-empty" />
          }
          {categoryLabel && <span className="pdv2-badge">{categoryLabel}</span>}
        </div>

        {images.length > 1 && (
          <div className="pdv2-indicators">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`pdv2-indicator${i === slideIdx ? " pdv2-indicator-active" : ""}`}
                onClick={() => setSlideIdx(i)}
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

        {resolvedSubCats.length > 0 && (
          <div className="pdv2-sub-section">
            <p className="pdv2-selector-label">النوع:</p>
            <div className="pdv2-chips">
              {resolvedSubCats.map((sub) => (
                <button
                  key={sub._id}
                  type="button"
                  className={`pdv2-chip${selectedSubId === sub._id ? " pdv2-chip-active" : ""}`}
                  onClick={() => setSelectedSubId(selectedSubId === sub._id ? null : sub._id)}
                >
                  {sub.nameAR}
                </button>
              ))}
            </div>
          </div>
        )}

        {grades.length > 0 && (
          <div className="pdv2-sub-section">
            <p className="pdv2-selector-label">الحجم / الصنف:</p>
            <div className="pdv2-chips">
              {grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`pdv2-chip${selectedGrade === g ? " pdv2-chip-active" : ""}`}
                  onClick={() => setSelectedGrade(selectedGrade === g ? null : g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {weights.length > 0 && (
          <div className="pdv2-sub-section">
            <p className="pdv2-selector-label">الوزن:</p>
            <div className="pdv2-chips">
              {weights.map((w) => (
                <button
                  key={w}
                  type="button"
                  className={`pdv2-chip${selectedWeight === w ? " pdv2-chip-active" : ""}`}
                  onClick={() => setSelectedWeight(selectedWeight === w ? null : w)}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {unitOptions.length > 0 && (
          <div className="pdv2-sub-section">
            <p className="pdv2-selector-label">طريقة البيع:</p>
            <div className="pdv2-chips">
              {unitOptions.map((u) => (
                <button
                  key={u.key}
                  type="button"
                  className={`pdv2-chip${selectedUnit === u.key ? " pdv2-chip-active" : ""}`}
                  onClick={() => setSelectedUnit(selectedUnit === u.key ? null : u.key)}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pdv2-actions">
          <button type="button" className="pdv2-cart-btn" onClick={addToCart}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            أضف إلى السلة
          </button>
          <a href={buildWA()} target="_blank" rel="noopener noreferrer" className="pdv2-wa-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            اطلب الآن
          </a>
        </div>

        <p className="pdv2-trust">توصيل سريع · جودة مضمونة · تمور طازجة</p>

      </div>
    </div>
  );
}
