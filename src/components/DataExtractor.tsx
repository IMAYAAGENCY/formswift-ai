import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const DataExtractor = () => {
  const [content, setContent] = useState("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const extractData = async () => {
    if (!content.trim()) {
      toast({
        title: "No Content",
        description: "Please enter some content to extract",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-data', {
        body: {
          content,
          sourceType: 'email',
          targetFields: ['name', 'email', 'phone', 'address', 'company']
        }
      });

      if (error) throw error;

      setExtractedData(data.extractedFields);
      
      toast({
        title: "Data Extracted",
        description: "AI successfully extracted structured data",
      });
    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: "Extraction Failed",
        description: "Failed to extract data",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Smart Data Extraction
        </CardTitle>
        <CardDescription>
          Pull data from emails/PDFs to auto-populate forms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Paste Email or Document Content</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste email or document text here..."
            className="min-h-[200px]"
          />
        </div>

        <Button onClick={extractData} disabled={isExtracting} className="w-full">
          {isExtracting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            "Extract Data"
          )}
        </Button>

        {extractedData && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Extracted Fields:</p>
            <div className="space-y-2">
              {Object.entries(extractedData).map(([key, value]) => (
                <div key={key} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium capitalize">{key}</p>
                  <p className="text-sm text-muted-foreground">{value as string}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};