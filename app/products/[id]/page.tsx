export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ProductDetailClient from "@/components/ProductDetailClient";
import { fetchProductById, deriveVariants } from "@/data/products";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) return { title: "منتج غير موجود" };
  return {
    title: `${product.nameAR} — طيبه للتمور`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) notFound();

  const subCategories = product.category?.subCategories ?? [];
  const effectiveVariants = deriveVariants(product);

  return (
    <>
      <Navbar solid />

      <main className="pdv2-page">
        <div className="pdv2-container">

          {/* Breadcrumb */}
          <div className="pdv2-breadcrumb" aria-label="breadcrumb">
            <a href="/">الرئيسية</a>
            <span>/</span>
            <a href="/products">المنتجات</a>
            <span>/</span>
            <span>{product.nameAR}</span>
          </div>

          <ProductDetailClient
            productId={product._id}
            nameAR={product.nameAR}
            nameEN={product.nameEN}
            description={product.description}
            categoryNameAR={product.category?.nameAR ?? ""}
            categoryNameEN={product.category?.nameEN ?? ""}
            features={product.features}
            variants={effectiveVariants}
            subCategoryIds={product.subCategoryIds}
            subCategories={subCategories}
            images={product.images}
          />

        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
}
