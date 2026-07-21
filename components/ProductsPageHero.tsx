type Props = {
  totalCount: number;
  activeCategoryName?: string;
};

export default function ProductsPageHero({ totalCount, activeCategoryName }: Props) {
  return (
    <section className="page-hero">
      <div className="page-hero-bg" aria-hidden />
      <div className="page-hero-geo" aria-hidden />
      <div className="page-hero-watermark" aria-hidden>ط</div>

      <div className="container page-hero-content">
        <div className="page-hero-badge">
          <span className="dot" />
          <span>OUR COLLECTION — مجموعتنا</span>
        </div>
        <h1 className="page-hero-title">
          أجود <span className="gold">التمور</span> الفاخرة
        </h1>
        <p className="page-hero-subtitle">Premium Date Varieties</p>
        <p className="page-hero-desc">
          {activeCategoryName
            ? `استعرض مجموعتنا من ${activeCategoryName} — مُختارة بعناية من أفضل المزارع.`
            : "من المدجول الملكي إلى العجوة النبوية — كل صنف يخبر حكاية أرض وتاريخ."}
        </p>
        <div className="page-hero-meta">
          <span>{totalCount} {totalCount === 1 ? "منتج" : "منتجًا"}</span>
        </div>
      </div>
    </section>
  );
}
