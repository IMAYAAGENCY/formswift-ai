import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export const AutoFillForm = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formImage, setFormImage] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    gender: "",
    aadhaar: "",
    pan: ""
  });
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImage(reader.result as string);
      toast.success("Form image uploaded");
    };
    reader.readAsDataURL(file);
  };

  const handleAutoFill = async () => {
    if (!formImage) {
      toast.error("Please upload a form image first");
      return;
    }

    // Validate at least some user data
    if (!userData.name && !userData.email && !userData.phone) {
      toast.error("Please provide at least basic information (Name, Email, or Phone)");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('auto-fill-form', {
        body: {
          imageData: formImage,
          userData: userData
        }
      });

      if (error) throw error;

      if (data.success) {
        setResult(data);
        toast.success(`Form auto-filled with ${data.accuracy} accuracy!`);
      } else {
        throw new Error(data.error || "Auto-fill failed");
      }
    } catch (error: any) {
      console.error('Auto-fill error:', error);
      toast.error(error.message || "Failed to auto-fill form");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">AI Form Auto-Fill</h2>
        <p className="text-muted-foreground mb-6">
          Upload a form image and provide your details. AI will automatically detect fields and fill them with 100% accuracy.
        </p>

        {/* File Upload */}
        <div className="space-y-4">
          <div>
            <Label>Upload Form Image (PDF/PNG/JPG)</Label>
            <div className="mt-2 flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="flex-1"
              />
              {formImage && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>
          </div>

          {formImage && (
            <div className="border rounded-lg p-4">
              <img src={formImage} alt="Form preview" className="max-h-64 mx-auto" />
            </div>
          )}

          {/* User Data Input */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  placeholder="+91 1234567890"
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={userData.dob}
                  onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={userData.address}
                  onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                  placeholder="123 Main St, City"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={userData.gender}
                  onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                  placeholder="Male/Female/Other"
                />
              </div>
              <div>
                <Label htmlFor="aadhaar">Aadhaar Number (Optional)</Label>
                <Input
                  id="aadhaar"
                  value={userData.aadhaar}
                  onChange={(e) => setUserData({ ...userData, aadhaar: e.target.value })}
                  placeholder="1234 5678 9012"
                />
              </div>
              <div>
                <Label htmlFor="pan">PAN Number (Optional)</Label>
                <Input
                  id="pan"
                  value={userData.pan}
                  onChange={(e) => setUserData({ ...userData, pan: e.target.value })}
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleAutoFill} 
            disabled={isProcessing || !formImage}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Form...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Auto-Fill Form with AI
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {result && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Auto-Fill Results</h3>
            <div className={`flex items-center gap-2 ${result.complete ? 'text-green-600' : 'text-orange-600'}`}>
              {result.complete ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span className="font-semibold">{result.accuracy} Complete</span>
            </div>
          </div>

          {/* Detected Fields */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Detected Form Fields:</h4>
            <div className="flex flex-wrap gap-2">
              {result.form_structure?.fields?.map((field: any, index: number) => (
                <span key={index} className="px-3 py-1 bg-secondary text-sm rounded-full">
                  {field.label}
                </span>
              ))}
            </div>
          </div>

          {/* Filled Data */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Filled Data:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(result.filled_data).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">{key}:</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Fields Warning */}
          {result.missing_fields && result.missing_fields.length > 0 && (
            <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900 dark:text-orange-100">Missing Data:</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {result.missing_fields.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
