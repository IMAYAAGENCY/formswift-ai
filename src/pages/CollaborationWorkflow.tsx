import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  GitBranch, 
  UserPlus, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Users,
  Plus,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

const CollaborationWorkflow = () => {
  const [workflows, setWorkflows] = useState([
    {
      id: "1",
      name: "Standard Approval",
      steps: ["Initial Review", "Manager Approval", "Final Sign-off"],
      activeSubmissions: 12,
      avgTime: "2.5 days",
    },
    {
      id: "2",
      name: "Express Approval",
      steps: ["Auto-Check", "Quick Review"],
      activeSubmissions: 8,
      avgTime: "4 hours",
    },
  ]);

  const [assignments, setAssignments] = useState([
    {
      id: "1",
      rule: "High Priority Submissions",
      assignTo: "Senior Team",
      condition: "Priority equals High",
      active: true,
    },
    {
      id: "2",
      rule: "Enterprise Leads",
      assignTo: "Sales Manager",
      condition: "Company size > 1000",
      active: true,
    },
  ]);

  const [slaMetrics, setSlaMetrics] = useState({
    onTrack: 145,
    atRisk: 23,
    breached: 7,
    avgResponseTime: "3.2 hours",
    avgResolutionTime: "18 hours",
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Collaboration & Workflow
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage approvals, assignments, and team collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflows.length}</div>
                <p className="text-xs text-muted-foreground">
                  {workflows.reduce((sum, w) => sum + w.activeSubmissions, 0)} active submissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SLA On Track</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{slaMetrics.onTrack}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((slaMetrics.onTrack / (slaMetrics.onTrack + slaMetrics.atRisk + slaMetrics.breached)) * 100)}% success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{slaMetrics.avgResponseTime}</div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt;4 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Active collaborators
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="workflows" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="workflows">Approval Workflows</TabsTrigger>
              <TabsTrigger value="assignments">Assignment Rules</TabsTrigger>
              <TabsTrigger value="sla">SLA Tracking</TabsTrigger>
              <TabsTrigger value="notes">Internal Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Approval Workflows</h2>
                  <p className="text-muted-foreground">Multi-step approval processes</p>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Workflow
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Workflow</CardTitle>
                    <CardDescription>Set up a multi-step approval process</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="workflow-name">Workflow Name</Label>
                      <Input
                        id="workflow-name"
                        placeholder="e.g., Executive Approval Process"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workflow-desc">Description</Label>
                      <Textarea
                        id="workflow-desc"
                        placeholder="Describe when this workflow should be used"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Approval Steps</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input placeholder="Step 1: Initial Review" />
                          <Button variant="outline" size="icon">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Input placeholder="Step 2: Manager Approval" />
                          <Button variant="outline" size="icon">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full">Create Workflow</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Workflows</CardTitle>
                    <CardDescription>Currently configured approval processes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {workflows.map((workflow) => (
                        <div
                          key={workflow.id}
                          className="p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{workflow.name}</h3>
                            <Badge>{workflow.activeSubmissions} active</Badge>
                          </div>
                          <div className="space-y-2 mb-3">
                            {workflow.steps.map((step, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                  {idx + 1}
                                </div>
                                <span className="text-muted-foreground">{step}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              Avg time: {workflow.avgTime}
                            </span>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Edit</Button>
                              <Button size="sm" variant="outline" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Assignment Rules</h2>
                  <p className="text-muted-foreground">Auto-assign submissions to team members</p>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Rule
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Active Assignment Rules</CardTitle>
                  <CardDescription>Automatically route submissions based on conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Assign To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.rule}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {rule.condition}
                            </code>
                          </TableCell>
                          <TableCell>{rule.assignTo}</TableCell>
                          <TableCell>
                            <Badge variant={rule.active ? "default" : "secondary"}>
                              {rule.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Edit</Button>
                              <Button size="sm" variant="outline">Delete</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sla" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">SLA Tracking</h2>
                <p className="text-muted-foreground">Monitor response times and deadlines</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      On Track
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {slaMetrics.onTrack}
                    </div>
                    <Progress value={83} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      83% of total submissions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      At Risk
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {slaMetrics.atRisk}
                    </div>
                    <Progress value={13} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      13% approaching deadline
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Breached
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {slaMetrics.breached}
                    </div>
                    <Progress value={4} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      4% missed deadline
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>SLA Settings</CardTitle>
                  <CardDescription>Configure response and resolution time targets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-response">First Response Time (hours)</Label>
                      <Input
                        id="first-response"
                        type="number"
                        placeholder="4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resolution">Resolution Time (hours)</Label>
                      <Input
                        id="resolution"
                        type="number"
                        placeholder="24"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-hours">Business Hours</Label>
                    <Select>
                      <SelectTrigger id="business-hours">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24x7">24/7 Coverage</SelectItem>
                        <SelectItem value="business">Business Hours Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>Save SLA Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Internal Notes</h2>
                <p className="text-muted-foreground">Team comments and collaboration on submissions</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Notes</CardTitle>
                  <CardDescription>Team discussions on form submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            JD
                          </div>
                          <div>
                            <p className="font-semibold text-sm">John Doe</p>
                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                          </div>
                        </div>
                        <Badge>Internal</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This application looks promising. Let's schedule a follow-up call for next week.
                      </p>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-sm font-medium">
                            SM
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Sarah Miller</p>
                            <p className="text-xs text-muted-foreground">5 hours ago</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Priority</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        High-value lead from enterprise sector. Moving to priority queue.
                      </p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-sm font-medium">
                            MJ
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Mike Johnson</p>
                            <p className="text-xs text-muted-foreground">1 day ago</p>
                          </div>
                        </div>
                        <Badge variant="outline">Resolved</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        All documents verified and approved. Sending confirmation email.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 border rounded-lg">
                    <Label htmlFor="new-note">Add Internal Note</Label>
                    <Textarea
                      id="new-note"
                      placeholder="Add a comment for your team..."
                      className="mt-2"
                      rows={3}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Internal note</span>
                      </div>
                      <Button size="sm">Post Note</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CollaborationWorkflow;