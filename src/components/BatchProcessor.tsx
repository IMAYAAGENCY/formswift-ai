import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

export const BatchProcessor = () => {
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setForms(data);
  };

  const toggleForm = (formId: string) => {
    setSelectedForms(prev =>
      prev.includes(formId)
        ? prev.filter(id => id !== formId)
        : [...prev, formId]
    );
  };

  const processBatch = async () => {
    if (selectedForms.length === 0) {
      toast({
        title: "No Forms Selected",
        description: "Please select at least one form",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('batch-process', {
        body: {
          formIds: selectedForms,
          jobName: `Batch ${new Date().toLocaleString()}`
        }
      });

      if (error) throw error;

      setJobStatus(data);
      
      toast({
        title: "Batch Processing Complete",
        description: `Processed ${data.processed} forms successfully`,
      });
    } catch (error) {
      console.error('Batch processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process forms in batch",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Batch Processing
        </CardTitle>
        <CardDescription>
          Upload multiple forms, AI fills them all at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 max-h-[300px] overflow-auto">
          {forms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No forms available
            </p>
          ) : (
            forms.map((form) => (
              <div
                key={form.id}
                className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <Checkbox
                  checked={selectedForms.includes(form.id)}
                  onCheckedChange={() => toggleForm(form.id)}
                />
                <label className="flex-1 cursor-pointer">
                  {form.form_name}
                </label>
              </div>
            ))
          )}
        </div>

        <Button
          onClick={processBatch}
          disabled={isProcessing || selectedForms.length === 0}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing {selectedForms.length} forms...
            </>
          ) : (
            `Process ${selectedForms.length} Form${selectedForms.length !== 1 ? 's' : ''}`
          )}
        </Button>

        {jobStatus && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Successful: {jobStatus.processed}
              </span>
              <span className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                Failed: {jobStatus.failed}
              </span>
            </div>
            <Progress value={(jobStatus.processed / (jobStatus.processed + jobStatus.failed)) * 100} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};