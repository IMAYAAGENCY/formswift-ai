import { Navbar } from "@/components/Navbar";
import { TwoFactorAuth } from "@/components/TwoFactorAuth";
import { AuditLogs } from "@/components/AuditLogs";
import { DataEncryption } from "@/components/DataEncryption";
import { GDPRCompliance } from "@/components/GDPRCompliance";
import { RolePermissions } from "@/components/RolePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck } from "lucide-react";

const Security = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Security & Compliance
          </h1>
          <p className="text-xl text-muted-foreground">
            Enterprise-grade security features to protect your data
          </p>
        </div>

        <Tabs defaultValue="2fa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="2fa">2FA</TabsTrigger>
            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
            <TabsTrigger value="encryption">Encryption</TabsTrigger>
            <TabsTrigger value="gdpr">GDPR</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="2fa">
            <div className="max-w-2xl mx-auto">
              <TwoFactorAuth />
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="max-w-4xl mx-auto">
              <AuditLogs />
            </div>
          </TabsContent>

          <TabsContent value="encryption">
            <div className="max-w-2xl mx-auto">
              <DataEncryption />
            </div>
          </TabsContent>

          <TabsContent value="gdpr">
            <div className="max-w-2xl mx-auto">
              <GDPRCompliance />
            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <div className="max-w-4xl mx-auto">
              <RolePermissions />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Security;