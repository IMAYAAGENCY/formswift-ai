import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ToggleLeft, ToggleRight, Key, Copy, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { N8nWorkflowGuide } from "@/components/N8nWorkflowGuide";
import { AnimatedUploadDemo } from "@/components/AnimatedUploadDemo";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret_key: string | null;
}

interface ApiKey {
  id: string;
  key_name: string;
  api_key: string;
  key_prefix?: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  permissions: { read: boolean; write: boolean };
}

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: ["form.processed"] });
  const [newApiKey, setNewApiKey] = useState({ name: "", permissions: { read: true, write: false } });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWebhooks();
    fetchApiKeys();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_webhooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys((data || []).map(key => ({
        ...key,
        permissions: key.permissions as { read: boolean; write: boolean }
      })));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Validate webhook URL to prevent SSRF attacks
  const isValidWebhookUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      
      // Only allow HTTPS (or HTTP for localhost in development)
      const isSecure = parsed.protocol === 'https:';
      const isLocalDev = parsed.protocol === 'http:' && 
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');
      
      if (!isSecure && !isLocalDev) {
        toast({
          title: "Invalid URL",
          description: "Webhook URL must use HTTPS",
          variant: "destructive",
        });
        return false;
      }
      
      // Block internal/private IP ranges to prevent SSRF
      const hostname = parsed.hostname;
      const blockedPatterns = [
        /^localhost$/i,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^169\.254\./,
        /^0\./,
        /^::1$/,
        /^fe80:/i,
        /^fc00:/i,
      ];
      
      if (!isLocalDev && blockedPatterns.some(pattern => pattern.test(hostname))) {
        toast({
          title: "Invalid URL",
          description: "Webhook URL cannot point to internal/private networks",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch {
      toast({
        title: "Invalid URL",
        description: "Invalid webhook URL format",
        variant: "destructive",
      });
      return false;
    }
  };

  const createWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Validate webhook URL
    if (!isValidWebhookUrl(newWebhook.url)) {
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("custom_webhooks").insert({
        user_id: user.id,
        name: newWebhook.name,
        url: newWebhook.url,
        events: newWebhook.events,
        secret_key: crypto.randomUUID(),
      });

      if (error) throw error;

      toast({ title: "Success", description: "Webhook created successfully" });
      setNewWebhook({ name: "", url: "", events: ["form.processed"] });
      fetchWebhooks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hash API key for secure storage
  const hashApiKey = async (key: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const createApiKey = async () => {
    if (!newApiKey.name) {
      toast({
        title: "Error",
        description: "Please enter an API key name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate API key
      const apiKey = `fsk_${crypto.randomUUID().replace(/-/g, '')}`;
      
      // Hash the key before storing
      const hashedKey = await hashApiKey(apiKey);
      const keyPrefix = apiKey.substring(0, 12);

      const { error } = await supabase.from("api_keys").insert({
        user_id: user.id,
        key_name: newApiKey.name,
        api_key: hashedKey,
        key_prefix: keyPrefix,
        permissions: newApiKey.permissions,
      });

      if (error) throw error;

      // Copy to clipboard for user convenience
      await navigator.clipboard.writeText(apiKey);

      toast({ 
        title: "API Key Created", 
        description: `Key copied to clipboard: ${apiKey}. Save it now - it won't be shown again!`,
        duration: 15000,
      });
      setNewApiKey({ name: "", permissions: { read: true, write: false } });
      fetchApiKeys();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWebhook = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("custom_webhooks")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      fetchWebhooks();
      toast({ title: "Success", description: `Webhook ${!isActive ? "enabled" : "disabled"}` });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleApiKey = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("api_keys")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      fetchApiKeys();
      toast({ title: "Success", description: `API key ${!isActive ? "enabled" : "disabled"}` });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase.from("custom_webhooks").delete().eq("id", id);
      if (error) throw error;
      fetchWebhooks();
      toast({ title: "Success", description: "Webhook deleted" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase.from("api_keys").delete().eq("id", id);
      if (error) throw error;
      fetchApiKeys();
      toast({ title: "Success", description: "API key deleted" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Integrations & API</h1>
          <p className="text-muted-foreground">
            Connect FormSwift AI with your favorite tools and platforms
          </p>
        </div>

        <Tabs defaultValue="webhooks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="api">REST API</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="extensions">Extensions</TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Webhook</CardTitle>
                <CardDescription>
                  Get notified when forms are processed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Webhook Name</Label>
                  <Input
                    id="webhook-name"
                    placeholder="My Webhook"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-app.com/webhook"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  />
                </div>
                <Button onClick={createWebhook} disabled={isLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Webhook
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        <CardDescription className="mt-1">{webhook.url}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleWebhook(webhook.id, webhook.is_active)}
                        >
                          {webhook.is_active ? (
                            <ToggleRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteWebhook(webhook.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="secondary">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      {webhook.secret_key && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(webhook.secret_key!);
                            toast({ title: "Secret key copied" });
                          }}
                        >
                          <Copy className="mr-2 h-3 w-3" />
                          Copy Secret
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  Use our REST API to integrate FormSwift AI into your applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-semibold mb-2">Base URL:</h4>
                  <code className="text-sm">https://eiwvgbksjmceafnozldm.supabase.co/rest/v1/</code>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Available Endpoints:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge>GET</Badge>
                      <code>/forms</code>
                      <span className="text-muted-foreground">- List all forms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>POST</Badge>
                      <code>/forms</code>
                      <span className="text-muted-foreground">- Create new form</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>GET</Badge>
                      <code>/forms/:id</code>
                      <span className="text-muted-foreground">- Get form by ID</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <a href="https://supabase.com/docs/guides/api" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Full API Documentation
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create API Key</CardTitle>
                <CardDescription>
                  Generate API keys to authenticate your requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key-name">API Key Name</Label>
                  <Input
                    id="api-key-name"
                    placeholder="Production Key"
                    value={newApiKey.name}
                    onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newApiKey.permissions.write}
                    onCheckedChange={(checked) =>
                      setNewApiKey({ ...newApiKey, permissions: { ...newApiKey.permissions, write: checked }})
                    }
                  />
                  <Label>Allow write permissions</Label>
                </div>
                <Button onClick={createApiKey} disabled={isLoading}>
                  <Key className="mr-2 h-4 w-4" />
                  Generate API Key
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{apiKey.key_name}</CardTitle>
                        <CardDescription className="mt-1 font-mono text-xs">
                          {apiKey.key_prefix || apiKey.api_key.substring(0, 12)}...
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleApiKey(apiKey.id, apiKey.is_active)}
                        >
                          {apiKey.is_active ? (
                            <ToggleRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteApiKey(apiKey.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant={apiKey.permissions.read ? "default" : "secondary"}>
                          Read
                        </Badge>
                        <Badge variant={apiKey.permissions.write ? "default" : "secondary"}>
                          Write
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Created {new Date(apiKey.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="automation">
            <N8nWorkflowGuide />
          </TabsContent>

          <TabsContent value="extensions">
            <AnimatedUploadDemo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}