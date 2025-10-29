import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, Send, Mic, Square, Image as ImageIcon, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const IntelligentFormAssistant = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formImage, setFormImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "আসসালামু আলাইকুম! আমি আপনার AI Form Assistant। আপনার ফর্ম ছবি আপলোড করুন এবং আমি আপনাকে সাহায্য করব।"
    }
  ]);
  const [input, setInput] = useState("");
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
  
  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("দয়া করে একটি ছবি ফাইল আপলোড করুন");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageData = reader.result as string;
      setFormImage(imageData);
      toast.success("ফর্ম ছবি আপলোড হয়েছে");
      
      // Auto-send to AI for analysis
      await sendToAI("", imageData, true);
    };
    reader.readAsDataURL(file);
  };

  const sendToAI = async (userMessage: string, imageData?: string, isInitial = false) => {
    setIsProcessing(true);
    
    try {
      // Add user message if not initial
      if (!isInitial && userMessage) {
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
      }

      const { data, error } = await supabase.functions.invoke('intelligent-form-chat', {
        body: {
          formImage: imageData || formImage,
          messages: messages,
          userData: userData
        }
      });

      if (error) throw error;

      if (data.success) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: data.reply 
        }]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || "সংযোগে সমস্যা হয়েছে");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;
    
    const userMessage = input;
    setInput("");
    await sendToAI(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await processVoice(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      toast.success("রেকর্ডিং শুরু হয়েছে");
    } catch (error) {
      console.error('Recording error:', error);
      toast.error("মাইক্রোফোন অ্যাক্সেস করা যায়নি");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const processVoice = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const audioData = e.target?.result as string;

        const { data, error } = await supabase.functions.invoke('voice-to-form', {
          body: {
            audioData,
            formFields: ['name', 'email', 'phone', 'address', 'dob', 'gender']
          }
        });

        if (error) throw error;

        const voiceText = data.transcription;
        setInput(voiceText);
        toast.success("ভয়েস টেক্সটে রূপান্তরিত হয়েছে");
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Voice processing error:', error);
      toast.error("ভয়েস প্রসেস করতে ব্যর্থ");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left Panel - User Data */}
      <Card className="p-6 overflow-auto">
        <h3 className="text-xl font-bold mb-4">আপনার তথ্য</h3>
        <p className="text-sm text-muted-foreground mb-4">
          এই তথ্য AI ব্যবহার করে ফর্ম ফিল করবে
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">নাম</Label>
            <Input
              id="name"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              placeholder="আপনার নাম"
            />
          </div>
          <div>
            <Label htmlFor="email">ইমেইল</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              placeholder="example@email.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">ফোন</Label>
            <Input
              id="phone"
              value={userData.phone}
              onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              placeholder="+880 1234567890"
            />
          </div>
          <div>
            <Label htmlFor="address">ঠিকানা</Label>
            <Input
              id="address"
              value={userData.address}
              onChange={(e) => setUserData({ ...userData, address: e.target.value })}
              placeholder="আপনার ঠিকানা"
            />
          </div>
          <div>
            <Label htmlFor="dob">জন্ম তারিখ</Label>
            <Input
              id="dob"
              type="date"
              value={userData.dob}
              onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="gender">লিঙ্গ</Label>
            <Input
              id="gender"
              value={userData.gender}
              onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
              placeholder="পুরুষ/মহিলা/অন্যান্য"
            />
          </div>
        </div>

        {/* Form Upload */}
        <div className="mt-6 pt-6 border-t">
          <Label>ফর্ম ছবি আপলোড করুন</Label>
          <div className="mt-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="cursor-pointer"
            />
          </div>
          
          {formImage && (
            <div className="mt-4 border rounded-lg p-2">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">ফর্ম আপলোড সফল</span>
              </div>
              <img 
                src={formImage} 
                alt="Form preview" 
                className="max-h-32 mx-auto rounded"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Middle Panel - Chat Interface */}
      <Card className="lg:col-span-2 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <User className="h-5 w-5" />
            AI Form Assistant চ্যাট
          </h3>
          <p className="text-sm text-muted-foreground">
            ফর্ম সম্পর্কে জিজ্ঞাসা করুন এবং সাহায্য পান
          </p>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              {isRecording ? (
                <Square className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            <Input
              placeholder="এখানে টাইপ করুন..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              className="flex-1"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isProcessing}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            {isRecording ? "রেকর্ডিং চলছে... বন্ধ করতে ক্লিক করুন" : "ভয়েস বা টেক্সট দিয়ে মেসেজ পাঠান"}
          </p>
        </div>
      </Card>
    </div>
  );
};
