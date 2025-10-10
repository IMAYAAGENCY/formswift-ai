import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Per Form",
    price: "₹20",
    period: "per form",
    description: "Perfect for occasional users",
    features: [
      "1 form download",
      "All form types supported",
      "AI auto-fill",
      "Instant download",
      "No expiry",
    ],
    popular: false,
  },
  {
    name: "Daily",
    price: "₹79",
    period: "per day",
    description: "Great for daily tasks",
    features: [
      "10 forms per day",
      "All form types supported",
      "AI auto-fill",
      "Priority processing",
      "24 hours access",
    ],
    popular: false,
  },
  {
    name: "Weekly",
    price: "₹299",
    period: "per week",
    description: "Best for active professionals",
    features: [
      "100 forms per week",
      "All form types supported",
      "AI auto-fill",
      "Priority processing",
      "7 days access",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Monthly",
    price: "₹699",
    period: "per month",
    description: "Most popular choice",
    features: [
      "400 forms per month",
      "All form types supported",
      "AI auto-fill",
      "Priority processing",
      "30 days access",
      "Email support",
      "Smart memory AI",
    ],
    popular: true,
  },
  {
    name: "Quarterly",
    price: "₹1,999",
    period: "per quarter",
    description: "Best value for businesses",
    features: [
      "1,500 forms per quarter",
      "All form types supported",
      "AI auto-fill",
      "Priority processing",
      "90 days access",
      "Priority email support",
      "Smart memory AI",
      "API access",
    ],
    popular: false,
  },
  {
    name: "Yearly",
    price: "₹5,999",
    period: "per year",
    description: "Maximum savings",
    features: [
      "10,000 forms per year",
      "All form types supported",
      "AI auto-fill",
      "Fastest processing",
      "365 days access",
      "Priority email support",
      "Smart memory AI",
      "API access",
      "Custom integrations",
    ],
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start with 2 free forms, no credit card required.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.popular
                  ? "border-accent border-2 shadow-[var(--shadow-accent)]"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="pb-8 pt-6">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  variant={plan.popular ? "hero" : "default"}
                  className="w-full"
                  asChild
                >
                  <Link to="/auth">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            All plans include secure encryption, instant downloads, and full customer support
          </p>
        </div>
      </div>
    </section>
  );
};
