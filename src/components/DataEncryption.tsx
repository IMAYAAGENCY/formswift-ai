import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DataEncryption = () => {
  const [isEncrypted] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Data Encryption
        </CardTitle>
        <CardDescription>
          Your data is protected with industry-standard encryption
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Encryption at Rest</p>
              <p className="text-xs text-muted-foreground">AES-256 encryption</p>
            </div>
            <Badge variant={isEncrypted ? "default" : "secondary"}>
              {isEncrypted ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Encryption in Transit</p>
              <p className="text-xs text-muted-foreground">TLS 1.3</p>
            </div>
            <Badge variant="default">Active</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Database Encryption</p>
              <p className="text-xs text-muted-foreground">PostgreSQL encryption</p>
            </div>
            <Badge variant="default">Active</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Backup Encryption</p>
              <p className="text-xs text-muted-foreground">Automated encrypted backups</p>
            </div>
            <Badge variant="default">Active</Badge>
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-900">
            <strong>✓ All your data is encrypted</strong>
            <br />
            We use bank-grade encryption to protect your forms and personal information both at rest and in transit.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};