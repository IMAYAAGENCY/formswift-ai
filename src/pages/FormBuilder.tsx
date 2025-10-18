import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Plus, Trash2, GripVertical, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface FormField {
  id: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox";
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export default function FormBuilder() {
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [preview, setPreview] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: "",
      options: type === "select" ? ["Option 1", "Option 2"] : undefined,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  const saveForm = async () => {
    if (!formName.trim()) {
      toast({ title: "Error", description: "Please enter a form name", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "Please login first", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("forms").insert({
        form_name: formName,
        user_id: user.id,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Form saved successfully!" });
      navigate("/dashboard");
    } catch (error) {
      toast({ title: "Error", description: "Failed to save form", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Form Builder</h1>
            <p className="text-muted-foreground">Drag & drop to create custom forms visually</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreview(!preview)}>
              <Eye className="h-4 w-4 mr-2" />
              {preview ? "Edit" : "Preview"}
            </Button>
            <Button onClick={saveForm}>
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-[300px,1fr] gap-6">
          {/* Field Types Panel */}
          {!preview && (
            <Card className="p-6 h-fit">
              <h3 className="font-semibold mb-4">Add Fields</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => addField("text")}>
                  <Plus className="h-4 w-4 mr-2" /> Text Input
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addField("email")}>
                  <Plus className="h-4 w-4 mr-2" /> Email Input
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addField("number")}>
                  <Plus className="h-4 w-4 mr-2" /> Number Input
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addField("textarea")}>
                  <Plus className="h-4 w-4 mr-2" /> Text Area
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addField("select")}>
                  <Plus className="h-4 w-4 mr-2" /> Dropdown
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => addField("checkbox")}>
                  <Plus className="h-4 w-4 mr-2" /> Checkbox
                </Button>
              </div>
            </Card>
          )}

          {/* Form Canvas */}
          <Card className="p-6">
            <div className="mb-6">
              <Label>Form Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter form name"
                className="mt-2"
              />
            </div>

            <div className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No fields yet. Add fields from the panel to get started.</p>
                </div>
              ) : (
                fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    {preview ? (
                      <div className="space-y-2">
                        <Label>
                          {field.label} {field.required && <span className="text-destructive">*</span>}
                        </Label>
                        {field.type === "textarea" ? (
                          <Textarea placeholder={field.placeholder} />
                        ) : field.type === "select" ? (
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((opt, i) => (
                                <SelectItem key={i} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input type={field.type} placeholder={field.placeholder} />
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            placeholder="Field label"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveField(index, "up")}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveField(index, "down")}
                            disabled={index === fields.length - 1}
                          >
                            ↓
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => removeField(field.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4">
                          <Label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            />
                            Required
                          </Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            placeholder="Placeholder text"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
