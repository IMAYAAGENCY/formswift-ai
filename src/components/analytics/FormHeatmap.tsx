import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HeatmapData {
  element_id: string;
  element_type: string;
  clicks: number;
  position_x: number;
  position_y: number;
}

interface FormHeatmapProps {
  formId?: string;
}

export const FormHeatmap = ({ formId }: FormHeatmapProps) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>(formId || "");
  const [forms, setForms] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      loadHeatmapData();
    }
  }, [selectedForm]);

  const loadForms = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("forms")
      .select("id, form_name")
      .eq("user_id", userData.user.id);

    if (data) {
      setForms(data.map((f) => ({ id: f.id, name: f.form_name })));
      if (data.length > 0 && !selectedForm) {
        setSelectedForm(data[0].id);
      }
    }
  };

  const loadHeatmapData = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("form_interactions")
      .select("element_id, element_type, position_x, position_y")
      .eq("form_id", selectedForm)
      .eq("interaction_type", "click");

    if (error || !data) {
      setIsLoading(false);
      return;
    }

    // Aggregate clicks by element
    const aggregated: { [key: string]: HeatmapData } = {};
    data.forEach((interaction) => {
      const key = interaction.element_id || "unknown";
      if (!aggregated[key]) {
        aggregated[key] = {
          element_id: key,
          element_type: interaction.element_type || "unknown",
          clicks: 0,
          position_x: interaction.position_x || 0,
          position_y: interaction.position_y || 0,
        };
      }
      aggregated[key].clicks++;
    });

    setHeatmapData(Object.values(aggregated));
    setIsLoading(false);
  };

  const maxClicks = Math.max(...heatmapData.map((d) => d.clicks), 1);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Click Heatmap</h3>
          <p className="text-sm text-muted-foreground">See where users click most</p>
        </div>
        <Select value={selectedForm} onValueChange={setSelectedForm}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select form" />
          </SelectTrigger>
          <SelectContent>
            {forms.map((form) => (
              <SelectItem key={form.id} value={form.id}>
                {form.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading heatmap data...</div>
      ) : heatmapData.length === 0 ? (
        <div className="text-center p-8 bg-muted/50 rounded">
          <p className="text-muted-foreground">No click data available for this form yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-2">
            {heatmapData
              .sort((a, b) => b.clicks - a.clicks)
              .slice(0, 10)
              .map((item) => {
                const intensity = (item.clicks / maxClicks) * 100;
                return (
                  <div
                    key={item.element_id}
                    className="flex items-center justify-between p-3 rounded"
                    style={{
                      backgroundColor: `hsl(${220 - intensity}, 70%, ${50 + intensity / 4}%)`,
                      color: intensity > 50 ? "white" : "inherit",
                    }}
                  >
                    <div className="flex-1">
                      <span className="font-medium">{item.element_id}</span>
                      <span className="text-sm opacity-80 ml-2">({item.element_type})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.clicks} clicks</div>
                      <div className="text-xs opacity-80">
                        Position: ({item.position_x}, {item.position_y})
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm text-muted-foreground">Heat intensity</span>
            <div className="flex gap-2 items-center">
              <span className="text-xs">Low</span>
              <div className="flex">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4"
                    style={{
                      backgroundColor: `hsl(${220 - i * 10}, 70%, ${50 + i * 5}%)`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs">High</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
