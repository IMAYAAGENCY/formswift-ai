import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Users,
  Plus,
  Crown,
  Shield,
  UserPlus,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Team {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  member_count?: number;
  role?: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    name: string;
  };
}

const Teams = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  const [newMemberEmail, setNewMemberEmail] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from("teams")
      .select("*, team_members!inner(role)")
      .or(`owner_id.eq.${userData.user.id},team_members.user_id.eq.${userData.user.id}`);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
      return;
    }

    setTeams(data || []);
  };

  const loadTeamMembers = async (teamId: string) => {
    const { data, error } = await supabase
      .from("team_members")
      .select("id, user_id, role, joined_at, team_id")
      .eq("team_id", teamId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
      return;
    }

    // Get user names separately
    const membersWithNames = await Promise.all(
      (data || []).map(async (member) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", member.user_id)
          .single();
        
        return {
          ...member,
          profiles: profile || { name: "Unknown User" }
        };
      })
    );

    setTeamMembers(membersWithNames);
  };

  const handleCreateTeam = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        ...newTeam,
        owner_id: userData.user.id,
      })
      .select()
      .single();

    if (teamError) {
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
      return;
    }

    // Add owner as team member
    await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: userData.user.id,
      role: "owner",
    });

    toast({
      title: "Success",
      description: "Team created successfully!",
    });

    setIsCreateDialogOpen(false);
    loadTeams();
    setNewTeam({ name: "", description: "" });
  };

  const handleAddMember = async () => {
    if (!selectedTeam) return;

    // In a real app, you'd look up user by email
    toast({
      title: "Coming Soon",
      description: "Email invitation feature will be added soon!",
    });
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase.from("team_members").delete().eq("id", memberId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Member removed from team",
    });

    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Team Workspaces
            </h1>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Team Name</Label>
                  <Input
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="My Awesome Team"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newTeam.description}
                    onChange={(e) =>
                      setNewTeam({ ...newTeam, description: e.target.value })
                    }
                    placeholder="What's this team about?"
                  />
                </div>
                <Button onClick={handleCreateTeam} className="w-full">
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold">Your Teams</h3>
            {teams.map((team) => (
              <Card
                key={team.id}
                className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  selectedTeam?.id === team.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTeam(team)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{team.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {team.description}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {team.member_count || 1}
                  </Badge>
                </div>
              </Card>
            ))}
            {teams.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No teams yet. Create one!
              </p>
            )}
          </div>

          {/* Team Details */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
                    <p className="text-muted-foreground">{selectedTeam.description}</p>
                  </div>
                  <Dialog
                    open={isAddMemberDialogOpen}
                    onOpenChange={setIsAddMemberDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Email Address</Label>
                          <Input
                            type="email"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            placeholder="member@example.com"
                          />
                        </div>
                        <Button onClick={handleAddMember} className="w-full">
                          Send Invitation
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getRoleIcon(member.role)}
                          <div>
                            <p className="font-medium">
                              {member.profiles?.name || "User"}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {member.role}
                            </p>
                          </div>
                        </div>
                        {member.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Select a Team</h3>
                <p className="text-muted-foreground">
                  Choose a team from the list to view details and manage members
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teams;