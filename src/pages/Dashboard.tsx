import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { ChatWidget } from "@/components/ChatWidget";
import { FormAssistantModal } from "@/components/FormAssistantModal";
import { AnimatedUploadDemo } from "@/components/AnimatedUploadDemo";
import { AnimatedUpgradeDemo } from "@/components/AnimatedUpgradeDemo";
import { N8nWorkflowGuide } from "@/components/N8nWorkflowGuide";
import { AffiliateSection } from "@/components/AffiliateSection";
import { Upload, FileText, Crown, Calendar, TrendingUp, Download, Trash2, Loader2, Sparkles, Webhook, Save, Bot, Video, BarChart3, Users, Layers, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { UpgradePlanModal } from "@/components/UpgradePlanModal";

interface Form {
  id: string;
  form_name: string;
  file_link: string;
  created_at: string;
  ai_filled_link: string | null;
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingFormId, setProcessingFormId] = useState<string | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [userData, setUserData] = useState<{
    name: string;
    plan: string;
    formsUsed: number;
    formsLimit: number;
    expiryDate: string | null;
    n8nWebhookUrl: string | null;
    referralCode: string | null;
    referralConversions: number;
    freePlansEarned: number;
  } | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [selectedFormForAssistant, setSelectedFormForAssistant] = useState<{id: string; name: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);
      await fetchUserData(session.user.id);
    };

    checkAuthAndFetchData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const fetchUserData = async (userId: string) => {
    // Fetch user profile data
    const { data: profile, error } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error('Profile load error:', error);
      toast({
        title: "Unable to load profile",
        description: "Please try refreshing the page. If the issue persists, contact support.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!profile) {
      toast({
        title: "Profile not found",
        description: "Please try signing up again",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      navigate("/auth");
      return;
    }

    // Generate referral code if user doesn't have one
    let referralCode = profile.referral_code;
    if (!referralCode) {
      referralCode = `REF${userId.substring(0, 8).toUpperCase()}`;
      await supabase
        .from('profiles')
        .update({ referral_code: referralCode })
        .eq('id', userId);
    }

    setUserData({
      name: profile.name,
      plan: profile.plan_type,
      formsUsed: profile.used_forms,
      formsLimit: profile.form_limit,
      expiryDate: profile.expiry_date,
      n8nWebhookUrl: profile.n8n_webhook_url,
      referralCode: referralCode,
      referralConversions: profile.referral_conversions || 0,
      freePlansEarned: profile.free_plans_earned || 0,
    });
    
    setWebhookUrl(profile.n8n_webhook_url || "");

    // Fetch user's forms
    const { data: formsData, error: formsError } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!formsError && formsData) {
      setForms(formsData);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--gradient-subtle)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const progressPercentage = (userData.formsUsed / userData.formsLimit) * 100;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPG, PNG, DOC, or DOCX file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 20MB",
        variant: "destructive",
      });
      return;
    }

    // Check if user has reached form limit
    if (userData.formsUsed >= userData.formsLimit) {
      toast({
        title: "Form limit reached",
        description: "Please upgrade your plan to upload more forms",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('uploaded-forms')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Create form record with file path (not public URL for private bucket)
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .insert({
          user_id: user.id,
          form_name: file.name,
          file_link: fileName,
        })
        .select()
        .single();

      if (formError) throw formError;

      setUploadProgress(100);

      // Update local state
      setForms(prev => [formData, ...prev]);
      setUserData(prev => prev ? { ...prev, formsUsed: prev.formsUsed + 1 } : null);

      toast({
        title: "Upload successful",
        description: "Your form has been uploaded and is ready for processing",
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "We couldn't upload your file. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteForm = async (formId: string, filePath: string) => {
    try {
      // Delete from storage (filePath is already the storage path)
      const { error: storageError } = await supabase.storage
        .from('uploaded-forms')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId);

      if (dbError) throw dbError;

      // Update local state
      setForms(prev => prev.filter(f => f.id !== formId));
      setUserData(prev => prev ? { ...prev, formsUsed: prev.formsUsed - 1 } : null);

      toast({
        title: "Form deleted",
        description: "The form has been removed from your account",
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "We couldn't delete your form. Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    }
  };

  const handleProcessForm = async (formId: string) => {
    setProcessingFormId(formId);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-process-form', {
        body: { formId }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Update local state with the analysis
      setForms(prev => prev.map(f => 
        f.id === formId ? { ...f, ai_filled_link: data.analysis } : f
      ));

      toast({
        title: "Processing complete! ✨",
        description: "Your form has been analyzed by AI",
      });
    } catch (error: any) {
      console.error('Processing error:', error);
      
      // Provide user-friendly error messages
      let errorDescription = "We couldn't process your form. Please try again.";
      if (error.message?.includes('Rate limit')) {
        errorDescription = "You've reached the processing limit. Please wait a moment before trying again.";
      } else if (error.message?.includes('credits')) {
        errorDescription = "AI processing is temporarily unavailable. Please try again later.";
      }
      
      toast({
        title: "Processing failed",
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setProcessingFormId(null);
    }
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim() && !userData?.n8nWebhookUrl) return;

    setIsSavingWebhook(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({ n8n_webhook_url: webhookUrl.trim() || null })
        .eq('id', user.id);

      if (error) throw error;

      setUserData(prev => prev ? { ...prev, n8nWebhookUrl: webhookUrl.trim() || null } : null);

      toast({
        title: "Webhook saved",
        description: webhookUrl.trim() ? "n8n webhook URL has been configured" : "n8n webhook URL has been removed",
      });
    } catch (error: any) {
      console.error('Save webhook error:', error);
      toast({
        title: "Save failed",
        description: "Could not save webhook URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingWebhook(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Quick Access Features */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/ai-assistant")}>
            <Bot className="h-6 w-6" />
            <span className="text-sm">AI Assistant</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/analytics")}>
            <BarChart3 className="h-6 w-6" />
            <span className="text-sm">Analytics</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/templates")}>
            <Layers className="h-6 w-6" />
            <span className="text-sm">Templates</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/teams")}>
            <Users className="h-6 w-6" />
            <span className="text-sm">Teams</span>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/webhooks")}>
            <Zap className="h-6 w-6" />
            <span className="text-sm">Webhooks</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 hover:border-primary/50"
            onClick={() => navigate("/smart-forms")}
          >
            <Sparkles className="h-6 w-6" />
            <span className="text-sm font-semibold">Smart Forms</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30 hover:border-accent/50"
            onClick={() => navigate("/ai-automation")}
          >
            <span className="text-2xl">🤖</span>
            <span className="text-sm font-semibold">AI Automation</span>
          </Button>
        </div>

        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {userData.name}! 👋</h1>
            <p className="text-muted-foreground">
              You have {userData.formsLimit - userData.formsUsed} free forms remaining
            </p>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/auth");
            }}
          >
            Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.plan}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {userData.plan === "Free" ? "2 forms included" : "Active subscription"}
                </p>
                <Button 
                  variant="hero" 
                  size="sm" 
                  className="mt-4 w-full"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  Upgrade Plan
                </Button>
              </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Forms Used</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData.formsUsed} / {userData.formsLimit}
              </div>
              <Progress value={progressPercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {userData.formsLimit - userData.formsUsed} forms remaining
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Plan Expiry</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData.expiryDate || "Never"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userData.plan === "Free" ? "Free plan doesn't expire" : "Renews automatically"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="border-2 border-dashed border-primary/50 bg-card/50 mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-to-r from-primary to-accent p-4 rounded-full w-fit mb-4">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Upload Your Form</CardTitle>
            <CardDescription className="text-base">
              Drop your PDF, Image, DOC, or paste an online form link
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-full max-w-md space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading || userData.formsUsed >= userData.formsLimit}
              />
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || userData.formsUsed >= userData.formsLimit}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Choose File to Upload
                  </>
                )}
              </Button>
              {isUploading && (
                <Progress value={uploadProgress} className="w-full" />
              )}
              <p className="text-center text-sm text-muted-foreground">
                Supported: PDF, JPG, PNG, DOC, DOCX (Max 20MB)
              </p>
              {userData.formsUsed >= userData.formsLimit && (
                <p className="text-center text-sm text-destructive font-medium">
                  Form limit reached. Please upgrade to continue.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo Test Section */}
        <Card className="mb-8 border-2 border-accent/50 bg-gradient-to-br from-accent/5 to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <CardTitle>Test AI Form Filling</CardTitle>
            </div>
            <CardDescription>
              Try out the AI form filling feature with a demo. Upload a blank form and watch AI fill it with realistic data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-card p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  How to Test:
                </h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Upload a blank form (admission form, application form, registration form, etc.)</li>
                  <li>Click the "Process" button on your uploaded form</li>
                  <li>Wait a few seconds while AI analyzes and fills the form</li>
                  <li>View the AI-generated filled data in the form details</li>
                  <li>Use "Ask AI" to get specific information about any form field</li>
                </ol>
              </div>
              <div className="flex items-center gap-3 bg-primary/10 p-4 rounded-lg">
                <Sparkles className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Powered by Advanced AI</p>
                  <p className="text-muted-foreground">Our AI recognizes form fields and generates realistic, contextually appropriate data for each field automatically.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animated Demo Section */}
        <Card className="mb-8 border-2 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <CardTitle>Interactive Demos</CardTitle>
            </div>
            <CardDescription>
              Watch these animated guides to learn how to use the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* How to Upload Form Demo */}
              <div className="space-y-3">
                <AnimatedUploadDemo />
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" />
                    Upload & Process Forms:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                    <li>Choose form files (PDF, JPG, PNG, DOC)</li>
                    <li>Upload and wait for processing</li>
                    <li>AI automatically fills the form</li>
                    <li>View and manage filled forms</li>
                  </ul>
                </div>
              </div>

              {/* How to Upgrade Plan Demo */}
              <div className="space-y-3">
                <AnimatedUpgradeDemo />
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Crown className="h-4 w-4 text-accent" />
                    Upgrade Your Plan:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                    <li>Select the plan that fits your needs</li>
                    <li>Secure payment via Razorpay</li>
                    <li>Instant plan activation</li>
                    <li>Unlimited forms & priority support</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Quick Tips:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Free plan includes 2 forms - perfect for trying out the service</li>
                    <li>• Pro and Premium plans offer unlimited forms and priority processing</li>
                    <li>• All plans include AI-powered form filling and customer support</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* n8n Integration Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              <CardTitle>n8n Integration</CardTitle>
            </div>
            <CardDescription>
              Connect your n8n workflow to receive webhooks on form uploads, payments, and AI processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">n8n Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSaveWebhook}
                disabled={isSavingWebhook}
                size="sm"
              >
                {isSavingWebhook ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Webhook
                  </>
                )}
              </Button>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Webhook events:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>form_uploaded - Triggered when a form is uploaded</li>
                  <li>payment_verified - Triggered when payment is verified</li>
                  <li>form_ai_processed - Triggered when AI processes a form</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* n8n Workflow Setup Guide */}
        {userData.n8nWebhookUrl && (
          <N8nWorkflowGuide />
        )}

        {/* Affiliate & Referral Section */}
        {userId && userData.referralCode && (
          <AffiliateSection
            userId={userId}
            referralCode={userData.referralCode}
            referralConversions={userData.referralConversions}
            freePlansEarned={userData.freePlansEarned}
          />
        )}

        {/* Recent Forms Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Forms</CardTitle>
                <CardDescription>Your form filling history</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {forms.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No forms uploaded yet</p>
                <p className="text-sm mt-2">Upload your first form to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {forms.map((form) => (
                  <div 
                    key={form.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{form.form_name}</p>
                          {form.ai_filled_link && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Processed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(form.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {form.ai_filled_link && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {form.ai_filled_link.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedFormForAssistant({id: form.id, name: form.form_name})}
                      >
                        <Bot className="h-4 w-4 mr-1" />
                        Ask AI
                      </Button>
                      {!form.ai_filled_link && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleProcessForm(form.id)}
                          disabled={processingFormId === form.id}
                        >
                          {processingFormId === form.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-1" />
                              Process
                            </>
                          )}
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={async () => {
                          const { data } = await supabase.storage
                            .from('uploaded-forms')
                            .createSignedUrl(form.file_link, 3600);
                          if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteForm(form.id, form.file_link)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UpgradePlanModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        onUpgradeSuccess={async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) await fetchUserData(user.id);
        }}
      />

      <FormAssistantModal
        open={!!selectedFormForAssistant}
        onOpenChange={(open) => !open && setSelectedFormForAssistant(null)}
        formId={selectedFormForAssistant?.id || ""}
        formName={selectedFormForAssistant?.name || ""}
      />

      <ChatWidget />
    </div>
  );
};

export default Dashboard;
