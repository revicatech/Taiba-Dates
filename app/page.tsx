import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Divider from "@/components/Divider";
import Heritage from "@/components/Heritage";
import Products from "@/components/Products";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Divider />
      <Heritage />
      <Products />
      <Features />
      <Testimonials />
      <CtaBanner />
      <Footer />
      <ScrollToTop />
    </>
  );
}
