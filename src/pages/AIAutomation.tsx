import { Navbar } from "@/components/Navbar";
import { FormRecommendations } from "@/components/FormRecommendations";
import { PredictiveAutofill } from "@/components/PredictiveAutofill";
import { VoiceToForm } from "@/components/VoiceToForm";
import { BatchProcessor } from "@/components/BatchProcessor";
import { DataExtractor } from "@/components/DataExtractor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain } from "lucide-react";

const AIAutomation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI & Automation
          </h1>
          <p className="text-xl text-muted-foreground">
            Intelligent automation powered by cutting-edge AI
          </p>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="autofill">Autofill</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="batch">Batch</TabsTrigger>
            <TabsTrigger value="extract">Extract</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <div className="max-w-2xl mx-auto">
              <FormRecommendations formId="demo-form-id" />
            </div>
          </TabsContent>

          <TabsContent value="autofill">
            <div className="max-w-2xl mx-auto">
              <PredictiveAutofill />
            </div>
          </TabsContent>

          <TabsContent value="voice">
            <div className="max-w-2xl mx-auto">
              <VoiceToForm />
            </div>
          </TabsContent>

          <TabsContent value="batch">
            <div className="max-w-2xl mx-auto">
              <BatchProcessor />
            </div>
          </TabsContent>

          <TabsContent value="extract">
            <div className="max-w-2xl mx-auto">
              <DataExtractor />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAutomation;