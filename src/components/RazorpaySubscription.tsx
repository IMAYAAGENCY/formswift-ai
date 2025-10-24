import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RazorpaySubscriptionProps {
  planId: string;
  planName: string;
  planDescription?: string;
  totalCount?: number;
  quantity?: number;
  logoUrl?: string;
  onSuccess?: (subscriptionId: string, paymentId: string) => void;
  onError?: (error: string) => void;
  children: React.ReactNode;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpaySubscription = ({
  planId,
  planName,
  planDescription = "Subscription Plan",
  totalCount,
  quantity = 1,
  logoUrl,
  onSuccess,
  onError,
  children,
}: RazorpaySubscriptionProps) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscription = async () => {
    try {
      // Create subscription via edge function
      const { data, error } = await supabase.functions.invoke(
        "razorpay-create-subscription",
        {
          body: { 
            planId, 
            totalCount, 
            quantity,
            notes: {
              plan_name: planName,
            }
          },
        }
      );

      if (error) throw error;

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "FormSwift AI",
        description: planDescription,
        image: logoUrl || undefined,
        subscription_card_change: true,
        handler: function (response: any) {
          toast.success("Subscription activated successfully!");
          console.log("Subscription response:", response);
          onSuccess?.(
            response.razorpay_subscription_id,
            response.razorpay_payment_id
          );
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        notes: {
          plan_name: planName,
        },
        theme: {
          color: "#8B5CF6",
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on("payment.failed", function (response: any) {
        console.error("Subscription payment failed:", response.error);
        toast.error(response.error.description || "Subscription payment failed");
        onError?.(response.error.description);
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Error initiating subscription:", error);
      toast.error(error.message || "Failed to initiate subscription");
      onError?.(error.message);
    }
  };

  return <div onClick={handleSubscription}>{children}</div>;
};
