import { Card, CardContent } from "@/components/ui/card";
import { Languages, Globe2 } from "lucide-react";

const indianLanguages = [
  { name: 'हिंदी', english: 'Hindi', speakers: '550M+' },
  { name: 'বাংলা', english: 'Bengali', speakers: '270M+' },
  { name: 'తెలుగు', english: 'Telugu', speakers: '95M+' },
  { name: 'मराठी', english: 'Marathi', speakers: '85M+' },
  { name: 'தமிழ்', english: 'Tamil', speakers: '80M+' },
  { name: 'ગુજરાતી', english: 'Gujarati', speakers: '60M+' },
  { name: 'ಕನ್ನಡ', english: 'Kannada', speakers: '55M+' },
  { name: 'മലയാളം', english: 'Malayalam', speakers: '38M+' },
  { name: 'ਪੰਜਾਬੀ', english: 'Punjabi', speakers: '35M+' },
  { name: 'ଓଡ଼ିଆ', english: 'Odia', speakers: '38M+' },
  { name: 'অসমীয়া', english: 'Assamese', speakers: '15M+' },
  { name: 'اردو', english: 'Urdu', speakers: '70M+' },
];

export const LanguageShowcase = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20 mb-4">
            <Globe2 className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">22 Indian Languages Supported</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Work in Every Language of India
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-muted-foreground">
            22 Indian Languages • Full Native Support
          </h3>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            From Kashmir to Kanyakumari, from Gujarat to Assam - fill forms in your mother tongue with AI-powered accuracy
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          {indianLanguages.map((lang, index) => (
            <Card
              key={index}
              className="border-2 hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105 group cursor-pointer"
            >
              <CardContent className="p-4 text-center space-y-2">
                <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">
                  {lang.name}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {lang.english}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang.speakers}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-3 items-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <Languages className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">+ Sanskrit, Kashmiri, Sindhi, Konkani, Dogri, Manipuri, Santali, Nepali, Maithili, Bhojpuri</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            All 22 official Indian languages recognized by the Indian Constitution, plus English and major international languages
          </p>
        </div>
      </div>
    </section>
  );
};
