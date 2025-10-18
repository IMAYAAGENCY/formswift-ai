import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const FormScheduler = ({ formId }: { formId: string }) => {
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const { toast } = useToast();

  const scheduleForm = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('form_schedules')
      .insert({
        form_id: formId,
        user_id: user.id,
        scheduled_at: scheduledAt.toISOString(),
      });

    if (error) {
      toast({
        title: "Scheduling Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Form Scheduled",
      description: `Form will be submitted on ${scheduledAt.toLocaleString()}`,
    });
    
    setScheduledDate("");
    setScheduledTime("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Form Scheduling
        </CardTitle>
        <CardDescription>
          Auto-submit forms at specific times/dates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md"
            />
          </div>
        </div>
        <Button onClick={scheduleForm} className="w-full">
          Schedule Submission
        </Button>
      </CardContent>
    </Card>
  );
};