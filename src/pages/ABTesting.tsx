import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, TrendingUp, BarChart3, Plus } from "lucide-react";
import { toast } from "sonner";

const ABTesting = () => {
  const [tests, setTests] = useState([
    {
      id: "1",
      name: "Button Color Test",
      form: "Contact Form",
      variants: ["Original (Blue)", "Variant A (Green)"],
      status: "active",
      views: [1240, 1187],
      conversions: [342, 398],
      conversionRate: [27.6, 33.5],
      confidence: 95,
    },
    {
      id: "2",
      name: "Form Length Test",
      form: "Lead Gen Form",
      variants: ["Original (Long)", "Variant A (Short)"],
      status: "completed",
      views: [2100, 2050],
      conversions: [420, 615],
      conversionRate: [20.0, 30.0],
      confidence: 99,
    },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                A/B Testing
              </h1>
              <p className="text-muted-foreground text-lg">
                Test different form versions to optimize conversions
              </p>
            </div>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Test
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">
                  Currently running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Improvement</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+21.4%</div>
                <p className="text-xs text-muted-foreground">
                  From completed tests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Tests</CardTitle>
              <CardDescription>
                Manage and monitor your A/B tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead>Winner</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => {
                    const winnerIndex = test.conversionRate[0] > test.conversionRate[1] ? 0 : 1;
                    const improvement = Math.abs(test.conversionRate[1] - test.conversionRate[0]);
                    
                    return (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">{test.name}</TableCell>
                        <TableCell>{test.form}</TableCell>
                        <TableCell>
                          <Badge variant={test.status === "active" ? "default" : "secondary"}>
                            {test.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {test.variants.map((variant, idx) => (
                              <div key={idx} className="text-sm">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">{variant}</span>
                                  <span className="text-muted-foreground">
                                    {test.conversionRate[idx]}%
                                  </span>
                                </div>
                                <Progress value={test.conversionRate[idx]} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {test.variants[winnerIndex].split(" ")[0]}
                            </Badge>
                            <span className="text-sm text-green-600">+{improvement.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={test.confidence >= 95 ? "default" : "secondary"}>
                            {test.confidence}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">View</Button>
                            {test.status === "active" && (
                              <Button size="sm" variant="outline">Stop</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

export default ABTesting;