import Link from "next/link";
import type { Category } from "@/data/products";

type Props = {
  categories: Category[];
  activeId?: string;
  activeSubId?: string;
  activeUnit?: "box" | "piece";
};

function buildHref(p: { category?: string; sub?: string; unit?: string }) {
  const qs = new URLSearchParams();
  if (p.category) qs.set("category", p.category);
  if (p.sub) qs.set("sub", p.sub);
  if (p.unit) qs.set("unit", p.unit);
  const s = qs.toString();
  return s ? `/products?${s}` : "/products";
}

export default function CategoryFilter({ categories, activeId, activeSubId, activeUnit }: Props) {
  const activeCategory = activeId ? categories.find((c) => c._id === activeId) : undefined;
  const subCategories = activeCategory?.subCategories ?? [];

  return (
    <div className="category-filter-wrap">
      {/* Level 1: main categories */}
      <div className="category-filter" role="tablist" aria-label="فلترة المنتجات حسب الفئة">
        <Link
          href={buildHref({ unit: activeUnit })}
          scroll={false}
          className={`category-chip${!activeId ? " active" : ""}`}
          aria-current={!activeId ? "page" : undefined}
        >
          كل المنتجات
        </Link>
        {categories.map((c) => {
          const active = c._id === activeId;
          return (
            <Link
              key={c._id}
              href={buildHref({ category: c._id, unit: activeUnit })}
              scroll={false}
              className={`category-chip${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="category-chip-ar">{c.nameAR}</span>
              <span className="category-chip-en">{c.nameEN}</span>
            </Link>
          );
        })}
      </div>

      {/* Level 2: varieties (subcategories) of the active category */}
      {subCategories.length > 0 && (
        <div className="category-subfilter" role="tablist" aria-label="فلترة حسب الصنف">
          <Link
            href={buildHref({ category: activeId, unit: activeUnit })}
            scroll={false}
            className={`category-subchip${!activeSubId ? " active" : ""}`}
            aria-current={!activeSubId ? "page" : undefined}
          >
            الكل
          </Link>
          {subCategories.map((s) => {
            const active = s._id === activeSubId;
            return (
              <Link
                key={s._id}
                href={buildHref({ category: activeId, sub: s._id, unit: activeUnit })}
                scroll={false}
                className={`category-subchip${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {s.nameAR}
              </Link>
            );
          })}
        </div>
      )}

      {/* Unit filter: box vs piece */}
      <div className="category-unitfilter" role="tablist" aria-label="فلترة حسب طريقة البيع">
        <Link
          href={buildHref({ category: activeId, sub: activeSubId })}
          scroll={false}
          className={`category-unitchip${!activeUnit ? " active" : ""}`}
          aria-current={!activeUnit ? "page" : undefined}
        >
          الكل
        </Link>
        <Link
          href={buildHref({ category: activeId, sub: activeSubId, unit: "box" })}
          scroll={false}
          className={`category-unitchip${activeUnit === "box" ? " active" : ""}`}
          aria-current={activeUnit === "box" ? "page" : undefined}
        >
          بالصندوق
        </Link>
        <Link
          href={buildHref({ category: activeId, sub: activeSubId, unit: "piece" })}
          scroll={false}
          className={`category-unitchip${activeUnit === "piece" ? " active" : ""}`}
          aria-current={activeUnit === "piece" ? "page" : undefined}
        >
          بالحبة
        </Link>
      </div>
    </div>
  );
}
