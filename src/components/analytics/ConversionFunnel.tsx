import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FunnelChart, Funnel, LabelList, ResponsiveContainer, Tooltip } from "recharts";

interface FunnelData {
  name: string;
  value: number;
  fill: string;
}

interface ConversionFunnelProps {
  formId?: string;
}

export const ConversionFunnel = ({ formId }: ConversionFunnelProps) => {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFunnelData();
  }, [formId]);

  const loadFunnelData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // Build query
    let query = supabase
      .from("form_funnel_steps")
      .select("step_name, completed, form_id, forms!inner(user_id)")
      .eq("forms.user_id", userData.user.id);

    if (formId) {
      query = query.eq("form_id", formId);
    }

    const { data, error } = await query;

    if (error || !data) {
      setIsLoading(false);
      return;
    }

    // Process funnel data
    const stepCounts: { [key: string]: { total: number; completed: number } } = {};
    
    data.forEach((step) => {
      if (!stepCounts[step.step_name]) {
        stepCounts[step.step_name] = { total: 0, completed: 0 };
      }
      stepCounts[step.step_name].total++;
      if (step.completed) {
        stepCounts[step.step_name].completed++;
      }
    });

    const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
    const processed: FunnelData[] = Object.entries(stepCounts).map(([name, counts], index) => ({
      name,
      value: counts.completed,
      fill: colors[index % colors.length],
    }));

    setFunnelData(processed);
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading funnel data...</div>;
  }

  if (funnelData.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No funnel data available yet. Track form steps to see conversion funnel.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Track where users drop off in your forms
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <FunnelChart>
          <Tooltip />
          <Funnel dataKey="value" data={funnelData} isAnimationActive>
            <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
      
      {/* Conversion rates */}
      <div className="mt-6 space-y-2">
        <h4 className="font-medium">Step-by-Step Conversion</h4>
        {funnelData.map((step, index) => {
          const prevValue = index > 0 ? funnelData[index - 1].value : step.value;
          const conversionRate = prevValue > 0 ? ((step.value / prevValue) * 100).toFixed(1) : 0;
          return (
            <div key={step.name} className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm">{step.name}</span>
              <span className="text-sm font-medium">{step.value} users ({conversionRate}%)</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
