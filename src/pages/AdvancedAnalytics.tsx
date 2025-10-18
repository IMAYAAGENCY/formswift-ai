import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart3, Activity, TrendingUp, Brain, PieChart } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdvancedAnalytics = () => {
  const { toast } = useToast();
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    // Subscribe to realtime metrics
    const channel = supabase
      .channel('realtime-metrics')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_metrics'
        },
        (payload) => {
          console.log('New metric:', payload);
          setRealtimeData(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const analyzeSentiment = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: {
          submissionId: 'example-submission-id',
          formId: 'example-form-id',
          text: 'This is a sample text for sentiment analysis. I really love this product!'
        }
      });

      if (error) throw error;

      toast({
        title: "Sentiment Analysis Complete",
        description: `Sentiment: ${data.analysis.sentiment_label} (${(data.analysis.confidence * 100).toFixed(1)}% confidence)`,
      });
    } catch (error: any) {
      console.error('Sentiment analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generatePredictions = async () => {
    setIsPredicting(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-trends', {
        body: {
          formId: 'example-form-id',
          predictionType: 'submission_trend',
          historicalData: {
            submissions: [120, 135, 142, 158, 165, 180],
            dates: ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06']
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Predictions Generated",
        description: `Confidence: ${(data.prediction.confidence_score * 100).toFixed(1)}%`,
      });
    } catch (error: any) {
      console.error('Prediction error:', error);
      toast({
        title: "Prediction Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Advanced Analytics & Reporting
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time insights and AI-powered analytics
          </p>
        </div>

        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Real-time Dashboard
                  </CardTitle>
                  <CardDescription>
                    Live monitoring of form submissions and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Active Users</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{realtimeData.length}</div>
                        <p className="text-xs text-muted-foreground">Recent Events</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Forms Completed</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Live Activity Feed</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {realtimeData.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No recent activity
                        </p>
                      ) : (
                        realtimeData.map((event, i) => (
                          <div key={i} className="p-3 border rounded-lg text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">{event.metric_type}</span>
                              <span className="text-muted-foreground">
                                {new Date(event.recorded_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-muted-foreground">Value: {event.metric_value}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sentiment">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Sentiment Analysis
                  </CardTitle>
                  <CardDescription>
                    Analyze customer sentiment from form responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">0%</div>
                        <p className="text-xs text-muted-foreground">Positive</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-gray-600">0%</div>
                        <p className="text-xs text-muted-foreground">Neutral</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">0%</div>
                        <p className="text-xs text-muted-foreground">Negative</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Button 
                    onClick={analyzeSentiment} 
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? "Analyzing..." : "Run Sentiment Analysis"}
                  </Button>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm">
                      <strong>Note:</strong> Sentiment analysis uses AI to understand customer emotions and opinions from their form responses.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Predictive Analytics
                  </CardTitle>
                  <CardDescription>
                    AI-powered forecasting of submission trends
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Submission Trends</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Forecast future submission volumes based on historical data
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Next 7 Days</Button>
                        <Button variant="outline" size="sm">Next 30 Days</Button>
                        <Button variant="outline" size="sm">Next Quarter</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Completion Rate Forecast</h4>
                      <p className="text-sm text-muted-foreground">
                        Predict form completion rates based on current patterns
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Peak Time Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        Identify optimal times for form submissions
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={generatePredictions} 
                    disabled={isPredicting}
                    className="w-full"
                  >
                    {isPredicting ? "Generating..." : "Generate Predictions"}
                  </Button>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm">
                      <strong>Powered by AI:</strong> Predictions use machine learning to analyze patterns and forecast future trends with confidence scores.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Custom Dashboards
                  </CardTitle>
                  <CardDescription>
                    Create personalized analytics views
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-24 flex-col gap-2">
                      <LineChart className="h-6 w-6" />
                      <span className="text-sm">Line Chart</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2">
                      <BarChart3 className="h-6 w-6" />
                      <span className="text-sm">Bar Chart</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2">
                      <PieChart className="h-6 w-6" />
                      <span className="text-sm">Pie Chart</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2">
                      <Activity className="h-6 w-6" />
                      <span className="text-sm">Metrics</span>
                    </Button>
                  </div>

                  <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    <p className="mb-4">No custom dashboards yet</p>
                    <Button>Create Your First Dashboard</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
