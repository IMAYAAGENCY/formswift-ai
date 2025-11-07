import { useState } from "react";
import { Check, Zap, Crown, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RazorpaySubscription } from "@/components/RazorpaySubscription";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: any;
  razorpayPlanId?: string;
  formsLimit: number;
  savings?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "Forever",
    description: "Perfect for trying out our platform",
    features: [
      "10 forms per month",
      "Basic form builder",
      "Email notifications",
      "Community support",
      "Basic analytics",
    ],
    icon: Sparkles,
    formsLimit: 10,
  },
  {
    id: "weekly",
    name: "Weekly",
    price: 99,
    period: "per week",
    description: "Great for short-term projects",
    features: [
      "50 forms per week",
      "Advanced form builder",
      "Priority email support",
      "Advanced analytics",
      "Custom branding",
      "API access",
    ],
    icon: Zap,
    razorpayPlanId: "plan_weekly",
    formsLimit: 50,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 299,
    period: "per month",
    description: "Most popular for growing teams",
    features: [
      "200 forms per month",
      "Everything in Weekly",
      "Team collaboration",
      "Advanced integrations",
      "White-label options",
      "Dedicated support",
    ],
    popular: true,
    icon: Crown,
    razorpayPlanId: "plan_monthly",
    formsLimit: 200,
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: 799,
    period: "per quarter",
    description: "Best value for committed users",
    features: [
      "600 forms per quarter",
      "Everything in Monthly",
      "Priority support",
      "Advanced security",
      "Custom workflows",
      "SLA guarantee",
    ],
    icon: Crown,
    razorpayPlanId: "plan_quarterly",
    formsLimit: 600,
    savings: "Save 11%",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 2999,
    period: "per year",
    description: "Maximum savings for enterprises",
    features: [
      "Unlimited forms",
      "Everything in Quarterly",
      "24/7 phone support",
      "Custom development",
      "Dedicated account manager",
      "Training sessions",
    ],
    icon: Crown,
    razorpayPlanId: "plan_yearly",
    formsLimit: 999999,
    savings: "Save 16%",
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (plan: PricingPlan) => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to subscribe");
      navigate("/auth");
      return;
    }

    if (plan.id === "free") {
      toast.info("You're already on the free plan!");
      navigate("/dashboard");
      return;
    }

    setLoading(plan.id);
  };

  const handlePaymentSuccess = async (subscriptionId: string, paymentId: string, planName: string) => {
    try {
      // Update user profile with subscription details
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from("profiles")
          .update({
            plan_type: planName,
          })
          .eq("id", session.user.id);

        toast.success(`Successfully subscribed to ${planName} plan!`);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Subscription successful, but failed to update profile");
    } finally {
      setLoading(null);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
    setLoading(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-background via-secondary/20 to-background">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Flexible Pricing
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Choose Your Perfect Plan
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start free, scale as you grow. No hidden fees, cancel anytime.
              </p>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
                <TabsTrigger value="all">All Plans</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pricingPlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`relative flex flex-col transition-all duration-300 hover:shadow-lg ${
                        plan.popular
                          ? "border-primary shadow-elegant scale-105"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      {plan.savings && (
                        <div className="absolute -top-4 right-4">
                          <Badge className="bg-gradient-to-r from-accent to-accent-glow text-accent-foreground">
                            {plan.savings}
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-8 pt-8">
                        <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                          <plan.icon className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription className="mt-2">{plan.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold text-foreground">
                            ₹{plan.price}
                          </span>
                          <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1">
                        <ul className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter>
                        {plan.razorpayPlanId ? (
                          <RazorpaySubscription
                            planId={plan.razorpayPlanId}
                            planName={plan.name}
                            planDescription={`${plan.name} subscription for FormSwift AI`}
                            onSuccess={(subId, payId) => handlePaymentSuccess(subId, payId, plan.name)}
                            onError={handlePaymentError}
                          >
                            <Button
                              className="w-full"
                              variant={plan.popular ? "default" : "outline"}
                              size="lg"
                              disabled={loading === plan.id}
                              onClick={() => handleSelectPlan(plan)}
                            >
                              {loading === plan.id ? "Processing..." : "Subscribe Now"}
                            </Button>
                          </RazorpaySubscription>
                        ) : (
                          <Button
                            className="w-full"
                            variant="outline"
                            size="lg"
                            onClick={() => handleSelectPlan(plan)}
                          >
                            Get Started Free
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="popular" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pricingPlans
                    .filter((plan) => plan.popular || plan.id === "free")
                    .map((plan) => (
                      <Card
                        key={plan.id}
                        className={`relative flex flex-col transition-all duration-300 hover:shadow-lg ${
                          plan.popular
                            ? "border-primary shadow-elegant scale-105"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <Badge className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
                              Most Popular
                            </Badge>
                          </div>
                        )}

                        <CardHeader className="text-center pb-8 pt-8">
                          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                            <plan.icon className="h-8 w-8 text-primary" />
                          </div>
                          <CardTitle className="text-2xl">{plan.name}</CardTitle>
                          <CardDescription className="mt-2">{plan.description}</CardDescription>
                          <div className="mt-4">
                            <span className="text-4xl font-bold text-foreground">
                              ₹{plan.price}
                            </span>
                            <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                          </div>
                        </CardHeader>

                        <CardContent className="flex-1">
                          <ul className="space-y-3">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                                <span className="text-sm text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>

                        <CardFooter>
                          {plan.razorpayPlanId ? (
                            <RazorpaySubscription
                              planId={plan.razorpayPlanId}
                              planName={plan.name}
                              planDescription={`${plan.name} subscription for FormSwift AI`}
                              onSuccess={(subId, payId) => handlePaymentSuccess(subId, payId, plan.name)}
                              onError={handlePaymentError}
                            >
                              <Button
                                className="w-full"
                                variant={plan.popular ? "default" : "outline"}
                                size="lg"
                                disabled={loading === plan.id}
                                onClick={() => handleSelectPlan(plan)}
                              >
                                {loading === plan.id ? "Processing..." : "Subscribe Now"}
                              </Button>
                            </RazorpaySubscription>
                          ) : (
                            <Button
                              className="w-full"
                              variant="outline"
                              size="lg"
                              onClick={() => handleSelectPlan(plan)}
                            >
                              Get Started Free
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* FAQ Section */}
            <div className="mt-20 text-center">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We accept all major credit cards, debit cards, UPI, and net banking through Razorpay.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Is there a free trial?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes! Start with our free plan - no credit card required. Upgrade whenever you're ready.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I cancel my subscription?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Absolutely. Cancel anytime with no questions asked. You'll continue to have access until the end of your billing period.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
