import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ReportData {
  date: string;
  views: number;
  submissions: number;
  interactions: number;
}

export const CustomReports = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedMetric, setSelectedMetric] = useState<string>("all");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [isLoading, setIsLoading] = useState(false);

  const loadReportData = async () => {
    setIsLoading(true);
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

    // Build date filter
    let analyticsQuery = supabase
      .from("form_analytics")
      .select("*")
      .in("form_id", formIds);

    if (dateFrom) {
      analyticsQuery = analyticsQuery.gte("created_at", dateFrom.toISOString());
    }
    if (dateTo) {
      analyticsQuery = analyticsQuery.lte("created_at", dateTo.toISOString());
    }

    const { data: analytics } = await analyticsQuery;

    // Get interaction counts
    let interactionsQuery = supabase
      .from("form_interactions")
      .select("form_id, timestamp")
      .in("form_id", formIds);

    if (dateFrom) {
      interactionsQuery = interactionsQuery.gte("timestamp", dateFrom.toISOString());
    }
    if (dateTo) {
      interactionsQuery = interactionsQuery.lte("timestamp", dateTo.toISOString());
    }

    const { data: interactions } = await interactionsQuery;

    // Aggregate data by date
    const dataByDate: { [key: string]: ReportData } = {};

    analytics?.forEach((item) => {
      const date = format(new Date(item.created_at), "yyyy-MM-dd");
      if (!dataByDate[date]) {
        dataByDate[date] = { date, views: 0, submissions: 0, interactions: 0 };
      }
      dataByDate[date].views += item.views;
      dataByDate[date].submissions += item.submissions;
    });

    interactions?.forEach((item) => {
      const date = format(new Date(item.timestamp), "yyyy-MM-dd");
      if (!dataByDate[date]) {
        dataByDate[date] = { date, views: 0, submissions: 0, interactions: 0 };
      }
      dataByDate[date].interactions++;
    });

    const processedData = Object.values(dataByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setReportData(processedData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadReportData();
  }, [dateFrom, dateTo]);

  const exportToCSV = () => {
    const headers = ["Date", "Views", "Submissions", "Interactions"];
    const csvContent = [
      headers.join(","),
      ...reportData.map((row) =>
        [row.date, row.views, row.submissions, row.interactions].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Custom Report Builder</h3>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : "To date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} />
            </PopoverContent>
          </Popover>

          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="views">Views Only</SelectItem>
              <SelectItem value="submissions">Submissions Only</SelectItem>
              <SelectItem value="interactions">Interactions Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={(v) => setChartType(v as "bar" | "line")}>
            <SelectTrigger>
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-6">
          <Button onClick={loadReportData} disabled={isLoading}>
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          <Button onClick={exportToCSV} variant="outline" disabled={reportData.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="text-center p-8">Loading report data...</div>
        ) : reportData.length === 0 ? (
          <div className="text-center p-8 bg-muted/50 rounded">
            <p className="text-muted-foreground">No data available for selected filters.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            {chartType === "bar" ? (
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {(selectedMetric === "all" || selectedMetric === "views") && (
                  <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" />
                )}
                {(selectedMetric === "all" || selectedMetric === "submissions") && (
                  <Bar dataKey="submissions" fill="hsl(var(--success))" name="Submissions" />
                )}
                {(selectedMetric === "all" || selectedMetric === "interactions") && (
                  <Bar dataKey="interactions" fill="hsl(var(--accent))" name="Interactions" />
                )}
              </BarChart>
            ) : (
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {(selectedMetric === "all" || selectedMetric === "views") && (
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" name="Views" />
                )}
                {(selectedMetric === "all" || selectedMetric === "submissions") && (
                  <Line type="monotone" dataKey="submissions" stroke="hsl(var(--success))" name="Submissions" />
                )}
                {(selectedMetric === "all" || selectedMetric === "interactions") && (
                  <Line type="monotone" dataKey="interactions" stroke="hsl(var(--accent))" name="Interactions" />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </Card>

      {/* Summary Stats */}
      {reportData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Views</div>
            <div className="text-2xl font-bold">
              {reportData.reduce((sum, d) => sum + d.views, 0)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Submissions</div>
            <div className="text-2xl font-bold">
              {reportData.reduce((sum, d) => sum + d.submissions, 0)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Interactions</div>
            <div className="text-2xl font-bold">
              {reportData.reduce((sum, d) => sum + d.interactions, 0)}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
