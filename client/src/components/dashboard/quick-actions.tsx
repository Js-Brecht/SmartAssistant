import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarPlus, 
  UserPlus, 
  FolderPlus, 
  Brain,
  Mail,
  Clock
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Schedule Appointment",
      icon: CalendarPlus,
      color: "bg-primary hover:bg-primary/90",
      action: () => console.log("Schedule appointment")
    },
    {
      title: "Add New Contact",
      icon: UserPlus,
      color: "bg-green-600 hover:bg-green-700",
      action: () => console.log("Add contact")
    },
    {
      title: "Create Project",
      icon: FolderPlus,
      color: "bg-orange-600 hover:bg-orange-700",
      action: () => console.log("Create project")
    },
    {
      title: "AI Email Analysis",
      icon: Brain,
      color: "bg-purple-600 hover:bg-purple-700",
      action: () => console.log("AI analysis")
    }
  ];

  return (
    <Card className="bg-surface dark:bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              onClick={action.action}
              className={`w-full ${action.color} text-white transition-all duration-200 hover:scale-[1.02] focus-ring`}
              size="lg"
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="text-left flex-1">{action.title}</span>
            </Button>
          );
        })}
        
        <div className="pt-2 border-t border-border">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 focus-ring"
            >
              <Mail className="w-4 h-4 mr-2" />
              Compose
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 focus-ring"
            >
              <Clock className="w-4 h-4 mr-2" />
              Quick Task
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
