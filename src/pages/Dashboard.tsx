import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { Upload, FileText, Crown, Calendar, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{
    name: string;
    plan: string;
    formsUsed: number;
    formsLimit: number;
    expiryDate: string | null;
  } | null>(null);
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
              <Button variant="hero" size="lg" className="w-full">
                <Upload className="mr-2 h-5 w-5" />
                Choose File to Upload
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Supported: PDF, JPG, PNG, DOC, DOCX, or Online Form URL
              </p>
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
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No forms filled yet</p>
              <p className="text-sm mt-2">Upload your first form to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
