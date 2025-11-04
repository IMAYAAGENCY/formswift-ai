import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AIDemo = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDemo = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke('customer-support-chat', {
        body: { 
          messages: [
            { role: "user", content: input }
          ]
        }
      });

      if (error) throw error;

      setResponse(data.reply || "AI is thinking...");
      
      toast({
        title: "✨ AI Response Generated",
        description: "See how smart our AI is!",
      });
    } catch (error: any) {
      console.error('Demo error:', error);
      setResponse("💡 This is a demo of our AI! In the full version, I can help you with form filling, data extraction, language translation, and much more!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-medium">Live AI Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Experience AI Intelligence
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Right Now
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            আমাদের AI এর সাথে কথা বলুন - হিন্দি, বাংলা, English বা যেকোনো ভাষায়
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-[var(--shadow-elegant)] border-2 border-primary/20">
          <div className="space-y-6">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything... (e.g., 'আপনি কি করতে পারেন?' or 'What can you do?')"
                className="flex-1 text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleDemo()}
              />
              <Button 
                onClick={handleDemo} 
                disabled={isLoading || !input.trim()}
                size="lg"
                className="group"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    <span className="ml-2 hidden sm:inline">Send</span>
                  </>
                )}
              </Button>
            </div>

            {isLoading && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg animate-pulse">
                <Sparkles className="h-5 w-5 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            )}

            {response && (
              <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border-l-4 border-primary">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-primary mb-2">AI Response:</p>
                    <p className="text-foreground leading-relaxed">{response}</p>
                  </div>
                </div>
              </div>
            )}

            {!response && !isLoading && (
              <div className="p-6 bg-muted/30 rounded-lg border border-dashed border-primary/30">
                <p className="text-center text-muted-foreground text-sm">
                  <Sparkles className="inline h-4 w-4 mr-2" />
                  Try asking: "আমার form fill করতে সাহায্য করো" or "How does this work?"
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { text: "Fill my form", emoji: "📝" },
              { text: "আমাকে সাহায্য করো", emoji: "🤝" },
              { text: "Explain features", emoji: "✨" }
            ].map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(suggestion.text);
                  setTimeout(() => handleDemo(), 100);
                }}
                className="text-sm justify-start"
                disabled={isLoading}
              >
                <span className="mr-2">{suggestion.emoji}</span>
                {suggestion.text}
              </Button>
            ))}
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            🔥 This AI can understand 22+ languages, extract data from forms, and help you fill any document!
          </p>
        </div>
      </div>
    </section>
  );
};
