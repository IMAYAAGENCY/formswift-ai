import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage1200 from "@/assets/hero-1200-compressed.webp";
import heroImage800 from "@/assets/hero-800-compressed.webp";
import heroImage640 from "@/assets/hero-640-compressed.webp";
import heroImageFallback from "@/assets/hero-image.jpg";

export const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--gradient-subtle)] -z-10" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">India's First AI Form Assistant</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Fill Less.
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Earn More.
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Upload any form (PDF, Image, DOC). Our AI fills it instantly. Download ready-to-submit forms in seconds. No manual work required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild className="text-base group">
                <Link to="/auto-fill-demo">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Try AI Form Assistant - 10 Free Trials
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-base">
                <Link to="/#pricing">View Pricing</Link>
              </Button>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border/50">
              <span className="text-sm text-muted-foreground">
                🎉 10টি ফ্রি ট্রাইল • তারপর watermark সহ ডাউনলোড • Premium-এ আপগ্রেড করুন unlimited এর জন্য
              </span>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Forms Filled</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-primary">5,000+</div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-accent">2 Sec</div>
                <div className="text-sm text-muted-foreground">Avg. Fill Time</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl rounded-3xl" />
            <picture>
              <source 
                srcSet={`${heroImage640} 640w, ${heroImage800} 800w, ${heroImage1200} 1200w`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
                type="image/webp" 
              />
              <img
                src={heroImageFallback}
                alt="AI Form Processing"
                width="1200"
                height="675"
                fetchPriority="high"
                className="relative rounded-2xl shadow-2xl w-full h-auto"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
};
