import { AutoFillForm } from "@/components/AutoFillForm";
import { Navbar } from "@/components/Navbar";

const AutoFillDemo = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">AI Form Auto-Fill</h1>
            <p className="text-xl text-muted-foreground">
              Upload any form and let AI fill it automatically with 100% accuracy
            </p>
          </div>
          <AutoFillForm />
        </div>
      </div>
    </div>
  );
};

export default AutoFillDemo;
