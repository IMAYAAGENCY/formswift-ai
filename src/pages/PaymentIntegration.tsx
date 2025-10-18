import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PaymentIntegration = () => {
  const [integrations, setIntegrations] = useState({
    stripe: { enabled: true, testMode: true },
    paypal: { enabled: false, testMode: false },
    razorpay: { enabled: false, testMode: false },
  });

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
                        {integrations.stripe.enabled && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Accept credit cards, debit cards, and more
                      </CardDescription>
                    </div>
                    <Switch
                      checked={integrations.stripe.enabled}
                      onCheckedChange={(checked) =>
                        setIntegrations({
                          ...integrations,
                          stripe: { ...integrations.stripe, enabled: checked },
                        })
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-secret">Secret Key</Label>
                    <Input
                      id="stripe-secret"
                      placeholder="sk_test_..."
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                    <Input
                      id="stripe-webhook"
                      placeholder="whsec_..."
                      type="password"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="stripe-test"
                      checked={integrations.stripe.testMode}
                      onCheckedChange={(checked) =>
                        setIntegrations({
                          ...integrations,
                          stripe: { ...integrations.stripe, testMode: checked },
                        })
                      }
                    />
                    <Label htmlFor="stripe-test">Test Mode</Label>
                  </div>
                  <Button className="w-full">Save Configuration</Button>
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
                        {integrations.paypal.enabled && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Accept PayPal payments globally
                      </CardDescription>
                    </div>
                    <Switch
                      checked={integrations.paypal.enabled}
                      onCheckedChange={(checked) =>
                        setIntegrations({
                          ...integrations,
                          paypal: { ...integrations.paypal, enabled: checked },
                        })
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paypal-secret">Secret Key</Label>
                    <Input
                      id="paypal-secret"
                      placeholder="Your PayPal Secret"
                      type="password"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="paypal-test"
                      checked={integrations.paypal.testMode}
                      onCheckedChange={(checked) =>
                        setIntegrations({
                          ...integrations,
                          paypal: { ...integrations.paypal, testMode: checked },
                        })
                      }
                    />
                    <Label htmlFor="paypal-test">Sandbox Mode</Label>
                  </div>
                  <Button className="w-full">Save Configuration</Button>
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
                        {integrations.razorpay.enabled && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Accept payments in India with UPI, cards, and wallets
                      </CardDescription>
                    </div>
                    <Switch
                      checked={integrations.razorpay.enabled}
                      onCheckedChange={(checked) =>
                        setIntegrations({
                          ...integrations,
                          razorpay: { ...integrations.razorpay, enabled: checked },
                        })
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razorpay-secret">Key Secret</Label>
                    <Input
                      id="razorpay-secret"
                      placeholder="Your Razorpay Secret"
                      type="password"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="razorpay-test"
                      checked={integrations.razorpay.testMode}
                      onCheckedChange={(checked) =>
                        setIntegrations({
                          ...integrations,
                          razorpay: { ...integrations.razorpay, testMode: checked },
                        })
                      }
                    />
                    <Label htmlFor="razorpay-test">Test Mode</Label>
                  </div>
                  <Button className="w-full">Save Configuration</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentIntegration;