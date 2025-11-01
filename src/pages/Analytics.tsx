import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, TrendingUp, Eye, Send, Target, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ConversionFunnel } from "@/components/analytics/ConversionFunnel";
import { FormHeatmap } from "@/components/analytics/FormHeatmap";
import { CustomReports } from "@/components/analytics/CustomReports";
import { UserBehaviorAnalytics } from "@/components/analytics/UserBehaviorAnalytics";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";

interface FormAnalytics {
  form_id: string;
  form_name: string;
  views: number;
  submissions: number;
  completion_rate: number;
  avg_time_to_complete: number;
}

const Analytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<FormAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    
    // Set up realtime subscription
    const channel = supabase
      .channel("form_analytics_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "form_analytics",
        },
        () => {
          loadAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAnalytics = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: forms, error: formsError } = await supabase
      .from("forms")
      .select("id, form_name")
      .eq("user_id", userData.user.id);

    if (formsError) {
      toast({
        title: "Error",
        description: "Failed to load forms",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const analyticsData: FormAnalytics[] = [];

    for (const form of forms || []) {
      const { data, error } = await supabase
        .from("form_analytics")
        .select("*")
        .eq("form_id", form.id)
        .single();

      if (!error && data) {
        analyticsData.push({
          form_id: form.id,
          form_name: form.form_name,
          views: data.views,
          submissions: data.submissions,
          completion_rate: data.completion_rate,
          avg_time_to_complete: data.avg_time_to_complete,
        });
      } else {
        analyticsData.push({
          form_id: form.id,
          form_name: form.form_name,
          views: 0,
          submissions: 0,
          completion_rate: 0,
          avg_time_to_complete: 0,
        });
      }
    }

    setAnalytics(analyticsData);
    setIsLoading(false);
  };

  const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
  const totalSubmissions = analytics.reduce((sum, a) => sum + a.submissions, 0);
  const avgCompletionRate =
    analytics.length > 0
      ? analytics.reduce((sum, a) => sum + a.completion_rate, 0) / analytics.length
      : 0;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardSkeleton />
      </div>
    );
  }

  const exportToExcel = () => {
    const headers = ["Form Name", "Views", "Submissions", "Completion Rate (%)", "Avg Time (sec)"];
    const csvContent = [
      headers.join(","),
      ...analytics.map((item) =>
        [
          item.form_name,
          item.views,
          item.submissions,
          item.completion_rate.toFixed(1),
          item.avg_time_to_complete,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `form-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
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
              Business Intelligence Dashboard
            </h1>
          </div>
          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Custom Reports</TabsTrigger>
            <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-3xl font-bold">{totalViews}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-500" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                    <p className="text-3xl font-bold">{totalSubmissions}</p>
                  </div>
                  <Send className="h-8 w-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Completion</p>
                    <p className="text-3xl font-bold">{avgCompletionRate.toFixed(1)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Forms</p>
                    <p className="text-3xl font-bold">{analytics.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Views vs Submissions</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="form_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#0088FE" name="Views" />
                    <Bar dataKey="submissions" fill="#00C49F" name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Completion Rates</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics}
                      dataKey="completion_rate"
                      nameKey="form_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {analytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Forms Table */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Form Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Form Name</th>
                      <th className="text-right p-2">Views</th>
                      <th className="text-right p-2">Submissions</th>
                      <th className="text-right p-2">Completion Rate</th>
                      <th className="text-right p-2">Avg Time (sec)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.map((item) => (
                      <tr key={item.form_id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{item.form_name}</td>
                        <td className="text-right p-2">{item.views}</td>
                        <td className="text-right p-2">{item.submissions}</td>
                        <td className="text-right p-2">{item.completion_rate.toFixed(1)}%</td>
                        <td className="text-right p-2">{item.avg_time_to_complete}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Custom Reports Tab */}
          <TabsContent value="reports">
            <CustomReports />
          </TabsContent>

          {/* Conversion Funnel Tab */}
          <TabsContent value="funnel">
            <ConversionFunnel />
          </TabsContent>

          {/* Heatmap Tab */}
          <TabsContent value="heatmap">
            <FormHeatmap />
          </TabsContent>

          {/* User Behavior Tab */}
          <TabsContent value="behavior">
            <UserBehaviorAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;