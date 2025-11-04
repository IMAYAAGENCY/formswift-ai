import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { AIDemo } from "@/components/AIDemo";
import { SmartFeatureShowcase } from "@/components/SmartFeatureShowcase";
import { Features } from "@/components/Features";
import { LanguageShowcase } from "@/components/LanguageShowcase";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <AIDemo />
      <SmartFeatureShowcase />
      <Features />
      <LanguageShowcase />
      <Pricing />
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
