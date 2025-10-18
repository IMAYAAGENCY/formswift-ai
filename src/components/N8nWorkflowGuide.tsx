import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Webhook, Mail, Database, Zap, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const N8nWorkflowGuide = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const webhookEvents = [
    {
      event: "form_uploaded",
      description: "Triggered when a user uploads a new form",
      color: "bg-blue-500",
      data: `{
  "event": "form_uploaded",
  "timestamp": "2025-01-18T12:30:45.000Z",
  "user_id": "uuid-here",
  "form_data": {
    "fileName": "admission_form.pdf",
    "fileType": "pdf",
    "fileSize": 245760
  }
}`
    },
    {
      event: "payment_verified",
      description: "Triggered when a payment is successfully verified",
      color: "bg-green-500",
      data: `{
  "event": "payment_verified",
  "timestamp": "2025-01-18T12:35:20.000Z",
  "user_id": "uuid-here",
  "payment_id": "pay_abc123",
  "order_id": "order_xyz789",
  "amount": 299,
  "plan": "Monthly"
}`
    },
    {
      event: "form_ai_processed",
      description: "Triggered when AI finishes processing a form",
      color: "bg-purple-500",
      data: `{
  "event": "form_ai_processed",
  "timestamp": "2025-01-18T12:40:15.000Z",
  "user_id": "uuid-here",
  "form_id": "form-uuid",
  "form_name": "admission_form.pdf",
  "analysis": "{\\"Student's Name\\": \\"John Smith\\", ...}"
}`
    }
  ];

  const workflowSteps = [
    {
      title: "Create Webhook Trigger",
      icon: Webhook,
      steps: [
        "Add a 'Webhook' node as your trigger",
        "Set HTTP Method to 'POST'",
        "Optional: Add a custom path like '/form-automation'",
        "Click 'Listen for Test Event' or activate workflow",
        "Copy the webhook URL"
      ]
    },
    {
      title: "Add Event Router",
      icon: Zap,
      steps: [
        "Add an 'IF' or 'Switch' node after webhook",
        "Check the 'event' field to route different events",
        "Create separate branches for each event type",
        "This allows different actions per event"
      ]
    },
    {
      title: "Process Form Upload",
      icon: Database,
      steps: [
        "Add actions for 'form_uploaded' event",
        "Example: Save to Google Sheets",
        "Example: Send Slack notification",
        "Example: Create CRM entry"
      ]
    },
    {
      title: "Handle Payments",
      icon: CheckCircle2,
      steps: [
        "Add actions for 'payment_verified' event",
        "Example: Send receipt email",
        "Example: Update accounting software",
        "Example: Trigger fulfillment"
      ]
    },
    {
      title: "Process AI Results",
      icon: Mail,
      steps: [
        "Add actions for 'form_ai_processed' event",
        "Example: Email filled form data",
        "Example: Update database records",
        "Example: Notify team members"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            n8n Workflow Setup Guide
          </CardTitle>
          <CardDescription>
            Complete step-by-step guide to connect your n8n workflow with this application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Webhook Events */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Webhook Events You'll Receive</h3>
            <div className="grid gap-4">
              {webhookEvents.map((event, idx) => (
                <Card key={idx} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${event.color}`} />
                        <CardTitle className="text-base">{event.event}</CardTitle>
                      </div>
                      <Badge variant="secondary">JSON</Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                        <code>{event.data}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(event.data, "Webhook data")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Setup Steps */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Building Your n8n Workflow</h3>
            <div className="space-y-4">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <Card key={idx} className="border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        Step {idx + 1}: {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2 text-sm text-muted-foreground">
                        {step.steps.map((s, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary font-semibold mt-0.5">{i + 1}.</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Example Workflow */}
          <Card className="border-2 border-accent/50 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-base">Example: Auto-Email on Form Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge>1</Badge>
                <span>Webhook receives 'form_ai_processed' event</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>2</Badge>
                <span>IF node checks: event === "form_ai_processed"</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>3</Badge>
                <span>Extract form_name and analysis from webhook data</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>4</Badge>
                <span>Gmail/Outlook node sends email with filled form details</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>5</Badge>
                <span>Optional: Save to Google Sheets for records</span>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
            <h4 className="font-semibold">💡 Pro Tips:</h4>
            <ul className="space-y-1 text-muted-foreground ml-4">
              <li>• Test your workflow using the "Test Workflow" button in n8n before going live</li>
              <li>• Add error handling nodes to catch and log failed automation attempts</li>
              <li>• Use the 'Set' node to transform webhook data before processing</li>
              <li>• Enable workflow execution logging to debug issues</li>
              <li>• Consider adding time delays for rate-limited APIs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
