import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift, Users, TrendingUp, DollarSign, Share2 } from "lucide-react";

interface AffiliateSectionProps {
  userId: string;
  referralCode: string;
  referralConversions: number;
  freePlansEarned: number;
}

interface AffiliateStats {
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  isAffiliate: boolean;
  commissionRate: number;
}

export const AffiliateSection = ({ 
  userId, 
  referralCode, 
  referralConversions,
  freePlansEarned 
}: AffiliateSectionProps) => {
  const { toast } = useToast();
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null);
  const [conversions, setConversions] = useState<any[]>([]);
  
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
  const progressToFreePlan = referralConversions % 3;
  const nextFreePlanIn = 3 - progressToFreePlan;

  useEffect(() => {
    fetchAffiliateData();
  }, [userId]);

  const fetchAffiliateData = async () => {
    // Fetch affiliate link data
    const { data: affiliateData } = await supabase
      .from('affiliate_links')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (affiliateData) {
      setAffiliateStats({
        totalClicks: affiliateData.total_clicks,
        totalConversions: affiliateData.total_conversions,
        totalEarnings: affiliateData.total_earnings,
        isAffiliate: affiliateData.is_affiliate,
        commissionRate: affiliateData.commission_rate,
      });
    }

    // Fetch recent conversions
    const { data: conversionsData } = await supabase
      .from('referral_conversions')
      .select('*')
      .eq('referrer_user_id', userId)
      .order('converted_at', { ascending: false })
      .limit(5);

    if (conversionsData) {
      setConversions(conversionsData);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const becomeAffiliate = async () => {
    // Create or update affiliate link
    const { error } = await supabase
      .from('affiliate_links')
      .upsert({
        user_id: userId,
        referral_code: referralCode,
        is_affiliate: true,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to activate affiliate status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "You're now an affiliate partner",
      });
      fetchAffiliateData();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Referral Program
          </CardTitle>
          <CardDescription>
            Share with friends and earn free plans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between gap-2 mb-2">
              <code className="text-sm break-all flex-1">{referralLink}</code>
              <Button size="sm" variant="outline" onClick={copyReferralLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Conversions</span>
              </div>
              <p className="text-2xl font-bold">{referralConversions}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {nextFreePlanIn} more for free plan
              </p>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Free Plans</span>
              </div>
              <p className="text-2xl font-bold">{freePlansEarned}</p>
              <p className="text-xs text-muted-foreground mt-1">Plans earned</p>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Progress</span>
              </div>
              <p className="text-2xl font-bold">{progressToFreePlan}/3</p>
              <p className="text-xs text-muted-foreground mt-1">To next reward</p>
            </div>
          </div>

          <div className="bg-accent/50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">How it works:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Share your unique referral link</li>
              <li>• When 3 friends purchase a plan, you get 1 free plan</li>
              <li>• Free plans match the tier of purchases</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Affiliate Program
            {affiliateStats?.isAffiliate && (
              <Badge variant="default" className="ml-2">Active</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Promote our platform and earn 10% commission
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!affiliateStats?.isAffiliate ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Become an Affiliate Partner</h3>
                <ul className="text-sm space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-primary mt-0.5" />
                    <span>Earn 10% commission on every sale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                    <span>Track your earnings in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-primary mt-0.5" />
                    <span>Perfect for content creators and influencers</span>
                  </li>
                </ul>
                <Button onClick={becomeAffiliate} variant="hero" className="w-full">
                  Activate Affiliate Status
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Clicks</span>
                  </div>
                  <p className="text-2xl font-bold">{affiliateStats.totalClicks}</p>
                </div>

                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Sales</span>
                  </div>
                  <p className="text-2xl font-bold">{affiliateStats.totalConversions}</p>
                </div>

                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Earnings</span>
                  </div>
                  <p className="text-2xl font-bold">₹{affiliateStats.totalEarnings.toFixed(2)}</p>
                </div>
              </div>

              {conversions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Recent Conversions</h4>
                  <div className="space-y-2">
                    {conversions.map((conversion) => (
                      <div key={conversion.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">₹{conversion.payment_amount}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(conversion.converted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          +₹{conversion.commission_amount?.toFixed(2) || '0.00'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};