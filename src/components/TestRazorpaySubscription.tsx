import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const TestRazorpaySubscription = () => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleTestSubscription = async () => {
    setLoading(true);

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay script');
        return;
      }

      // 2. Create subscription via edge function
      const { data, error } = await supabase.functions.invoke(
        'razorpay-create-subscription',
        {
          body: {
            planId: 'plan_La62j2e4ET6QzK', // Your test plan ID
            totalCount: 3,
            quantity: 1,
            notes: {
              plan_name: 'Test Monthly Plan',
            },
          },
        }
      );

      if (error) {
        console.error('Subscription creation error:', error);
        toast.error('Failed to create subscription: ' + error.message);
        return;
      }

      if (!data || !data.subscriptionId) {
        toast.error('Invalid subscription response');
        return;
      }

      console.log('Subscription created:', data);

      // 3. Open Razorpay checkout
      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'FormSwift AI',
        description: 'Test Monthly Plan - ₹1',
        prefill: {
          name: 'Test User',
          email: 'test@gmail.com',
          contact: '9999999999',
        },
        theme: {
          color: '#8B5CF6',
        },
        handler: function (response: any) {
          console.log('Payment Response:', response);
          toast.success('Test Successful! Subscription ID: ' + response.razorpay_subscription_id);
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        toast.error(response.error.description || 'Payment failed');
      });

      rzp.open();

    } catch (error: any) {
      console.error('Test error:', error);
      toast.error('Test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Razorpay Subscription</CardTitle>
        <CardDescription>
          Test your Razorpay integration with ₹1 subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleTestSubscription}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Test Subscribe ₹1'
          )}
        </Button>
        
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Note:</strong> This test will charge only ₹1</p>
          <p>Use Razorpay test cards during payment</p>
          <p className="text-xs">Test Card: 4111 1111 1111 1111, CVV: Any 3 digits, Expiry: Any future date</p>
        </div>
      </CardContent>
    </Card>
  );
};
