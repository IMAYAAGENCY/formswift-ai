import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, UserPlus, TrendingUp, Activity } from "lucide-react";

const ProgressiveProfiling = () => {
  const profiles = [
    {
      id: "1",
      email: "john.doe@example.com",
      name: "John Doe",
      completion: 75,
      interactions: 3,
      lastSeen: "2 hours ago",
      fields: ["Name", "Email", "Phone", "Company"],
    },
    {
      id: "2",
      email: "sarah.smith@company.com",
      name: "Sarah Smith",
      completion: 50,
      interactions: 2,
      lastSeen: "1 day ago",
      fields: ["Name", "Email"],
    },
    {
      id: "3",
      email: "mike.johnson@startup.io",
      name: "Mike Johnson",
      completion: 100,
      interactions: 5,
      lastSeen: "Just now",
      fields: ["Name", "Email", "Phone", "Company", "Role", "Team Size"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Progressive Profiling
            </h1>
            <p className="text-muted-foreground text-lg">
              Build complete user profiles over multiple interactions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Active profiles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">75%</div>
                <p className="text-xs text-muted-foreground">
                  Profile completeness
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New This Week</CardTitle>
                <UserPlus className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">12</div>
                <p className="text-xs text-muted-foreground">
                  +18% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrichment Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">85%</div>
                <p className="text-xs text-muted-foreground">
                  Data quality score
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How Progressive Profiling Works</CardTitle>
              <CardDescription>
                Gradually collect user information across multiple interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    1
                  </div>
                  <h3 className="font-semibold">First Interaction</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask for essential information only (e.g., name and email)
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    2
                  </div>
                  <h3 className="font-semibold">Subsequent Visits</h3>
                  <p className="text-sm text-muted-foreground">
                    Request additional details (company, role, preferences)
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    3
                  </div>
                  <h3 className="font-semibold">Complete Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Build a rich, complete user profile without overwhelming users
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Profiles</CardTitle>
              <CardDescription>
                Track and manage progressive user profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead>Interactions</TableHead>
                    <TableHead>Collected Fields</TableHead>
                    <TableHead>Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.name}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={profile.completion} className="w-20 h-2" />
                          <span className="text-sm text-muted-foreground">
                            {profile.completion}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{profile.interactions}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {profile.fields.map((field, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {profile.lastSeen}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProgressiveProfiling;