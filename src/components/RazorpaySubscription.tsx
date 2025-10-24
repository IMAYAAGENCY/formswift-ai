import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RazorpaySubscriptionProps {
  planId: string;
  planName: string;
  planDescription?: string;
  amount: number;
  currency?: string;
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
  amount,
  currency = "INR",
  totalCount,
  quantity = 1,
  logoUrl,
  onSuccess,
  onError,
  children,
}: RazorpaySubscriptionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const verifySubscription = async (
    subscriptionId: string,
    paymentId: string,
    signature: string
  ) => {
    try {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke(
        "razorpay-verify-subscription",
        {
          body: {
            razorpay_subscription_id: subscriptionId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            plan_name: planName,
            amount: amount,
            currency: currency,
          },
        }
      );

      if (error) throw error;

      if (data.verified) {
        toast.success("Subscription activated successfully!");
        onSuccess?.(subscriptionId, paymentId);
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (error: any) {
      console.error("Error verifying subscription:", error);
      toast.error(error.message || "Failed to verify subscription");
      onError?.(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscription = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      
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
            },
          },
        }
      );

      if (error) throw error;

      if (!data.subscriptionId || !data.keyId) {
        throw new Error("Invalid subscription data received");
      }

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "FormSwift AI",
        description: planDescription,
        image: logoUrl || undefined,
        subscription_card_change: true,
        handler: async function (response: any) {
          console.log("Subscription payment response:", response);
          await verifySubscription(
            response.razorpay_subscription_id,
            response.razorpay_payment_id,
            response.razorpay_signature
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
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        console.error("Subscription payment failed:", response.error);
        setIsProcessing(false);
        toast.error(response.error.description || "Subscription payment failed");
        onError?.(response.error.description);
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Error initiating subscription:", error);
      setIsProcessing(false);
      toast.error(error.message || "Failed to initiate subscription");
      onError?.(error.message);
    }
  };

  return (
    <div onClick={handleSubscription} className={isProcessing ? "pointer-events-none opacity-60" : ""}>
      {isProcessing ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
};
