import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const FormRecommendations = ({ formId }: { formId: string }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('recommend-forms', {
        body: { formId }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      
      toast({
        title: "Recommendations Generated",
        description: "AI analyzed your forms and found similar ones",
      });
    } catch (error) {
      console.error('Recommendation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Smart Form Recommendations
        </CardTitle>
        <CardDescription>
          AI suggests similar forms based on your history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={generateRecommendations} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Get Recommendations"
          )}
        </Button>

        {recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recommended Forms:</p>
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <p className="font-medium">{rec.name || `Form ${rec.id.substring(0, 8)}`}</p>
                <p className="text-sm text-muted-foreground">
                  Similarity: {Math.round((rec.score || 0.8) * 100)}%
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};