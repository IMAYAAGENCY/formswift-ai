import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";

export const PredictiveAutofill = () => {
  const [fields, setFields] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleFieldChange = async (fieldName: string, value: string) => {
    setFields(prev => ({ ...prev, [fieldName]: value }));

    if (value.length >= 2) {
      try {
        const { data, error } = await supabase.functions.invoke('predictive-autofill', {
          body: {
            fieldName,
            partialValue: value,
            context: fields
          }
        });

        if (error) throw error;

        setPredictions(prev => ({
          ...prev,
          [fieldName]: data.prediction
        }));
      } catch (error) {
        console.error('Prediction error:', error);
      }
    }
  };

  const applyPrediction = (fieldName: string) => {
    setFields(prev => ({ ...prev, [fieldName]: predictions[fieldName] }));
    toast({
      title: "Prediction Applied",
      description: "AI suggestion has been applied",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Predictive Auto-fill
        </CardTitle>
        <CardDescription>
          AI predicts what you'll fill before you type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(fields).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <Label className="capitalize">{key}</Label>
            <div className="relative">
              <Input
                value={value}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                placeholder={`Enter ${key}...`}
              />
              {predictions[key] && predictions[key] !== value && (
                <div className="mt-1 p-2 bg-accent rounded-md text-sm flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Suggestion: <strong>{predictions[key]}</strong>
                  </span>
                  <button
                    onClick={() => applyPrediction(key)}
                    className="text-primary hover:underline text-xs"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};