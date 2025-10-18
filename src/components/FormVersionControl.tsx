import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Version {
  id: string;
  version_number: number;
  created_at: string;
  change_description: string | null;
}

export const FormVersionControl = ({ 
  formId, 
  onRestore 
}: { 
  formId: string;
  onRestore: (versionData: any) => void;
}) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadVersions();
  }, [formId]);

  const loadVersions = async () => {
    const { data, error } = await supabase
      .from('form_versions')
      .select('id, version_number, created_at, change_description')
      .eq('form_id', formId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error loading versions:', error);
      return;
    }

    setVersions(data || []);
  };

  const restoreVersion = async (versionId: string) => {
    const { data, error } = await supabase
      .from('form_versions')
      .select('form_data')
      .eq('id', versionId)
      .single();

    if (error) {
      toast({
        title: "Restore Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    onRestore(data.form_data);
    
    toast({
      title: "Version Restored",
      description: "Form has been restored to the selected version",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Version History
        </CardTitle>
        <CardDescription>
          Track changes and rollback to previous versions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No version history available
            </p>
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">Version {version.version_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(version.created_at).toLocaleString()}
                    </p>
                    {version.change_description && (
                      <p className="text-sm mt-1">{version.change_description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => restoreVersion(version.id)}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};