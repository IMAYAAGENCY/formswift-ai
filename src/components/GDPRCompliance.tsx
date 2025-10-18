import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const GDPRCompliance = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const exportData = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('gdpr-request', {
        body: { requestType: 'export' }
      });

      if (error) throw error;

      // Download as JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export your data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const requestDeletion = async () => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('gdpr-request', {
        body: { requestType: 'delete' }
      });

      if (error) throw error;

      toast({
        title: "Deletion Requested",
        description: data.message,
      });
    } catch (error) {
      console.error('Deletion error:', error);
      toast({
        title: "Request Failed",
        description: "Failed to submit deletion request",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          GDPR Compliance
        </CardTitle>
        <CardDescription>
          Manage your data and privacy rights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Export Your Data</h4>
          <p className="text-sm text-muted-foreground">
            Download all your personal data in JSON format
          </p>
          <Button onClick={exportData} disabled={isExporting} variant="outline" className="w-full">
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export My Data
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Delete Account</h4>
          <p className="text-sm text-muted-foreground">
            Request permanent deletion of your account and all associated data
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Request Account Deletion
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Your account and all associated data will be permanently deleted within 30 days.
                  You can cancel this request by contacting support within that time.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={requestDeletion} className="bg-destructive text-destructive-foreground">
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};