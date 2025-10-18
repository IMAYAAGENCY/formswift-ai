import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface BehaviorStats {
  totalSessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  interactionsByType: { type: string; count: number }[];
  deviceTypes: { device: string; count: number }[];
  topElements: { element: string; clicks: number }[];
}

export const UserBehaviorAnalytics = () => {
  const [stats, setStats] = useState<BehaviorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBehaviorData();
  }, []);

  const loadBehaviorData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // Get user's forms
    const { data: forms } = await supabase
      .from("forms")
      .select("id")
      .eq("user_id", userData.user.id);

    if (!forms || forms.length === 0) {
      setIsLoading(false);
      return;
    }

    const formIds = forms.map((f) => f.id);

    // Get all interactions
    const { data: interactions } = await supabase
      .from("form_interactions")
      .select("*")
      .in("form_id", formIds);

    if (!interactions) {
      setIsLoading(false);
      return;
    }

    // Calculate statistics
    const sessionIds = new Set(interactions.map((i) => i.session_id));
    const totalSessions = sessionIds.size;

    // Group by session to calculate durations
    const sessionDurations: number[] = [];
    sessionIds.forEach((sessionId) => {
      const sessionInteractions = interactions.filter((i) => i.session_id === sessionId);
      if (sessionInteractions.length > 1) {
        const timestamps = sessionInteractions.map((i) => new Date(i.timestamp).getTime());
        const duration = (Math.max(...timestamps) - Math.min(...timestamps)) / 1000; // seconds
        sessionDurations.push(duration);
      }
    });

    const avgSessionDuration =
      sessionDurations.length > 0
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
        : 0;

    // Calculate bounce rate (sessions with only 1 interaction)
    const bounces = Array.from(sessionIds).filter(
      (sessionId) => interactions.filter((i) => i.session_id === sessionId).length === 1
    ).length;
    const bounceRate = (bounces / totalSessions) * 100;

    // Interactions by type
    const interactionCounts: { [key: string]: number } = {};
    interactions.forEach((i) => {
      interactionCounts[i.interaction_type] = (interactionCounts[i.interaction_type] || 0) + 1;
    });
    const interactionsByType = Object.entries(interactionCounts).map(([type, count]) => ({
      type,
      count,
    }));

    // Top clicked elements
    const elementClicks: { [key: string]: number } = {};
    interactions
      .filter((i) => i.interaction_type === "click" && i.element_id)
      .forEach((i) => {
        elementClicks[i.element_id!] = (elementClicks[i.element_id!] || 0) + 1;
      });
    const topElements = Object.entries(elementClicks)
      .map(([element, clicks]) => ({ element, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // Device types from metadata
    const deviceCounts: { [key: string]: number } = {};
    interactions.forEach((i) => {
      const device = (i.metadata as any)?.device || "Unknown";
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    const deviceTypes = Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      count,
    }));

    setStats({
      totalSessions,
      avgSessionDuration,
      bounceRate,
      interactionsByType,
      deviceTypes,
      topElements,
    });
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading behavior analytics...</div>;
  }

  if (!stats) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No user behavior data available yet.</p>
      </Card>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B9D"];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <div className="text-sm text-muted-foreground">Total Sessions</div>
          <div className="text-3xl font-bold">{stats.totalSessions}</div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <div className="text-sm text-muted-foreground">Avg Session Duration</div>
          <div className="text-3xl font-bold">{stats.avgSessionDuration.toFixed(1)}s</div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <div className="text-sm text-muted-foreground">Bounce Rate</div>
          <div className="text-3xl font-bold">{stats.bounceRate.toFixed(1)}%</div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="interactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="elements">Top Elements</TabsTrigger>
        </TabsList>

        <TabsContent value="interactions">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Interaction Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.interactionsByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.interactionsByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Device Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.deviceTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="device" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="elements">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Most Clicked Elements</h3>
            <div className="space-y-2">
              {stats.topElements.map((item, index) => (
                <div
                  key={item.element}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                    <div className="font-medium">{item.element}</div>
                  </div>
                  <div className="text-sm font-medium">{item.clicks} clicks</div>
                </div>
              ))}
              {stats.topElements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No click data available yet
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
