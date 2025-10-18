import { Navbar } from "@/components/Navbar";
import { TwoFactorAuth } from "@/components/TwoFactorAuth";
import { AuditLogs } from "@/components/AuditLogs";
import { DataEncryption } from "@/components/DataEncryption";
import { GDPRCompliance } from "@/components/GDPRCompliance";
import { RolePermissions } from "@/components/RolePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Shield, Ban, Clock, Lock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Security = () => {
  const { toast } = useToast();
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(false);
  const [ipBlockingEnabled, setIpBlockingEnabled] = useState(false);
  const [passwordProtection, setPasswordProtection] = useState(false);

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Security settings have been updated successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Security & Compliance
          </h1>
          <p className="text-xl text-muted-foreground">
            Enterprise-grade security features to protect your data
          </p>
        </div>

        <Tabs defaultValue="2fa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="2fa">2FA</TabsTrigger>
            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
            <TabsTrigger value="encryption">Encryption</TabsTrigger>
            <TabsTrigger value="gdpr">GDPR</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="captcha">CAPTCHA</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="2fa">
            <div className="max-w-2xl mx-auto">
              <TwoFactorAuth />
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="max-w-4xl mx-auto">
              <AuditLogs />
            </div>
          </TabsContent>

          <TabsContent value="encryption">
            <div className="max-w-2xl mx-auto">
              <DataEncryption />
            </div>
          </TabsContent>

          <TabsContent value="gdpr">
            <div className="max-w-2xl mx-auto">
              <GDPRCompliance />
            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <div className="max-w-4xl mx-auto">
              <RolePermissions />
            </div>
          </TabsContent>

          <TabsContent value="captcha">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    CAPTCHA Integration
                  </CardTitle>
                  <CardDescription>
                    Prevent spam submissions with CAPTCHA verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="captcha">Enable CAPTCHA</Label>
                    <Switch
                      id="captcha"
                      checked={captchaEnabled}
                      onCheckedChange={setCaptchaEnabled}
                    />
                  </div>
                  {captchaEnabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="provider">CAPTCHA Provider</Label>
                        <Select defaultValue="recaptcha">
                          <SelectTrigger id="provider">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recaptcha">Google reCAPTCHA</SelectItem>
                            <SelectItem value="hcaptcha">hCaptcha</SelectItem>
                            <SelectItem value="turnstile">Cloudflare Turnstile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="site-key">Site Key</Label>
                        <Input id="site-key" placeholder="Enter your CAPTCHA site key" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secret-key">Secret Key</Label>
                        <Input
                          id="secret-key"
                          type="password"
                          placeholder="Enter your CAPTCHA secret key"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Password Protection
                  </CardTitle>
                  <CardDescription>
                    Secure your forms with password protection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Enable Password Protection</Label>
                    <Switch
                      id="password"
                      checked={passwordProtection}
                      onCheckedChange={setPasswordProtection}
                    />
                  </div>
                  {passwordProtection && (
                    <div className="space-y-2">
                      <Label htmlFor="form-password">Form Password</Label>
                      <Input
                        id="form-password"
                        type="password"
                        placeholder="Set a password for this form"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Rate Limiting
                  </CardTitle>
                  <CardDescription>
                    Limit submission attempts to prevent abuse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rate-limit">Enable Rate Limiting</Label>
                    <Switch
                      id="rate-limit"
                      checked={rateLimitEnabled}
                      onCheckedChange={setRateLimitEnabled}
                    />
                  </div>
                  {rateLimitEnabled && (
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="max-attempts">Max Attempts</Label>
                        <Input
                          id="max-attempts"
                          type="number"
                          defaultValue="10"
                          placeholder="Maximum submission attempts"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time-window">Time Window (minutes)</Label>
                        <Input
                          id="time-window"
                          type="number"
                          defaultValue="60"
                          placeholder="Time window in minutes"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="h-5 w-5" />
                    IP Blocking
                  </CardTitle>
                  <CardDescription>
                    Block specific IP addresses from accessing your forms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ip-blocking">Enable IP Blocking</Label>
                    <Switch
                      id="ip-blocking"
                      checked={ipBlockingEnabled}
                      onCheckedChange={setIpBlockingEnabled}
                    />
                  </div>
                  {ipBlockingEnabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="blocked-ip">Block IP Address</Label>
                        <div className="flex gap-2">
                          <Input
                            id="blocked-ip"
                            placeholder="Enter IP address (e.g., 192.168.1.1)"
                          />
                          <Button>Block</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Blocked IPs</Label>
                        <div className="rounded-md border p-4 text-sm text-muted-foreground">
                          No IPs currently blocked
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button onClick={handleSaveSettings} className="w-full">
                Save Security Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Security;
