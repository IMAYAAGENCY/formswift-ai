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
  // Major Indian Languages (Constitutional Languages)
  { code: 'hi', name: 'Hindi (हिंदी)', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali (বাংলা)', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu (తెలుగు)', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi (मराठी)', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil (தமிழ்)', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam (മലയാളം)', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese (অসমীয়া)', nativeName: 'অসমীয়া' },
  { code: 'mai', name: 'Maithili (मैथिली)', nativeName: 'मैथिली' },
  { code: 'bh', name: 'Bhojpuri (भोजपुरी)', nativeName: 'भोजपुरी' },
  { code: 'ur', name: 'Urdu (اردو)', nativeName: 'اردو' },
  { code: 'sa', name: 'Sanskrit (संस्कृत)', nativeName: 'संस्कृत' },
  { code: 'ks', name: 'Kashmiri (کٲشُر)', nativeName: 'کٲشُر' },
  { code: 'sd', name: 'Sindhi (سنڌي)', nativeName: 'سنڌي' },
  { code: 'kok', name: 'Konkani (कोंकणी)', nativeName: 'कोंकणी' },
  { code: 'doi', name: 'Dogri (डोगरी)', nativeName: 'डोगरी' },
  { code: 'mni', name: 'Manipuri (মৈতৈলোন্)', nativeName: 'মৈতৈলোন্' },
  { code: 'sat', name: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'ne', name: 'Nepali (नेपाली)', nativeName: 'नेपाली' },
  { code: 'en', name: 'English', nativeName: 'English' },
  
  // Popular International Languages
  { code: 'es', name: 'Spanish (Español)', nativeName: 'Español' },
  { code: 'fr', name: 'French (Français)', nativeName: 'Français' },
  { code: 'de', name: 'German (Deutsch)', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese (中文)', nativeName: '中文' },
  { code: 'ja', name: 'Japanese (日本語)', nativeName: '日本語' },
  { code: 'ko', name: 'Korean (한국어)', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic (العربية)', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese (Português)', nativeName: 'Português' },
  { code: 'ru', name: 'Russian (Русский)', nativeName: 'Русский' },
  { code: 'it', name: 'Italian (Italiano)', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch (Nederlands)', nativeName: 'Nederlands' },
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
          Translate forms to any Indian language - Hindi, Bengali, Tamil, Telugu, and 20+ more languages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center gap-2">
                  <span>{lang.name}</span>
                </div>
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