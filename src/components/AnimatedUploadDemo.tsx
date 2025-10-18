import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chrome, Download, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AnimatedUploadDemo = () => {
  const chromeExtensionCode = `// manifest.json
{
  "manifest_version": 3,
  "name": "FormSwift AI Auto-Fill",
  "version": "1.0",
  "description": "Auto-fill forms with AI",
  "permissions": ["activeTab", "storage"],
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}

// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    const formData = request.data;
    // Find and fill form fields
    Object.keys(formData).forEach(key => {
      const input = document.querySelector(\`[name="\${key}"]\`);
      if (input) input.value = formData[key];
    });
  }
});`;

  const mobileAppCode = `// Using Capacitor for mobile apps
npx cap init FormSwiftAI app.formswift.ai

// Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

// Build and add platforms
npm run build
npx cap add ios
npx cap add android
npx cap sync

// Open in native IDEs
npx cap open ios
npx cap open android`;

  const browserAutomationCode = `// Puppeteer automation script
const puppeteer = require('puppeteer');

async function fillForm(url, formData) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  // Fill form fields
  for (const [field, value] of Object.entries(formData)) {
    await page.type(\`input[name="\${field}"]\`, value);
  }
  
  // Submit form
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  await browser.close();
}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Chrome className="h-5 w-5" />
            Browser Extensions & Automation
          </CardTitle>
          <CardDescription>
            Extend FormSwift AI to browsers and automate form filling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chrome" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chrome">Chrome Extension</TabsTrigger>
              <TabsTrigger value="mobile">Mobile Apps</TabsTrigger>
              <TabsTrigger value="automation">Browser Automation</TabsTrigger>
            </TabsList>

            <TabsContent value="chrome" className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold mb-2">Chrome Extension Setup:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Create a new directory for your extension</li>
                  <li>Create manifest.json and content.js files</li>
                  <li>Add your FormSwift AI API integration</li>
                  <li>Load unpacked extension in Chrome</li>
                  <li>Test on any website with forms</li>
                </ol>
              </div>
              
              <div className="rounded-lg border border-border bg-card p-4">
                <h4 className="font-semibold mb-2">Example Code:</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {chromeExtensionCode}
                </pre>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://developer.chrome.com/docs/extensions/mv3/getstarted/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Chrome Extension Documentation
                </a>
              </Button>
            </TabsContent>

            <TabsContent value="mobile" className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold mb-2">Mobile App Development:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Install Capacitor CLI</li>
                  <li>Initialize Capacitor in your project</li>
                  <li>Add iOS and Android platforms</li>
                  <li>Build and sync your app</li>
                  <li>Open in Xcode (iOS) or Android Studio</li>
                  <li>Test and deploy to app stores</li>
                </ol>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h4 className="font-semibold mb-2">Setup Commands:</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {mobileAppCode}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" asChild>
                  <a href="https://capacitorjs.com/docs" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Capacitor Docs
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://developer.apple.com/xcode/" target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download Xcode
                  </a>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold mb-2">Browser Automation Setup:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Install Puppeteer or Playwright</li>
                  <li>Write automation scripts</li>
                  <li>Integrate with FormSwift AI API</li>
                  <li>Run automated form filling</li>
                  <li>Schedule with cron or task scheduler</li>
                </ol>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h4 className="font-semibold mb-2">Example Script:</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {browserAutomationCode}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" asChild>
                  <a href="https://pptr.dev/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Puppeteer
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://playwright.dev/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Playwright
                  </a>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};