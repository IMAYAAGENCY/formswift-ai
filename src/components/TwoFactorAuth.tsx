import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const TwoFactorAuth = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startSetup = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-2fa', {
        body: { action: 'setup' }
      });

      if (error) throw error;

      setSecret(data.secret);
      setQrCode(data.qrCode);
      setBackupCodes(data.backupCodes);
      setIsSetupMode(true);

      toast({
        title: "2FA Setup Started",
        description: "Scan the QR code with your authenticator app",
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      toast({
        title: "Setup Failed",
        description: "Failed to start 2FA setup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-2fa', {
        body: { action: 'verify', token: verificationCode }
      });

      if (error) throw error;

      setIsEnabled(true);
      setIsSetupMode(false);

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication is now active",
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-2fa', {
        body: { action: 'disable' }
      });

      if (error) throw error;

      setIsEnabled(false);

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been turned off",
      });
    } catch (error) {
      console.error('2FA disable error:', error);
      toast({
        title: "Failed to Disable",
        description: "Could not disable 2FA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSetupMode && !isEnabled && (
          <Button onClick={startSetup} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Enable 2FA"
            )}
          </Button>
        )}

        {isSetupMode && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app
              </p>
              <div className="p-4 bg-white rounded-lg inline-block">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`} alt="2FA QR Code" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Or enter this code manually: <code className="bg-muted px-2 py-1 rounded">{secret}</code>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Backup Codes (Save these securely)</Label>
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
                {backupCodes.map((code, idx) => (
                  <code key={idx} className="text-sm">{code}</code>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Enter verification code</Label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <Button onClick={verify2FA} disabled={isLoading || verificationCode.length !== 6} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify and Enable"
              )}
            </Button>
          </div>
        )}

        {isEnabled && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Key className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-900 font-medium">2FA is enabled</span>
            </div>
            <Button variant="destructive" onClick={disable2FA} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                "Disable 2FA"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};