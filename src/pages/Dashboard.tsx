import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { Upload, FileText, Crown, Calendar, TrendingUp, Download, Trash2, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [forms, setForms] = useState<Form[]>([]);
  const [userData, setUserData] = useState<{
    name: string;
    plan: string;
    formsUsed: number;
    formsLimit: number;
    expiryDate: string | null;
  } | null>(null);
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

      // Fetch user profile data
      const { data: profile, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
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

      setUserData({
        name: profile.name,
        plan: profile.plan_type,
        formsUsed: profile.used_forms,
        formsLimit: profile.form_limit,
        expiryDate: profile.expiry_date,
      });

      // Fetch user's forms
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!formsError && formsData) {
        setForms(formsData);
      }

      setIsLoading(false);
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

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploaded-forms')
        .getPublicUrl(fileName);

      // Create form record
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .insert({
          user_id: user.id,
          form_name: file.name,
          file_link: publicUrl,
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
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteForm = async (formId: string, fileName: string) => {
    try {
      // Extract file path from public URL
      const filePath = fileName.split('/uploaded-forms/')[1];
      
      // Delete from storage
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
        description: "Failed to delete form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
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
              <Button variant="hero" size="sm" className="mt-4 w-full" asChild>
                <Link to="/#pricing">Upgrade Plan</Link>
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
                        <p className="font-medium truncate">{form.form_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(form.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(form.file_link, '_blank')}
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
    </div>
  );
};

export default Dashboard;
