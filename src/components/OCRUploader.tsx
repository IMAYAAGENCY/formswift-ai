import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const OCRUploader = ({ onExtract }: { onExtract: (text: string) => void }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result as string;

        const { data, error } = await supabase.functions.invoke('ocr-extract', {
          body: { imageData }
        });

        if (error) throw error;

        onExtract(data.extractedText);
        
        toast({
          title: "OCR Extraction Complete",
          description: "Text successfully extracted from image",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: "Extraction Failed",
        description: "Failed to extract text from image",
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
          <FileText className="h-5 w-5" />
          OCR Enhancement
        </CardTitle>
        <CardDescription>
          Extract data from handwritten forms and documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Upload a scanned form or handwritten document
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="ocr-upload"
            disabled={isProcessing}
          />
          <Button asChild disabled={isProcessing}>
            <label htmlFor="ocr-upload" className="cursor-pointer">
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Upload Image"
              )}
            </label>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};