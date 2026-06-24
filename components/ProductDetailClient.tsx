"use client";

import { useState, useEffect, useRef } from "react";
import type { ProductSize, SubCategory } from "@/data/products";

type Props = {
  sizes: ProductSize[];
  subCategories: SubCategory[];
  productNameAR: string;
  productNameEN: string;
  whatsappNumber: string;
};

export default function ProductDetailClient({ sizes, subCategories, productNameAR, productNameEN, whatsappNumber }: Props) {
  // Derive unique sub-category IDs that have sizes
  const usedSubCatIds = [...new Set(sizes.map((s) => s.subCategoryId || ""))];
  const hasSubCats = usedSubCatIds.some((id) => id !== "");

  const [activeSub, setActiveSub] = useState<string>(usedSubCatIds[0] ?? "");
  const [activeSize, setActiveSize] = useState<ProductSize | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sizes for the active sub-category
  const visibleSizes = sizes.filter((s) => (s.subCategoryId || "") === activeSub);

  // All images for the current sub-category (for the slider)
  const sliderImages = visibleSizes.map((s) => ({ url: s.imageUrl, label: s.label }));

  // Reset when sub-category changes
  useEffect(() => {
    setActiveSize(visibleSizes[0] ?? null);
    setSlideIdx(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSub]);

  // Auto-slide
  useEffect(() => {
    if (sliderImages.length <= 1) return;
    timerRef.current = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sliderImages.length, activeSub]);

  // Sync slide index when user picks a size
  function pickSize(size: ProductSize) {
    setActiveSize(size);
    const idx = sliderImages.findIndex((img) => img.label === size.label);
    if (idx >= 0) setSlideIdx(idx);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function goSlide(idx: number) {
    setSlideIdx(idx);
    const matchedSize = visibleSizes[idx] ?? null;
    setActiveSize(matchedSize);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function buildWhatsApp() {
    const sub = activeSub ? subCategories.find((s) => s._id === activeSub) : null;
    const subLabel = sub ? ` - ${sub.nameAR}` : "";
    const sizeLabel = activeSize ? ` - ${activeSize.label}` : "";
    const name = productNameAR || productNameEN;
    const msg = `مرحباً،\nأريد طلب ${name}${subLabel}${sizeLabel}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }

  const currentImage = sliderImages[slideIdx]?.url ?? "";

  return (
    <div className="pdc-wrap">
      {/* IMAGE GALLERY */}
      <div className="pdc-gallery">
        <div className="pdc-main-img-wrap">
          {currentImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={currentImage} src={currentImage} alt={sliderImages[slideIdx]?.label} className="pdc-main-img" />
          )}
          {sliderImages.length > 1 && (
            <div className="pdc-slide-dots">
              {sliderImages.map((_, i) => (
                <button key={i} className={`pdc-dot${i === slideIdx ? " pdc-dot-active" : ""}`} onClick={() => goSlide(i)} aria-label={`صورة ${i + 1}`} />
              ))}
            </div>
          )}
        </div>
        {sliderImages.length > 1 && (
          <div className="pdc-thumbs">
            {sliderImages.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img.url}
                alt={img.label}
                className={`pdc-thumb${i === slideIdx ? " pdc-thumb-active" : ""}`}
                onClick={() => goSlide(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* SELECTOR PANEL */}
      <div className="pdc-selectors">
        {/* Sub-category tabs */}
        {hasSubCats && usedSubCatIds.some((id) => id !== "") && (
          <div className="pdc-sub-section">
            <p className="pdc-label">النوع:</p>
            <div className="pdc-chips">
              {usedSubCatIds.map((subId) => {
                const sub = subCategories.find((s) => s._id === subId);
                const label = sub ? sub.nameAR : "عام";
                return (
                  <button
                    key={subId}
                    type="button"
                    className={`pdc-chip${activeSub === subId ? " pdc-chip-active" : ""}`}
                    onClick={() => setActiveSub(subId)}
                  >
                    {label}
                    {sub?.nameEN && <span className="pdc-chip-en">{sub.nameEN}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size chips */}
        {visibleSizes.length > 0 && (
          <div className="pdc-sub-section">
            <p className="pdc-label">الحجم / الوزن:</p>
            <div className="pdc-chips">
              {visibleSizes.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className={`pdc-chip${activeSize?.label === s.label ? " pdc-chip-active" : ""}`}
                  onClick={() => pickSize(s)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* WhatsApp CTA */}
        <a href={buildWhatsApp()} target="_blank" rel="noopener noreferrer" className="pdc-whatsapp">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          اطلب عبر واتساب
          {activeSize && <span className="pdc-wa-size">({activeSize.label})</span>}
        </a>
      </div>
    </div>
  );
}
