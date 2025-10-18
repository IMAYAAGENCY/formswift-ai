import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, Calendar, MessageSquare, Lightbulb } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const services = [
  {
    title: "Form Optimization",
    description: "Improve conversion rates and user experience",
    icon: CheckCircle2,
    features: [
      "Conversion rate analysis",
      "UX/UI improvements",
      "A/B testing strategy",
      "Performance optimization",
    ],
  },
  {
    title: "Integration Consulting",
    description: "Seamless integration with your existing systems",
    icon: Lightbulb,
    features: [
      "API integration setup",
      "Workflow automation",
      "Data migration assistance",
      "Custom solutions",
    ],
  },
  {
    title: "Training & Support",
    description: "Get your team up to speed quickly",
    icon: MessageSquare,
    features: [
      "One-on-one training sessions",
      "Team workshops",
      "Best practices guide",
      "Ongoing support",
    ],
  },
];

export default function Consulting() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    service_type: "",
    company_name: "",
    contact_email: "",
    contact_phone: "",
    message: "",
    budget_range: "",
    preferred_start_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a consulting request",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("consulting_requests").insert([
        {
          user_id: user.id,
          ...formData,
          preferred_start_date: formData.preferred_start_date
            ? new Date(formData.preferred_start_date).toISOString()
            : null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your consulting request has been submitted. We'll get back to you soon!",
      });

      setFormData({
        service_type: "",
        company_name: "",
        contact_email: "",
        contact_phone: "",
        message: "",
        budget_range: "",
        preferred_start_date: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Consulting Services</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert guidance to optimize your forms and maximize conversions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.title}>
                <CardHeader>
                  <Icon className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request a Consultation</CardTitle>
            <CardDescription>
              Fill out the form below and our experts will get back to you within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_type">Service Type *</Label>
                  <Select
                    value={formData.service_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, service_type: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="optimization">Form Optimization</SelectItem>
                      <SelectItem value="integration">Integration Consulting</SelectItem>
                      <SelectItem value="training">Training & Support</SelectItem>
                      <SelectItem value="custom">Custom Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone Number</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_range">Budget Range</Label>
                  <Select
                    value={formData.budget_range}
                    onValueChange={(value) =>
                      setFormData({ ...formData, budget_range: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< $5,000">&lt; $5,000</SelectItem>
                      <SelectItem value="$5,000 - $10,000">$5,000 - $10,000</SelectItem>
                      <SelectItem value="$10,000 - $25,000">$10,000 - $25,000</SelectItem>
                      <SelectItem value="$25,000+">&gt; $25,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_start_date">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Preferred Start Date
                  </Label>
                  <Input
                    id="preferred_start_date"
                    type="date"
                    value={formData.preferred_start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, preferred_start_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Project Details *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Tell us about your project, goals, and any specific requirements..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" size="lg" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
