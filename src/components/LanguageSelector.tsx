import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
];

export const LanguageSelector = ({ 
  formData, 
  onTranslate 
}: { 
  formData: any;
  onTranslate: (translatedData: any) => void;
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!selectedLanguage) {
      toast({
        title: "Select Language",
        description: "Please select a target language",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);

    try {
      const { data, error } = await supabase.functions.invoke('translate-form', {
        body: {
          formData,
          targetLanguage: languages.find(l => l.code === selectedLanguage)?.name
        }
      });

      if (error) throw error;

      onTranslate(data.translatedData);
      
      toast({
        title: "Translation Complete",
        description: `Form translated to ${languages.find(l => l.code === selectedLanguage)?.name}`,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: "Failed to translate form",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Multi-Language Support
        </CardTitle>
        <CardDescription>
          Auto-detect and fill forms in 100+ languages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleTranslate} 
          disabled={isTranslating || !selectedLanguage}
          className="w-full"
        >
          {isTranslating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Translating...
            </>
          ) : (
            "Translate Form"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};