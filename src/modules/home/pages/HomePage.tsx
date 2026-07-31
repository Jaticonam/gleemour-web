import HeroSlider from "../sections/HeroSlider";
import CategoriesSection from "../sections/CategoriesSection";
import ExperienceInvitationSection from "../sections/ExperienceInvitationSection";
import HowToBuySection from "../sections/HowToBuySection";
import StatsSection from "../sections/StatsSection";
import ShippingSection from "../sections/ShippingSection";
import CorporateSection from "../sections/CorporateSection";
import BrandStorySection from "../sections/BrandStorySection";
import SocialSection from "../sections/SocialSection";
import LocationSection from "../sections/LocationSection";

import HomeNav from "../components/HomeNav";
import HomeFooter from "../components/HomeFooter";
import HomeFloatingButtons from "../components/HomeFloatingButtons";

import { useCart } from "@/modules/cart/hooks/useCart";

export default function HomePage() {
  const { totalItems } = useCart();

  const handleCartClick = () => {
    window.location.href = "/catalogo";
  };

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-clip">
      <HeroSlider />

      <HomeNav
        cartCount={totalItems}
        onCartClick={handleCartClick}
      />

      <CategoriesSection />
      <ExperienceInvitationSection />
      <HowToBuySection />
      <CorporateSection />
      <StatsSection />
      <ShippingSection />
      <LocationSection />
      <BrandStorySection />
      <SocialSection />

      <HomeFooter />
      <HomeFloatingButtons />
    </div>
  );
}