import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const TestRazorpaySubscription = () => {
  const [loading, setLoading] = useState(false);
  const [planId, setPlanId] = useState('');
  const [amount, setAmount] = useState('1');

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
    if (!planId.trim()) {
      toast.error('Please enter a Plan ID');
      return;
    }

    setLoading(true);

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay script');
        return;
      }

      // 2. Create subscription via edge function
      console.log('Creating subscription with Plan ID:', planId);
      const { data, error } = await supabase.functions.invoke(
        'razorpay-create-subscription',
        {
          body: {
            planId: planId.trim(),
            totalCount: 12, // 12 billing cycles
            quantity: 1,
            notes: {
              plan_name: 'Test Subscription Plan',
            },
          },
        }
      );

      if (error) {
        console.error('Subscription creation error:', error);
        toast.error('Failed to create subscription: ' + (error.message || 'Unknown error'));
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
        description: `Test Subscription - ₹${amount}`,
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#8B5CF6',
        },
        handler: function (response: any) {
          console.log('✅ Payment Success:', response);
          toast.success('Payment successful! Subscription ID: ' + response.razorpay_subscription_id);
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test Razorpay Subscription</CardTitle>
        <CardDescription>
          Test your Razorpay subscription integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Setup Instructions */}
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p className="font-semibold">Setup Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Create a subscription plan in your Razorpay Dashboard</li>
              <li>Copy the Plan ID (starts with "plan_")</li>
              <li>Paste it below and test the subscription</li>
            </ol>
            <Button 
              variant="link" 
              className="h-auto p-0" 
              asChild
            >
              <a 
                href="https://dashboard.razorpay.com/app/subscriptions/plans" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                Open Razorpay Dashboard <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>

        {/* Plan ID Input */}
        <div className="space-y-2">
          <Label htmlFor="planId">Razorpay Plan ID *</Label>
          <Input
            id="planId"
            placeholder="plan_xxxxxxxxxx"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Get this from Razorpay Dashboard → Subscriptions → Plans
          </p>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Plan Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            For testing, use ₹1 or ₹0 amount plans
          </p>
        </div>

        {/* Test Button */}
        <Button 
          onClick={handleTestSubscription}
          disabled={loading || !planId}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Test Subscribe ₹${amount}`
          )}
        </Button>
        
        {/* Testing Instructions */}
        <div className="rounded-lg bg-muted p-4 space-y-3">
          <h4 className="font-semibold text-sm">How to Test:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Make sure Test Mode is enabled in your Razorpay Dashboard</li>
            <li>Use test payment details when the checkout opens:
              <div className="ml-6 mt-1 space-y-1 font-mono text-xs">
                <div>Card: 4111 1111 1111 1111</div>
                <div>CVV: Any 3 digits (e.g., 123)</div>
                <div>Expiry: Any future date</div>
                <div>Name: Any name</div>
              </div>
            </li>
            <li>Complete the payment to test the subscription flow</li>
            <li>Check console logs for subscription details</li>
          </ol>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
          <p><strong>Note:</strong> This is for testing only</p>
          <p>• Test mode transactions won't charge real money</p>
          <p>• Subscription will be visible in your Razorpay Dashboard</p>
          <p>• Production keys should only be used for live payments</p>
        </div>
      </CardContent>
    </Card>
  );
};
