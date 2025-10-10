import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Brain, Shield, TrendingUp, Clock, FileCheck } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Upload your form and get it filled in under 2 seconds. No waiting, no hassle.",
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
  {
    icon: TrendingUp,
    title: "Smart Memory",
    description: "Save your details once. AI remembers and auto-fills future forms instantly.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Why Choose FormAI Vault?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to save you time and eliminate form-filling frustration
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
