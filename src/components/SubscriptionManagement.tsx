import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Crown, Calendar, TrendingUp, AlertCircle, Check, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionManagementProps {
  userData: {
    plan: string;
    formsUsed: number;
    formsLimit: number;
    expiryDate: string | null;
    referralConversions: number;
    freePlansEarned: number;
  };
  userId: string;
  onPlanCancelled?: () => void;
}

const planDetails: Record<string, { icon: any; color: string; features: string[] }> = {
  Free: {
    icon: Sparkles,
    color: "text-muted-foreground",
    features: ["10 forms per month", "Basic features", "Community support"],
  },
  Weekly: {
    icon: Zap,
    color: "text-primary",
    features: ["50 forms per week", "Advanced features", "Priority support"],
  },
  Monthly: {
    icon: Crown,
    color: "text-accent",
    features: ["200 forms per month", "All features", "Dedicated support"],
  },
  Quarterly: {
    icon: Crown,
    color: "text-accent",
    features: ["600 forms per quarter", "All features", "SLA guarantee"],
  },
  Yearly: {
    icon: Crown,
    color: "text-accent",
    features: ["Unlimited forms", "All features", "Priority support"],
  },
};

export const SubscriptionManagement = ({ userData, userId, onPlanCancelled }: SubscriptionManagementProps) => {
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);
  
  const planInfo = planDetails[userData.plan] || planDetails.Free;
  const PlanIcon = planInfo.icon;
  const usagePercentage = (userData.formsUsed / userData.formsLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isPaidPlan = userData.plan !== "Free";

  // Calculate days until expiry
  const daysUntilExpiry = userData.expiryDate 
    ? Math.ceil((new Date(userData.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      // Update user profile to free plan
      const { error } = await supabase
        .from("profiles")
        .update({
          plan_type: "Free",
          form_limit: 10,
          expiry_date: null,
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Subscription cancelled successfully");
      onPlanCancelled?.();
    } catch (error: any) {
      console.error("Cancel subscription error:", error);
      toast.error("Failed to cancel subscription. Please contact support.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card className="border-2 border-border hover:border-primary/50 transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full bg-primary/10 ${planInfo.color}`}>
                <PlanIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">{userData.plan} Plan</CardTitle>
                <CardDescription>Your current subscription</CardDescription>
              </div>
            </div>
            {isPaidPlan && (
              <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                Active
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Features */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Plan Features</h4>
            <ul className="space-y-2">
              {planInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Forms Usage</h4>
              <span className="text-sm font-medium">
                {userData.formsUsed} / {userData.formsLimit === 999999 ? "Unlimited" : userData.formsLimit}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            {isNearLimit && userData.formsLimit !== 999999 && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>You're running low on forms. Consider upgrading!</span>
              </div>
            )}
          </div>

          {/* Expiry Date */}
          {userData.expiryDate && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Next Billing Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(userData.expiryDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {daysUntilExpiry && ` (${daysUntilExpiry} days)`}
                </p>
              </div>
            </div>
          )}

          {/* Referral Stats */}
          {userData.referralConversions > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <TrendingUp className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium">Referral Rewards</p>
                <p className="text-sm text-muted-foreground">
                  {userData.referralConversions} referrals · {userData.freePlansEarned} free plans earned
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          {userData.plan === "Free" ? (
            <Button
              className="w-full"
              variant="premium"
              size="lg"
              onClick={() => navigate("/pricing")}
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          ) : (
            <>
              <Button
                className="flex-1"
                variant="outline"
                size="lg"
                onClick={() => navigate("/pricing")}
              >
                Change Plan
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="lg" className="flex-1">
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your {userData.plan} subscription? You'll be downgraded to the Free plan immediately and lose access to premium features.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Usage Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Forms Used</CardDescription>
            <CardTitle className="text-3xl">{userData.formsUsed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {userData.formsLimit === 999999 
                ? "Unlimited remaining" 
                : `${userData.formsLimit - userData.formsUsed} remaining`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Usage Rate</CardDescription>
            <CardTitle className="text-3xl">
              {userData.formsLimit === 999999 ? "—" : `${Math.round(usagePercentage)}%`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {usagePercentage < 50 
                ? "Plenty of space left" 
                : usagePercentage < 80 
                ? "Moderate usage" 
                : "Consider upgrading"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Plan Status</CardDescription>
            <CardTitle className="text-3xl">
              {isPaidPlan ? (
                <Badge className="text-lg px-3 py-1 bg-success text-success-foreground">Active</Badge>
              ) : (
                <Badge className="text-lg px-3 py-1" variant="outline">Free</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {isPaidPlan && daysUntilExpiry 
                ? `Renews in ${daysUntilExpiry} days` 
                : "No expiry date"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
