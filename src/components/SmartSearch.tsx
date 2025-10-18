import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const SmartSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .ilike("form_name", `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search forms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Search forms with AI... (Ctrl/Cmd + K)"
          className="pl-10 pr-10"
        />
        <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
      </div>

      {loading && (
        <Card className="p-4 text-center text-muted-foreground">
          Searching...
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((form) => (
            <Card key={form.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-semibold">{form.form_name}</h3>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(form.created_at).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
