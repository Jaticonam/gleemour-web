import { useEffect, useState } from "react";
import HeroSlider from "../sections/HeroSlider";

import CategoriesSection from "../sections/CategoriesSection";
import FeaturedProductsSection from "../sections/FeaturedProductsSection";
import HowToBuySection from "../sections/HowToBuySection";
import StatsSection from "../sections/StatsSection";
import ShippingSection from "../sections/ShippingSection";
import CorporateSection from "../sections/CorporateSection";
import BrandStorySection from "../sections/BrandStorySection";
import TestimonialsSection from "../sections/TestimonialsSection";
import FinalCTASection from "../sections/FinalCTASection";
import SocialSection from "../sections/SocialSection";
import LocationSection from "../sections/LocationSection";

import HomeNav from "../components/HomeNav";
import HomeFooter from "../components/HomeFooter";
import HomeFloatingButtons from "../components/HomeFloatingButtons";
export default function HomePage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const loadCart = () => {
    const storedCart = localStorage.getItem("jung_cart");

    if (!storedCart) {
      setCart([]);
      return;
    }

    try {
      setCart(JSON.parse(storedCart));
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    loadCart();

    const handleStorage = () => {
      loadCart();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", loadCart);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", loadCart);
    };
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  const handleCartClick = () => {
    window.location.href = "/catalogo";
  };

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-clip">
      <HeroSlider />

      <HomeNav cartCount={cartCount} onCartClick={handleCartClick} />

      <CategoriesSection />
      {/* <FeaturedProductsSection /> */}
      <HowToBuySection />
      <CorporateSection />
      <StatsSection />
      <ShippingSection />
      <LocationSection />
      <BrandStorySection />
      {/*
      <TestimonialsSection />
      <FinalCTASection />
      */}
      <SocialSection />
      <HomeFooter />

      <HomeFloatingButtons
        cartCount={cartCount}
        onCartClick={handleCartClick}
        variant="home"
      />
    </div>
  );
}





