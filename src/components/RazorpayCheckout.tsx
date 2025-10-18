import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RazorpayCheckoutProps {
  amount: number;
  currency?: string;
  description?: string;
  formId?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  children: React.ReactNode;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpayCheckout = ({
  amount,
  currency = "INR",
  description = "Payment",
  formId,
  onSuccess,
  onError,
  children,
}: RazorpayCheckoutProps) => {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      // Create order via edge function
      const { data, error } = await supabase.functions.invoke(
        "razorpay-create-payment",
        {
          body: { amount, currency, description, formId },
        }
      );

      if (error) throw error;

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "FormSwift AI",
        description: description,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment signature
            const { data: verifyData, error: verifyError } =
              await supabase.functions.invoke("razorpay-verify-payment", {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              });

            if (verifyError) throw verifyError;

            if (verifyData?.verified) {
              toast.success("Payment successful!");
              onSuccess?.(response.razorpay_payment_id);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err: any) {
            console.error("Payment verification error:", err);
            toast.error(err.message || "Payment verification failed");
            onError?.(err.message);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#8B5CF6",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        toast.error(response.error.description || "Payment failed");
        onError?.(response.error.description);
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Error initiating payment:", error);
      toast.error(error.message || "Failed to initiate payment");
      onError?.(error.message);
    }
  };

  return <div onClick={handlePayment}>{children}</div>;
};
