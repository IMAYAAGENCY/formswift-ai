import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Users, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserPresence {
  user_id: string;
  name: string;
  cursor_x: number;
  cursor_y: number;
  color: string;
}

export default function Collaboration() {
  const [roomId] = useState("form-editing-room");
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [sharedText, setSharedText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase.channel(roomId);

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.values(state)
          .flat()
          .filter(p => 'user_id' in p && 'name' in p) as any as UserPresence[];
        setActiveUsers(users);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        toast({
          title: "User Joined",
          description: `${newPresences.length} user(s) joined the session`,
        });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        toast({
          title: "User Left",
          description: `${leftPresences.length} user(s) left the session`,
        });
      })
      .on("broadcast", { event: "text-update" }, ({ payload }) => {
        setSharedText(payload.text);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({
              user_id: user.id,
              name: user.email?.split("@")[0] || "Anonymous",
              cursor_x: 0,
              cursor_y: 0,
              color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, toast]);

  const updateText = (text: string) => {
    setSharedText(text);
    const channel = supabase.channel(roomId);
    channel.send({
      type: "broadcast",
      event: "text-update",
      payload: { text },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Real-time Collaboration</h1>
          <p className="text-muted-foreground">Edit forms together with your team in real-time</p>
        </div>

        <div className="grid md:grid-cols-[1fr,300px] gap-6">
          {/* Main Editor */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-semibold">Collaborative Editor</span>
            </div>
            <textarea
              value={sharedText}
              onChange={(e) => updateText(e.target.value)}
              className="w-full h-96 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Start typing... Changes will sync in real-time with all users"
            />
          </Card>

          {/* Active Users Panel */}
          <Card className="p-6 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5" />
              <span className="font-semibold">Active Users ({activeUsers.length})</span>
            </div>
            <div className="space-y-3">
              {activeUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No other users online</p>
              ) : (
                activeUsers.map((user, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8" style={{ backgroundColor: user.color }}>
                      <AvatarFallback className="text-white">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                    </div>
                    <Circle className="h-2 w-2 fill-success text-success" />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
