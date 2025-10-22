import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Key, Copy, Plus, Trash2, Activity, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApiKey {
  id: string;
  key_name: string;
  api_key: string;
  key_prefix?: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

interface ApiUsage {
  total_requests: number;
  today_requests: number;
}

export default function APIMarketplace() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [usage, setUsage] = useState<ApiUsage>({ total_requests: 0, today_requests: 0 });
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadApiKeys();
    loadUsage();
  }, []);

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsage = async () => {
    try {
      const { data: keys } = await supabase.from("api_keys").select("id");
      if (!keys || keys.length === 0) return;

      const keyIds = keys.map(k => k.id);
      
      const { count: total } = await supabase
        .from("api_usage")
        .select("*", { count: "exact", head: true })
        .in("api_key_id", keyIds);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: today_count } = await supabase
        .from("api_usage")
        .select("*", { count: "exact", head: true })
        .in("api_key_id", keyIds)
        .gte("created_at", today.toISOString());

      setUsage({
        total_requests: total || 0,
        today_requests: today_count || 0,
      });
    } catch (error: any) {
      console.error("Error loading usage:", error);
    }
  };

  const generateApiKey = () => {
    return 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Hash API key for secure storage
  const hashApiKey = async (key: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a key name",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const apiKey = generateApiKey();
      const hashedKey = await hashApiKey(apiKey);
      const keyPrefix = apiKey.substring(0, 12);

      const { error } = await supabase.from("api_keys").insert([
        {
          user_id: user.id,
          key_name: newKeyName,
          api_key: hashedKey,
          key_prefix: keyPrefix,
          is_active: true,
        },
      ]);

      if (error) throw error;

      // Copy to clipboard automatically
      await copyToClipboard(apiKey);

      toast({
        title: "API Key Created",
        description: `Key copied to clipboard: ${apiKey}. Save it now - it won't be shown again!`,
        duration: 15000,
      });

      setNewKeyName("");
      await loadApiKeys();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      const { error } = await supabase.from("api_keys").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "API key deleted successfully",
      });

      await loadApiKeys();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">API Marketplace</h1>
          <p className="text-muted-foreground">
            Manage your API keys and sell API access to developers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usage.total_requests}</div>
              <p className="text-xs text-muted-foreground">All time API calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usage.today_requests}</div>
              <p className="text-xs text-muted-foreground">API calls in the last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="keys" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New API Key</CardTitle>
                <CardDescription>
                  Generate a new API key for accessing the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="key_name">Key Name</Label>
                    <Input
                      id="key_name"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Production API Key"
                      className="mt-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleCreateKey} disabled={creating}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Key
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your API Keys</CardTitle>
                <CardDescription>Manage and monitor your API keys</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No API keys yet. Create one to get started!
                    </p>
                  ) : (
                    apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Key className="h-4 w-4" />
                            <span className="font-medium">{key.key_name}</span>
                            <Badge variant={key.is_active ? "default" : "secondary"}>
                              {key.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {key.key_prefix || key.api_key.substring(0, 12)}...
                          </code>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {new Date(key.created_at).toLocaleDateString()}
                            {key.last_used_at && (
                              <> • Last used: {new Date(key.last_used_at).toLocaleDateString()}</>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(key.api_key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Documentation
                </CardTitle>
                <CardDescription>
                  Learn how to integrate with our API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Include your API key in the Authorization header:
                  </p>
                  <code className="block bg-muted p-3 rounded text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Endpoints</h3>
                  <div className="space-y-2">
                    <div className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>GET</Badge>
                        <code className="text-sm">/api/forms</code>
                      </div>
                      <p className="text-sm text-muted-foreground">List all forms</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>POST</Badge>
                        <code className="text-sm">/api/forms</code>
                      </div>
                      <p className="text-sm text-muted-foreground">Create a new form</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>GET</Badge>
                        <code className="text-sm">/api/forms/:id</code>
                      </div>
                      <p className="text-sm text-muted-foreground">Get form details</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Rate Limits</h3>
                  <p className="text-sm text-muted-foreground">
                    Free tier: 1,000 requests/day<br />
                    Pro tier: 10,000 requests/day<br />
                    Enterprise: Custom limits
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
