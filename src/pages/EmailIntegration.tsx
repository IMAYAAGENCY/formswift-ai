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
import { Mail, Users, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const EmailIntegration = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Email Marketing Integration
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect to Mailchimp, SendGrid, and other email platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Connected platforms</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,240</div>
                <p className="text-xs text-muted-foreground">Total contacts synced</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.4K</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">42.3%</div>
                <p className="text-xs text-muted-foreground">Average rate</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="mailchimp" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="mailchimp">Mailchimp</TabsTrigger>
              <TabsTrigger value="sendgrid">SendGrid</TabsTrigger>
              <TabsTrigger value="hubspot">HubSpot</TabsTrigger>
              <TabsTrigger value="activecampaign">ActiveCampaign</TabsTrigger>
            </TabsList>

            <TabsContent value="mailchimp" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Mailchimp Integration
                        <Badge variant="default">Active</Badge>
                      </CardTitle>
                      <CardDescription>
                        Sync form submissions to your Mailchimp lists
                      </CardDescription>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mailchimp-api">API Key</Label>
                    <Input
                      id="mailchimp-api"
                      placeholder="Your Mailchimp API Key"
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mailchimp-list">Default List ID</Label>
                    <Input
                      id="mailchimp-list"
                      placeholder="List ID"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="mailchimp-auto" defaultChecked />
                    <Label htmlFor="mailchimp-auto">Auto-sync on form submission</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="mailchimp-double" />
                    <Label htmlFor="mailchimp-double">Require double opt-in</Label>
                  </div>
                  <Button className="w-full">Save Configuration</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sendgrid" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        SendGrid Integration
                      </CardTitle>
                      <CardDescription>
                        Send transactional emails and manage contacts
                      </CardDescription>
                    </div>
                    <Switch />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sendgrid-api">API Key</Label>
                    <Input
                      id="sendgrid-api"
                      placeholder="Your SendGrid API Key"
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sendgrid-from">From Email</Label>
                    <Input
                      id="sendgrid-from"
                      placeholder="noreply@yourdomain.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sendgrid-name">From Name</Label>
                    <Input
                      id="sendgrid-name"
                      placeholder="Your Company Name"
                    />
                  </div>
                  <Button className="w-full">Save Configuration</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hubspot" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        HubSpot Integration
                      </CardTitle>
                      <CardDescription>
                        Sync contacts and create deals in HubSpot
                      </CardDescription>
                    </div>
                    <Switch />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hubspot-api">API Key</Label>
                    <Input
                      id="hubspot-api"
                      placeholder="Your HubSpot API Key"
                      type="password"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="hubspot-contacts" defaultChecked />
                    <Label htmlFor="hubspot-contacts">Create contacts automatically</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="hubspot-deals" />
                    <Label htmlFor="hubspot-deals">Create deals from submissions</Label>
                  </div>
                  <Button className="w-full">Save Configuration</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activecampaign" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        ActiveCampaign Integration
                      </CardTitle>
                      <CardDescription>
                        Automate your email marketing workflows
                      </CardDescription>
                    </div>
                    <Switch />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ac-url">Account URL</Label>
                    <Input
                      id="ac-url"
                      placeholder="https://yourcompany.api-us1.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ac-api">API Key</Label>
                    <Input
                      id="ac-api"
                      placeholder="Your ActiveCampaign API Key"
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ac-list">Default List ID</Label>
                    <Input
                      id="ac-list"
                      placeholder="List ID"
                    />
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

export default EmailIntegration;