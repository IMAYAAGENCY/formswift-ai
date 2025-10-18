import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LayersIcon, Save, Code, Smartphone, WifiOff } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const UserExperience = () => {
  const { toast } = useToast();
  const [multiPageEnabled, setMultiPageEnabled] = useState(false);
  const [saveResumeEnabled, setSaveResumeEnabled] = useState(false);
  const [embeddingEnabled, setEmbeddingEnabled] = useState(false);
  const [embedCode, setEmbedCode] = useState('');

  const generateEmbedCode = () => {
    const code = `<iframe 
  src="https://your-domain.com/forms/embed/YOUR_FORM_ID" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>`;
    setEmbedCode(code);
    toast({
      title: "Embed code generated",
      description: "Copy the code below to embed your form",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <LayersIcon className="h-8 w-8 text-primary" />
            User Experience
          </h1>
          <p className="text-xl text-muted-foreground">
            Enhance form completion with advanced UX features
          </p>
        </div>

        <Tabs defaultValue="multipage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="multipage">Multi-page</TabsTrigger>
            <TabsTrigger value="save">Save & Resume</TabsTrigger>
            <TabsTrigger value="embed">Embedding</TabsTrigger>
            <TabsTrigger value="mobile">Mobile App</TabsTrigger>
            <TabsTrigger value="offline">Offline Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="multipage">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayersIcon className="h-5 w-5" />
                    Multi-page Forms
                  </CardTitle>
                  <CardDescription>
                    Break long forms into manageable steps to improve completion rates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="multipage">Enable Multi-page Forms</Label>
                    <Switch
                      id="multipage"
                      checked={multiPageEnabled}
                      onCheckedChange={setMultiPageEnabled}
                    />
                  </div>
                  {multiPageEnabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label>Number of Pages</Label>
                        <Input type="number" defaultValue="3" min="2" max="10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Progress Indicator Style</Label>
                        <select className="w-full p-2 border rounded-md">
                          <option>Steps with numbers</option>
                          <option>Progress bar</option>
                          <option>Dots</option>
                          <option>Percentage</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Allow page skipping</Label>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Show page titles</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Page Configuration</CardTitle>
                  <CardDescription>
                    Configure individual pages and field distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((page) => (
                      <div key={page} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Page {page}</h4>
                          <Button variant="outline" size="sm">Edit Fields</Button>
                        </div>
                        <Input placeholder={`Page ${page} Title`} />
                        <Textarea placeholder={`Page ${page} Description`} rows={2} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="save">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Save & Resume
                  </CardTitle>
                  <CardDescription>
                    Let users save their progress and return later to complete forms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="save-resume">Enable Save & Resume</Label>
                    <Switch
                      id="save-resume"
                      checked={saveResumeEnabled}
                      onCheckedChange={setSaveResumeEnabled}
                    />
                  </div>
                  {saveResumeEnabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label>Auto-save Interval</Label>
                        <select className="w-full p-2 border rounded-md">
                          <option>Every 30 seconds</option>
                          <option>Every minute</option>
                          <option>Every 2 minutes</option>
                          <option>On field change</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Data Retention Period</Label>
                        <select className="w-full p-2 border rounded-md">
                          <option>7 days</option>
                          <option>14 days</option>
                          <option>30 days</option>
                          <option>90 days</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Require email to save</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Send reminder emails</Label>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label>Resume Link Format</Label>
                        <Input value="https://your-domain.com/forms/resume/[TOKEN]" readOnly />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Saved Progress</CardTitle>
                  <CardDescription>
                    View and manage saved form sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border p-4 text-sm text-muted-foreground text-center">
                    No saved sessions found
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="embed">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Form Embedding
                  </CardTitle>
                  <CardDescription>
                    Embed your forms on external websites
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="embedding">Enable Form Embedding</Label>
                    <Switch
                      id="embedding"
                      checked={embeddingEnabled}
                      onCheckedChange={setEmbeddingEnabled}
                    />
                  </div>
                  {embeddingEnabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label>Select Form to Embed</Label>
                        <select className="w-full p-2 border rounded-md">
                          <option>Contact Form</option>
                          <option>Registration Form</option>
                          <option>Survey Form</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Allowed Domains (one per line)</Label>
                        <Textarea
                          placeholder="example.com&#10;subdomain.example.com"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave empty to allow all domains (not recommended)
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Show FormSwift branding</Label>
                        <Switch defaultChecked />
                      </div>
                      <Button onClick={generateEmbedCode} className="w-full">
                        Generate Embed Code
                      </Button>
                      {embedCode && (
                        <div className="space-y-2">
                          <Label>Embed Code</Label>
                          <Textarea value={embedCode} readOnly rows={8} />
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              navigator.clipboard.writeText(embedCode);
                              toast({
                                title: "Copied!",
                                description: "Embed code copied to clipboard",
                              });
                            }}
                          >
                            Copy Code
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customization</CardTitle>
                  <CardDescription>
                    Customize the embedded form appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Custom CSS</Label>
                    <Textarea
                      placeholder=".form-container { max-width: 600px; }"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Custom JavaScript</Label>
                    <Textarea
                      placeholder="// Custom form behavior"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mobile">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Mobile App Options
                  </CardTitle>
                  <CardDescription>
                    Choose the best mobile experience for your users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg space-y-2">
                      <h4 className="font-semibold">Option 1: Installable Web App (PWA)</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                        <li>Can be installed directly from browser to home screen</li>
                        <li>Works on all phones (iPhone and Android)</li>
                        <li>No need to submit to app stores</li>
                        <li>Faster to set up and share</li>
                        <li>Works offline and loads quickly</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Limitations:</strong> Some advanced phone features may be limited
                      </p>
                      <Button className="w-full mt-3">Set Up PWA</Button>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                      <h4 className="font-semibold">Option 2: True Native Mobile App</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                        <li>Can be published to Apple App Store and Google Play Store</li>
                        <li>Full access to all phone features (camera, notifications, sensors)</li>
                        <li>Best performance and most professional feel</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Limitations:</strong> Requires technical setup, needs developer tools
                      </p>
                      <Button className="w-full mt-3" variant="outline">
                        Set Up Native App
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="offline">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WifiOff className="h-5 w-5" />
                    Offline Mode
                  </CardTitle>
                  <CardDescription>
                    Allow form submissions without internet connection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm">
                      <strong>Note:</strong> Offline mode requires either a PWA (Progressive Web App) 
                      or Native Mobile App setup. Please configure one of the mobile options first.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Offline Submissions</Label>
                      <Switch />
                    </div>
                    <div className="space-y-2">
                      <Label>Storage Limit</Label>
                      <select className="w-full p-2 border rounded-md">
                        <option>50 submissions</option>
                        <option>100 submissions</option>
                        <option>200 submissions</option>
                        <option>Unlimited</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sync Strategy</Label>
                      <select className="w-full p-2 border rounded-md">
                        <option>When internet is available</option>
                        <option>Manual sync only</option>
                        <option>On app open</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show offline indicator</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Sync Queue</CardTitle>
                  <CardDescription>
                    Submissions waiting to be synced to server
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border p-4 text-sm text-muted-foreground text-center">
                    No pending submissions
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Sync Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserExperience;
