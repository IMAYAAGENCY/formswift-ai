import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const KeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        toast({ title: "Search", description: "Search feature coming soon!" });
      }

      // Ctrl/Cmd + D for dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        navigate("/dashboard");
      }

      // Ctrl/Cmd + N for new form
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        navigate("/smart-forms");
      }

      // Ctrl/Cmd + B for form builder
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        navigate("/form-builder");
      }

      // Ctrl/Cmd + T for templates
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        navigate("/templates");
      }

      // Ctrl/Cmd + / to show shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        toast({
          title: "Keyboard Shortcuts",
          description: (
            <div className="space-y-2 text-sm">
              <div><kbd className="px-2 py-1 bg-muted rounded">⌘/Ctrl + K</kbd> Search</div>
              <div><kbd className="px-2 py-1 bg-muted rounded">⌘/Ctrl + D</kbd> Dashboard</div>
              <div><kbd className="px-2 py-1 bg-muted rounded">⌘/Ctrl + N</kbd> New Form</div>
              <div><kbd className="px-2 py-1 bg-muted rounded">⌘/Ctrl + B</kbd> Form Builder</div>
              <div><kbd className="px-2 py-1 bg-muted rounded">⌘/Ctrl + T</kbd> Templates</div>
            </div>
          ),
        });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate, toast]);

  return null;
};
