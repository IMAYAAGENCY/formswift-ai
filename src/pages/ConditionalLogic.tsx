import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const ConditionalLogic = () => {
  const [rules, setRules] = useState([
    {
      id: "1",
      name: "Show Budget Field",
      condition: "If 'Service Type' equals 'Enterprise'",
      action: "Show field 'Budget Range'",
      isActive: true,
    },
    {
      id: "2",
      name: "Hide Phone for Individual",
      condition: "If 'Customer Type' equals 'Individual'",
      action: "Hide field 'Company Name'",
      isActive: true,
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
                Conditional Logic Builder
              </h1>
              <p className="text-muted-foreground text-lg">
                Show/hide fields dynamically based on user responses
              </p>
            </div>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Rule
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Create New Rule</CardTitle>
                <CardDescription>
                  Define conditions and actions for your form fields
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    placeholder="e.g., Show Budget Field"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Condition</Label>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Service Type</SelectItem>
                        <SelectItem value="customer">Customer Type</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="equals" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not-equals">Not Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="greater">Greater Than</SelectItem>
                        <SelectItem value="less">Less Than</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Action</Label>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Show" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="show">Show</SelectItem>
                        <SelectItem value="hide">Hide</SelectItem>
                        <SelectItem value="require">Require</SelectItem>
                        <SelectItem value="optional">Make Optional</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget Range</SelectItem>
                        <SelectItem value="company">Company Name</SelectItem>
                        <SelectItem value="phone">Phone Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full">Create Rule</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Logic Flow Preview
                </CardTitle>
                <CardDescription>
                  Visual representation of your conditional logic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <div className="text-sm font-medium mb-1">Start: Form Load</div>
                    <div className="text-xs text-muted-foreground">All fields visible</div>
                  </div>
                  
                  {rules.map((rule, index) => (
                    <div key={rule.id} className="border-l-4 border-purple-500 pl-4 py-2">
                      <div className="text-sm font-medium mb-1">Rule {index + 1}: {rule.name}</div>
                      <div className="text-xs text-muted-foreground mb-1">{rule.condition}</div>
                      <div className="text-xs text-purple-600 font-medium">{rule.action}</div>
                    </div>
                  ))}
                  
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="text-sm font-medium mb-1">End: Form Submit</div>
                    <div className="text-xs text-muted-foreground">Process visible fields only</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Rules</CardTitle>
              <CardDescription>
                Manage your conditional logic rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">If:</span> {rule.condition}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Then:</span> {rule.action}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        {rule.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConditionalLogic;