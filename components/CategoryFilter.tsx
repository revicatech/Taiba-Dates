import Link from "next/link";
import type { Category } from "@/data/products";

type Props = {
  categories: Category[];
  activeId?: string;
};

export default function CategoryFilter({ categories, activeId }: Props) {
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
    </div>
  );
}
