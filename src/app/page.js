import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Modules } from "@/components/landing/Modules";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { About } from "@/components/landing/About";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <main className="overflow-hidden font-keka">
      <Navbar />
      <Hero />
      <Features />
      <Modules />
      <Stats />
      <Pricing />
      <Testimonials />
      <About />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;