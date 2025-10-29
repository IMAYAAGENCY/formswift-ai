import { IntelligentFormAssistant } from "@/components/IntelligentFormAssistant";
import { Navbar } from "@/components/Navbar";

const AutoFillDemo = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Form Assistant</h1>
          <p className="text-xl text-muted-foreground">
            ফর্ম আপলোড করুন, AI এর সাথে চ্যাট করুন, ভয়েস বা টেক্সট দিয়ে ফর্ম ফিল করুন
          </p>
        </div>
        <IntelligentFormAssistant />
      </div>
    </div>
  );
};

export default AutoFillDemo;
