import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, DollarSign, CheckCircle2, AlertCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentConfig {
  id?: string;
  provider: string;
  is_active: boolean;
  test_mode: boolean;
  api_key_encrypted?: string;
  webhook_secret?: string;
}

const PaymentIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [stripeConfig, setStripeConfig] = useState<PaymentConfig>({
    provider: 'stripe',
    is_active: false,
    test_mode: true,
  });
  
  const [paypalConfig, setPaypalConfig] = useState<PaymentConfig>({
    provider: 'paypal',
    is_active: false,
    test_mode: true,
  });
  
  const [razorpayConfig, setRazorpayConfig] = useState<PaymentConfig>({
    provider: 'razorpay',
    is_active: false,
    test_mode: true,
  });

  useEffect(() => {
    loadConfigurations();
    loadTransactions();
  }, []);

  const loadConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_integrations')
        .select('*');

      if (error) throw error;

      data?.forEach((config: PaymentConfig) => {
        if (config.provider === 'stripe') setStripeConfig(config);
        if (config.provider === 'paypal') setPaypalConfig(config);
        if (config.provider === 'razorpay') setRazorpayConfig(config);
      });
    } catch (error: any) {
      console.error('Error loading configurations:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('form_payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
    }
  };

  const saveConfiguration = async (config: PaymentConfig) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('payment_integrations')
        .upsert({
          user_id: user.id,
          provider: config.provider,
          is_active: config.is_active,
          test_mode: config.test_mode,
          api_key_encrypted: config.api_key_encrypted,
          webhook_secret: config.webhook_secret,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,provider'
        });

      if (error) throw error;

      toast.success(`${config.provider.charAt(0).toUpperCase() + config.provider.slice(1)} configuration saved successfully`);
      await loadConfigurations();
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Payment Integration
            </h1>
            <p className="text-muted-foreground text-lg">
              Accept payments directly through your forms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,450</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">234</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98.5%</div>
                <p className="text-xs text-muted-foreground">
                  Payment completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="stripe" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
            </TabsList>

            <TabsContent value="stripe" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Stripe Integration
                        {stripeConfig.is_active && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Accept credit cards, debit cards, and more
                      </CardDescription>
                    </div>
                    <Switch
                      checked={stripeConfig.is_active}
                      onCheckedChange={(checked) =>
                        setStripeConfig({ ...stripeConfig, is_active: checked })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripe-publishable">Publishable Key</Label>
                    <Input
                      id="stripe-publishable"
                      placeholder="pk_test_..."
                      type="password"
                      value={stripeConfig.api_key_encrypted || ''}
                      onChange={(e) =>
                        setStripeConfig({ ...stripeConfig, api_key_encrypted: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-secret">Secret Key</Label>
                    <Input
                      id="stripe-secret"
                      placeholder="sk_test_..."
                      type="password"
                      value={stripeConfig.webhook_secret || ''}
                      onChange={(e) =>
                        setStripeConfig({ ...stripeConfig, webhook_secret: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-webhook">Webhook Secret (Optional)</Label>
                    <Input
                      id="stripe-webhook"
                      placeholder="whsec_..."
                      type="password"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="stripe-test"
                      checked={stripeConfig.test_mode}
                      onCheckedChange={(checked) =>
                        setStripeConfig({ ...stripeConfig, test_mode: checked })
                      }
                    />
                    <Label htmlFor="stripe-test">Test Mode</Label>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => saveConfiguration(stripeConfig)}
                    disabled={loading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paypal" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        PayPal Integration
                        {paypalConfig.is_active && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Accept PayPal payments globally
                      </CardDescription>
                    </div>
                    <Switch
                      checked={paypalConfig.is_active}
                      onCheckedChange={(checked) =>
                        setPaypalConfig({ ...paypalConfig, is_active: checked })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paypal-client">Client ID</Label>
                    <Input
                      id="paypal-client"
                      placeholder="Your PayPal Client ID"
                      type="password"
                      value={paypalConfig.api_key_encrypted || ''}
                      onChange={(e) =>
                        setPaypalConfig({ ...paypalConfig, api_key_encrypted: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paypal-secret">Secret Key</Label>
                    <Input
                      id="paypal-secret"
                      placeholder="Your PayPal Secret"
                      type="password"
                      value={paypalConfig.webhook_secret || ''}
                      onChange={(e) =>
                        setPaypalConfig({ ...paypalConfig, webhook_secret: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="paypal-test"
                      checked={paypalConfig.test_mode}
                      onCheckedChange={(checked) =>
                        setPaypalConfig({ ...paypalConfig, test_mode: checked })
                      }
                    />
                    <Label htmlFor="paypal-test">Sandbox Mode</Label>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => saveConfiguration(paypalConfig)}
                    disabled={loading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="razorpay" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Razorpay Integration
                        {razorpayConfig.is_active && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Accept payments in India with UPI, cards, and wallets
                      </CardDescription>
                    </div>
                    <Switch
                      checked={razorpayConfig.is_active}
                      onCheckedChange={(checked) =>
                        setRazorpayConfig({ ...razorpayConfig, is_active: checked })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="razorpay-key">Key ID</Label>
                    <Input
                      id="razorpay-key"
                      placeholder="rzp_test_..."
                      type="password"
                      value={razorpayConfig.api_key_encrypted || ''}
                      onChange={(e) =>
                        setRazorpayConfig({ ...razorpayConfig, api_key_encrypted: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razorpay-secret">Key Secret</Label>
                    <Input
                      id="razorpay-secret"
                      placeholder="Your Razorpay Secret"
                      type="password"
                      value={razorpayConfig.webhook_secret || ''}
                      onChange={(e) =>
                        setRazorpayConfig({ ...razorpayConfig, webhook_secret: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="razorpay-test"
                      checked={razorpayConfig.test_mode}
                      onCheckedChange={(checked) =>
                        setRazorpayConfig({ ...razorpayConfig, test_mode: checked })
                      }
                    />
                    <Label htmlFor="razorpay-test">Test Mode</Label>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => saveConfiguration(razorpayConfig)}
                    disabled={loading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Transaction History */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest payment transactions across all gateways</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-sm">{tx.payment_id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tx.payment_provider}</Badge>
                        </TableCell>
                        <TableCell>
                          {tx.currency} {tx.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tx.status === 'succeeded' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(tx.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentIntegration;