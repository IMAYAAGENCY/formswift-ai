import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { OCRUploader } from "@/components/OCRUploader";
import { DigitalSignature } from "@/components/DigitalSignature";
import { FormScheduler } from "@/components/FormScheduler";
import { FormVersionControl } from "@/components/FormVersionControl";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";

const SmartForms = () => {
  const [extractedText, setExtractedText] = useState("");
  const [signature, setSignature] = useState("");
  const [formData, setFormData] = useState({});

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Smart Form Features
          </h1>
          <p className="text-xl text-muted-foreground">
            Advanced AI-powered tools for intelligent form processing
          </p>
        </div>

        <Tabs defaultValue="ocr" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="ocr">OCR</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="translate">Translate</TabsTrigger>
            <TabsTrigger value="logic">Logic</TabsTrigger>
          </TabsList>

          <TabsContent value="ocr" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <OCRUploader onExtract={setExtractedText} />
              {extractedText && (
                <Card>
                  <CardHeader>
                    <CardTitle>Extracted Text</CardTitle>
                    <CardDescription>AI-extracted form data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-[400px]">
                      {extractedText}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="signature">
            <div className="max-w-2xl mx-auto">
              <DigitalSignature onSave={setSignature} />
              {signature && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Saved Signature</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img src={signature} alt="Signature" className="border rounded-lg" />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="max-w-2xl mx-auto">
              <FormScheduler formId="demo-form-id" />
            </div>
          </TabsContent>

          <TabsContent value="versions">
            <div className="max-w-2xl mx-auto">
              <FormVersionControl 
                formId="demo-form-id" 
                onRestore={(data) => setFormData(data)}
              />
            </div>
          </TabsContent>

          <TabsContent value="translate">
            <div className="max-w-2xl mx-auto">
              <LanguageSelector 
                formData={formData}
                onTranslate={(data) => setFormData(data)}
              />
            </div>
          </TabsContent>

          <TabsContent value="logic">
            <Card>
              <CardHeader>
                <CardTitle>Conditional Logic Builder</CardTitle>
                <CardDescription>
                  Create dynamic forms that change based on user input
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Visual form builder with conditional logic coming soon!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This feature will allow you to create complex form flows with conditional fields,
                    branching logic, and dynamic validation rules.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SmartForms;