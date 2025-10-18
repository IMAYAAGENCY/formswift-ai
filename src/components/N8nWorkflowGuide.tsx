import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Zap, Copy, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const N8nWorkflowGuide = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ n8n_webhook_url: webhookUrl })
        .eq("id", user.id);

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: "Success",
        description: "n8n webhook URL saved successfully",
      });
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

  const exampleWorkflow = {
    zapier: `1. Create a new Zap
2. Choose "Webhooks by Zapier" as trigger
3. Select "Catch Hook" 
4. Copy the webhook URL provided
5. Paste it in the field above
6. Add actions (Gmail, Sheets, etc.)`,
    make: `1. Create a new scenario
2. Add "Webhooks" module
3. Choose "Custom webhook"
4. Copy the webhook URL
5. Paste it in the field above
6. Add modules to process data`,
    n8n: `1. Create a new workflow
2. Add "Webhook" node
3. Set "HTTP Method" to POST
4. Copy the Production URL
5. Paste it in the field above
6. Add nodes to process form data`
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Integration
          </CardTitle>
          <CardDescription>
            Connect your forms to 5000+ apps with Zapier, Make, or n8n
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={webhookUrl}
                onChange={(e) => {
                  setWebhookUrl(e.target.value);
                  setIsSaved(false);
                }}
              />
              <Button onClick={handleSaveWebhook} disabled={isLoading || isSaved}>
                {isSaved ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="zapier" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="zapier">Zapier</TabsTrigger>
              <TabsTrigger value="make">Make</TabsTrigger>
              <TabsTrigger value="n8n">n8n</TabsTrigger>
            </TabsList>

            <TabsContent value="zapier" className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold mb-2">Setup Steps:</h4>
                <pre className="text-sm whitespace-pre-line">{exampleWorkflow.zapier}</pre>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://zapier.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Zapier
                </a>
              </Button>
            </TabsContent>

            <TabsContent value="make" className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold mb-2">Setup Steps:</h4>
                <pre className="text-sm whitespace-pre-line">{exampleWorkflow.make}</pre>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://make.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Make
                </a>
              </Button>
            </TabsContent>

            <TabsContent value="n8n" className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold mb-2">Setup Steps:</h4>
                <pre className="text-sm whitespace-pre-line">{exampleWorkflow.n8n}</pre>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://n8n.io" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open n8n
                </a>
              </Button>
            </TabsContent>
          </Tabs>

          <div className="rounded-lg border border-border bg-card p-4">
            <h4 className="font-semibold mb-2">Example Webhook Payload:</h4>
            <div className="relative">
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  "event": "form.processed",
  "formId": "uuid",
  "formData": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2025-10-18T12:00:00Z"
}`}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify({
                    event: "form.processed",
                    formId: "uuid",
                    formData: { name: "John Doe", email: "john@example.com" },
                    timestamp: new Date().toISOString()
                  }, null, 2));
                  toast({ title: "Copied to clipboard" });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};