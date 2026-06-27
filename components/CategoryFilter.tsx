import Link from "next/link";
import type { Category } from "@/data/products";

type Props = {
  categories: Category[];
  activeId?: string;
  activeSubId?: string;
};

export default function CategoryFilter({ categories, activeId, activeSubId }: Props) {
  const activeCategory = activeId ? categories.find((c) => c._id === activeId) : undefined;
  const subCategories = activeCategory?.subCategories ?? [];

  return (
    <div className="category-filter-wrap">
      <div className="category-filter" role="tablist" aria-label="فلترة المنتجات حسب الفئة">
        <Link
          href="/products"
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
              href={`/products?category=${c._id}`}
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

      {/* Second level: varieties (subcategories) of the active category */}
      {subCategories.length > 0 && (
        <div className="category-subfilter" role="tablist" aria-label="فلترة حسب الصنف">
          <Link
            href={`/products?category=${activeId}`}
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
                href={`/products?category=${activeId}&sub=${s._id}`}
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
    </div>
  );
}
