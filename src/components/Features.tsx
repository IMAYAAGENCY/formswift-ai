import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Brain, Shield, TrendingUp, Clock, FileCheck, Languages } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Upload your form and get it filled in under 2 seconds. No waiting, no hassle.",
  },
  {
    icon: Languages,
    title: "22 Indian Languages",
    description: "Fill forms in Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, and 16 more Indian languages with perfect native script support.",
  },
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Our AI learns from your data and gets smarter with every form you fill.",
  },
  {
    icon: Shield,
    title: "100% Secure",
    description: "Bank-grade encryption keeps your data safe and private. We never share your information.",
  },
  {
    icon: FileCheck,
    title: "All Form Types",
    description: "Support for PDF, JPG, PNG, DOC, and even online form links. Any format works.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Access your forms anytime, anywhere. Fill forms at midnight or during your lunch break.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 sm:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold px-4">
            Why Choose FormAI Vault?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Powerful features designed to save you time and eliminate form-filling frustration
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 hover:border-primary/50 transition-all hover:shadow-[var(--shadow-elegant)] group"
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
