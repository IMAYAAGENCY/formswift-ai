import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
}

const plans: Plan[] = [
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

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgradeSuccess: () => void;
}

export const UpgradePlanModal = ({ open, onOpenChange, onUpgradeSuccess }: UpgradePlanModalProps) => {
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpgrade = async (plan: Plan) => {
    setProcessingPlan(plan.name);

    try {
      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: { planName: plan.name }
        }
      );

      if (orderError) throw orderError;
      if (orderData.error) throw new Error(orderData.error);

      // Initialize Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AI AUTO FORM",
        description: `${plan.name} Plan`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'verify-razorpay-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planName: plan.name,
                  amount: orderData.amount,
                }
              }
            );

            if (verifyError) throw verifyError;
            if (verifyData.error) throw new Error(verifyData.error);

            toast({
              title: "Payment successful! 🎉",
              description: `Your ${plan.name} plan has been activated`,
            });

            onUpgradeSuccess();
            onOpenChange(false);
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment verification failed",
              description: "Please contact support if amount was deducted",
              variant: "destructive",
            });
          } finally {
            setProcessingPlan(null);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function() {
            setProcessingPlan(null);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast({
        title: "Upgrade failed",
        description: "We couldn't process your upgrade. Please try again.",
        variant: "destructive",
      });
      setProcessingPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Choose the plan that best fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-accent border-2 shadow-[var(--shadow-accent)]"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription className="text-xs">{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-xs ml-1">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span className="text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "hero" : "default"}
                  className="w-full"
                  onClick={() => handleUpgrade(plan)}
                  disabled={processingPlan !== null}
                >
                  {processingPlan === plan.name ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Upgrade Now"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
