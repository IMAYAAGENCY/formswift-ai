import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileText, Languages, Sparkles, Zap, Shield } from "lucide-react";
import { AnimatedUploadDemo } from "./AnimatedUploadDemo";
import { AnimatedUpgradeDemo } from "./AnimatedUpgradeDemo";

export const SmartFeatureShowcase = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20 mb-4">
            <Brain className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Smart Technology</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Intelligent Features That
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Work Like Magic
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature is AI-powered and intelligent
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto gap-2 bg-background/50 p-2">
            <TabsTrigger value="upload" className="flex items-center gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Smart Upload</span>
              <span className="sm:hidden">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2 py-3">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Processing</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2 py-3">
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">Multi-Language</span>
              <span className="sm:hidden">Language</span>
            </TabsTrigger>
            <TabsTrigger value="speed" className="flex items-center gap-2 py-3">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Lightning Fast</span>
              <span className="sm:hidden">Speed</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 py-3">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">100% Secure</span>
              <span className="sm:hidden">Secure</span>
            </TabsTrigger>
            <TabsTrigger value="smart" className="flex items-center gap-2 py-3">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Smart Features</span>
              <span className="sm:hidden">Smart</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-8">
            <Card className="p-8 border-2 border-primary/20 shadow-[var(--shadow-elegant)]">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Smart Upload System</h3>
                  <p className="text-muted-foreground">Our AI can read any type of form</p>
                </div>
                <AnimatedUploadDemo />
                <div className="grid sm:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">PDF</div>
                    <div className="text-sm text-muted-foreground mt-1">Any PDF form</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">IMAGE</div>
                    <div className="text-sm text-muted-foreground mt-1">JPG, PNG, WebP</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">DOC</div>
                    <div className="text-sm text-muted-foreground mt-1">Word documents</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="mt-8">
            <Card className="p-8 border-2 border-accent/20 shadow-[var(--shadow-elegant)]">
              <div className="text-center space-y-4">
                <Brain className="h-16 w-16 mx-auto text-accent animate-pulse" />
                <h3 className="text-2xl font-bold">AI-Powered Intelligence</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Our AI analyzes every form and automatically fills correct data
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  {[
                    { title: "OCR Technology", desc: "Can read handwriting", icon: "📖" },
                    { title: "Smart Extraction", desc: "Extracts data automatically", icon: "🔍" },
                    { title: "Pattern Recognition", desc: "Recognizes patterns", icon: "🧠" },
                    { title: "Auto Correction", desc: "Fixes errors automatically", icon: "✅" }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="font-semibold text-sm mb-1">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="language" className="mt-8">
            <Card className="p-8 border-2 border-primary/20 shadow-[var(--shadow-elegant)]">
              <div className="text-center space-y-4">
                <Languages className="h-16 w-16 mx-auto text-primary animate-pulse" />
                <h3 className="text-2xl font-bold">22 Indian Languages Support</h3>
                <p className="text-muted-foreground">Fill forms in your native language</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-8">
                  {[
                    "🇮🇳 हिन्दी",
                    "🇮🇳 বাংলা",
                    "🇮🇳 தமிழ்",
                    "🇮🇳 తెలుగు",
                    "🇮🇳 मराठी",
                    "🇮🇳 ગુજરાતી",
                    "🇮🇳 ಕನ್ನಡ",
                    "🇮🇳 മലയാളം",
                    "🇮🇳 ਪੰਜਾਬੀ",
                    "🇮🇳 ଓଡ଼ିଆ",
                    "🇮🇳 অসমীয়া",
                    "🇮🇳 English"
                  ].map((lang, idx) => (
                    <div key={idx} className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-sm font-medium hover:bg-primary/10 transition-colors">
                      {lang}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="speed" className="mt-8">
            <Card className="p-8 border-2 border-accent/20 shadow-[var(--shadow-elegant)]">
              <div className="text-center space-y-4">
                <Zap className="h-16 w-16 mx-auto text-accent animate-bounce" />
                <h3 className="text-2xl font-bold">Lightning Fast Processing</h3>
                <p className="text-muted-foreground">Forms filled in just 2 seconds</p>
                <div className="grid sm:grid-cols-3 gap-6 mt-8">
                  <div className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl">
                    <div className="text-4xl font-bold text-accent mb-2">2 sec</div>
                    <div className="text-sm text-muted-foreground">Average Fill Time</div>
                    <div className="text-xs text-muted-foreground mt-1">⚡ Industry fastest</div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                    <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                    <div className="text-xs text-muted-foreground mt-1">🚀 Always available</div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl">
                    <div className="text-4xl font-bold text-accent mb-2">95%</div>
                    <div className="text-sm text-muted-foreground">Time Saved</div>
                    <div className="text-xs text-muted-foreground mt-1">⏱️ Focus on what matters</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-8">
            <Card className="p-8 border-2 border-primary/20 shadow-[var(--shadow-elegant)]">
              <div className="text-center space-y-4">
                <Shield className="h-16 w-16 mx-auto text-primary" />
                <h3 className="text-2xl font-bold">Bank-Grade Security</h3>
                <p className="text-muted-foreground">Your data is 100% safe and encrypted</p>
                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  {[
                    { title: "256-bit Encryption", desc: "Military grade security", icon: "🔐" },
                    { title: "GDPR Compliant", desc: "International standards", icon: "📋" },
                    { title: "No Data Sharing", desc: "Your data stays private", icon: "🛡️" },
                    { title: "Secure Servers", desc: "ISO certified infrastructure", icon: "🏢" }
                  ].map((item, idx) => (
                    <div key={idx} className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10 text-left">
                      <div className="text-3xl mb-3">{item.icon}</div>
                      <div className="font-semibold mb-1">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="smart" className="mt-8">
            <Card className="p-8 border-2 border-accent/20 shadow-[var(--shadow-elegant)]">
              <div className="text-center space-y-4">
                <Sparkles className="h-16 w-16 mx-auto text-accent animate-pulse" />
                <h3 className="text-2xl font-bold">Smart Features</h3>
                <p className="text-muted-foreground">Every feature is intelligent and automated</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                  {[
                    { title: "Auto-Save", desc: "Automatically saves your progress", icon: "💾" },
                    { title: "Smart Suggestions", desc: "AI suggests best values", icon: "💡" },
                    { title: "Error Detection", desc: "Finds mistakes automatically", icon: "🔍" },
                    { title: "Batch Processing", desc: "Fill multiple forms at once", icon: "📚" },
                    { title: "Version Control", desc: "Track all changes", icon: "📝" },
                    { title: "Cloud Sync", desc: "Access from anywhere", icon: "☁️" }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10 hover:border-primary/30 transition-all">
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="font-semibold text-sm mb-1">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
