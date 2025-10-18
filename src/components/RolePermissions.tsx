import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Permission {
  role: string;
  resource: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export const RolePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    loadPermissions();
    loadUserRole();
  }, []);

  const loadPermissions = async () => {
    const { data } = await supabase
      .from('role_permissions')
      .select('*')
      .order('role', { ascending: true });

    if (data) setPermissions(data);
  };

  const loadUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (data) setUserRole(data.role);
  };

  const groupByResource = (perms: Permission[]) => {
    const grouped: Record<string, Permission[]> = {};
    perms.forEach(perm => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm);
    });
    return grouped;
  };

  const groupedPermissions = groupByResource(permissions);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Role-Based Permissions
        </CardTitle>
        <CardDescription>
          Your current role: <Badge>{userRole}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([resource, perms]) => (
            <div key={resource}>
              <h4 className="text-sm font-medium mb-2 capitalize">{resource}</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Create</TableHead>
                    <TableHead className="text-center">Read</TableHead>
                    <TableHead className="text-center">Update</TableHead>
                    <TableHead className="text-center">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perms.map((perm, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium capitalize">{perm.role}</TableCell>
                      <TableCell className="text-center">
                        {perm.can_create ? '✓' : '✗'}
                      </TableCell>
                      <TableCell className="text-center">
                        {perm.can_read ? '✓' : '✗'}
                      </TableCell>
                      <TableCell className="text-center">
                        {perm.can_update ? '✓' : '✗'}
                      </TableCell>
                      <TableCell className="text-center">
                        {perm.can_delete ? '✓' : '✗'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};