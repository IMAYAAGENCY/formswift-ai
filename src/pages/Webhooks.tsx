import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Webhook, Trash2, Copy, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret_key: string;
  created_at: string;
}

const Webhooks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[],
    is_active: true,
  });

  const availableEvents = [
    "form.created",
    "form.updated",
    "form.deleted",
    "form.submitted",
    "payment.success",
    "payment.failed",
  ];

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from("custom_webhooks")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load webhooks",
        variant: "destructive",
      });
      return;
    }

    setWebhooks(data || []);
  };

  const handleCreateWebhook = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (newWebhook.events.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one event",
        variant: "destructive",
      });
      return;
    }

    const secretKey = crypto.randomUUID();

    const { error } = await supabase.from("custom_webhooks").insert({
      ...newWebhook,
      user_id: userData.user.id,
      secret_key: secretKey,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Webhook created successfully!",
    });

    setIsCreateDialogOpen(false);
    loadWebhooks();
    setNewWebhook({
      name: "",
      url: "",
      events: [],
      is_active: true,
    });
  };

  const handleToggleWebhook = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("custom_webhooks")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update webhook",
        variant: "destructive",
      });
      return;
    }

    loadWebhooks();
  };

  const handleDeleteWebhook = async (id: string) => {
    const { error } = await supabase.from("custom_webhooks").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Webhook deleted",
    });

    loadWebhooks();
  };

  const copySecretKey = (secretKey: string) => {
    navigator.clipboard.writeText(secretKey);
    toast({
      title: "Copied!",
      description: "Secret key copied to clipboard",
    });
  };

  const toggleEvent = (event: string) => {
    setNewWebhook((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Custom Webhooks
            </h1>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Webhook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newWebhook.name}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, name: e.target.value })
                    }
                    placeholder="My Webhook"
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    value={newWebhook.url}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, url: e.target.value })
                    }
                    placeholder="https://example.com/webhook"
                  />
                </div>
                <div>
                  <Label className="mb-3 block">Events to Listen</Label>
                  <div className="space-y-2">
                    {availableEvents.map((event) => (
                      <div key={event} className="flex items-center gap-2">
                        <Checkbox
                          checked={newWebhook.events.includes(event)}
                          onCheckedChange={() => toggleEvent(event)}
                        />
                        <label className="text-sm">{event}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateWebhook} className="w-full">
                  Create Webhook
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Webhook className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{webhook.name}</h3>
                    <Badge variant={webhook.is_active ? "default" : "secondary"}>
                      {webhook.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{webhook.url}</p>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Events:</span>
                      <div className="flex gap-1 flex-wrap">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Secret Key:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {webhook.secret_key.substring(0, 20)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copySecretKey(webhook.secret_key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={webhook.is_active}
                    onCheckedChange={() =>
                      handleToggleWebhook(webhook.id, webhook.is_active)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {webhooks.length === 0 && (
            <Card className="p-12 text-center">
              <Webhook className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Webhooks Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create webhooks to receive real-time notifications about events
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Webhook
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Webhooks;