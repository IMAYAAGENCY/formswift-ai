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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const CRMIntegration = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              CRM Integration
            </h1>
            <p className="text-muted-foreground text-lg">
              Sync form data with Salesforce, HubSpot, and more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Syncs</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Connected CRMs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Records Synced</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,843</div>
                <p className="text-xs text-muted-foreground">Total contacts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">34.2%</div>
                <p className="text-xs text-muted-foreground">Lead to customer</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sync Success</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">99.8%</div>
                <p className="text-xs text-muted-foreground">Success rate</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="salesforce" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="salesforce">Salesforce</TabsTrigger>
              <TabsTrigger value="hubspot">HubSpot CRM</TabsTrigger>
              <TabsTrigger value="zoho">Zoho CRM</TabsTrigger>
              <TabsTrigger value="pipedrive">Pipedrive</TabsTrigger>
            </TabsList>

            <TabsContent value="salesforce" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Salesforce Integration
                        <Badge variant="default">Active</Badge>
                      </CardTitle>
                      <CardDescription>
                        Sync leads, contacts, and opportunities
                      </CardDescription>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sf-instance">Instance URL</Label>
                    <Input
                      id="sf-instance"
                      placeholder="https://yourcompany.my.salesforce.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sf-token">Access Token</Label>
                    <Input
                      id="sf-token"
                      placeholder="Your Salesforce Access Token"
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sf-object">Default Object Type</Label>
                    <Select defaultValue="lead">
                      <SelectTrigger id="sf-object">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="contact">Contact</SelectItem>
                        <SelectItem value="opportunity">Opportunity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="sf-auto" defaultChecked />
                    <Label htmlFor="sf-auto">Auto-sync on form submission</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="sf-duplicates" defaultChecked />
                    <Label htmlFor="sf-duplicates">Check for duplicates</Label>
                  </div>
                  <Button className="w-full">Save Configuration</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Field Mapping</CardTitle>
                  <CardDescription>
                    Map form fields to Salesforce fields
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { form: "Full Name", crm: "Name" },
                      { form: "Email", crm: "Email" },
                      { form: "Phone", crm: "Phone" },
                      { form: "Company", crm: "Company" },
                    ].map((mapping, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Form Field</Label>
                          <Input value={mapping.form} disabled />
                        </div>
                        <div className="pt-6">→</div>
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Salesforce Field</Label>
                          <Select defaultValue={mapping.crm.toLowerCase()}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="company">Company</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">Add Field Mapping</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hubspot" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>HubSpot CRM Integration</CardTitle>
                      <CardDescription>
                        Create contacts, companies, and deals
                      </CardDescription>
                    </div>
                    <Switch />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hs-api">API Key</Label>
                    <Input
                      id="hs-api"
                      placeholder="Your HubSpot API Key"
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hs-object">Default Object</Label>
                    <Select defaultValue="contact">
                      <SelectTrigger id="hs-object">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contact">Contact</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="deal">Deal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Save Configuration</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="zoho" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Zoho CRM Integration</CardTitle>
                      <CardDescription>
                        Sync with Zoho CRM modules
                      </CardDescription>
                    </div>
                    <Switch />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="zoho-domain">Data Center</Label>
                    <Select defaultValue="com">
                      <SelectTrigger id="zoho-domain">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="com">.com (US)</SelectItem>
                        <SelectItem value="eu">.eu (Europe)</SelectItem>
                        <SelectItem value="in">.in (India)</SelectItem>
                        <SelectItem value="au">.com.au (Australia)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zoho-token">Access Token</Label>
                    <Input
                      id="zoho-token"
                      placeholder="Your Zoho Access Token"
                      type="password"
                    />
                  </div>
                  <Button className="w-full">Save Configuration</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pipedrive" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pipedrive Integration</CardTitle>
                      <CardDescription>
                        Create deals and manage leads
                      </CardDescription>
                    </div>
                    <Switch />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pd-api">API Token</Label>
                    <Input
                      id="pd-api"
                      placeholder="Your Pipedrive API Token"
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pd-pipeline">Default Pipeline</Label>
                    <Select>
                      <SelectTrigger id="pd-pipeline">
                        <SelectValue placeholder="Select pipeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales Pipeline</SelectItem>
                        <SelectItem value="leads">Leads Pipeline</SelectItem>
                      </SelectContent>
                    </Select>
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

export default CRMIntegration;