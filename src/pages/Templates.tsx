import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Search,
  Download,
  Star,
  DollarSign,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  downloads: number;
  rating: number;
  creator_id: string;
}

const Templates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    description: "",
    category: "contact",
    price: 0,
    is_public: true,
    template_data: {},
  });

  const categories = ["all", "contact", "survey", "registration", "feedback", "custom"];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("form_templates")
      .select("*")
      .eq("is_public", true)
      .order("downloads", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setTemplates(data || []);
    setIsLoading(false);
  };

  const handleCreateTemplate = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase.from("form_templates").insert({
      ...newTemplate,
      creator_id: userData.user.id,
      template_data: { fields: [] }, // Placeholder
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Template created successfully!",
    });

    setIsCreateDialogOpen(false);
    loadTemplates();
    setNewTemplate({
      title: "",
      description: "",
      category: "contact",
      price: 0,
      is_public: true,
      template_data: {},
    });
  };

  const handleDownloadTemplate = async (templateId: string) => {
    const { error } = await supabase
      .from("form_templates")
      .update({ downloads: templates.find((t) => t.id === templateId)!.downloads + 1 })
      .eq("id", templateId);

    if (!error) {
      toast({
        title: "Success",
        description: "Template downloaded! You can now use it in your forms.",
      });
      loadTemplates();
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      (selectedCategory === "all" || template.category === selectedCategory) &&
      (template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Template Marketplace
            </h1>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newTemplate.title}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, title: e.target.value })
                    }
                    placeholder="Contact Form Template"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newTemplate.description}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, description: e.target.value })
                    }
                    placeholder="A beautiful contact form template..."
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newTemplate.category}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, category: e.target.value })
                    }
                  >
                    {categories.filter((c) => c !== "all").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={newTemplate.price}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, price: Number(e.target.value) })
                    }
                    placeholder="0"
                  />
                </div>
                <Button onClick={handleCreateTemplate} className="w-full">
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <Badge variant="secondary">{template.category}</Badge>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{template.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  {template.title}
                  {template.price === 0 && (
                    <Sparkles className="h-4 w-4 text-primary" />
                  )}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {template.downloads}
                  </div>
                  {template.price > 0 && (
                    <div className="flex items-center gap-1 font-medium text-primary">
                      <DollarSign className="h-4 w-4" />
                      {template.price}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownloadTemplate(template.id)}
                  variant={template.price === 0 ? "default" : "outline"}
                >
                  {template.price === 0 ? "Use Free" : "Purchase"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No templates found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;