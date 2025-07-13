import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Home,
  Mail,
  Calendar,
  CheckSquare,
  Users,
  FolderKanban,
  Settings
} from "lucide-react";

const navigationItems = [
  { 
    name: "Dashboard", 
    path: "/", 
    icon: Home,
    exact: true
  },
  { 
    name: "Email", 
    path: "/email", 
    icon: Mail,
    badgeKey: "unreadEmails"
  },
  { 
    name: "Calendar", 
    path: "/calendar", 
    icon: Calendar
  },
  { 
    name: "Tasks", 
    path: "/tasks", 
    icon: CheckSquare,
    badgeKey: "urgentTasks"
  },
  { 
    name: "Contacts", 
    path: "/contacts", 
    icon: Users
  },
  { 
    name: "Projects", 
    path: "/projects", 
    icon: FolderKanban
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getBadgeCount = (badgeKey?: string) => {
    if (!badgeKey || !stats) return 0;
    return stats[badgeKey as keyof typeof stats] || 0;
  };

  const getBadgeVariant = (badgeKey?: string) => {
    if (badgeKey === "urgentTasks") return "destructive";
    if (badgeKey === "unreadEmails") return "secondary";
    return "secondary";
  };

  return (
    <aside className="w-64 bg-surface dark:bg-card shadow-lg border-r border-border flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Personal Productivity</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = item.exact 
            ? location === item.path 
            : location.startsWith(item.path) && item.path !== "/";
          
          const badgeCount = getBadgeCount(item.badgeKey);
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={cn(
                "sidebar-link",
                isActive && "sidebar-link-active"
              )}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {badgeCount > 0 && (
                  <Badge 
                    variant={getBadgeVariant(item.badgeKey)}
                    className="ml-auto text-xs"
                  >
                    {badgeCount}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
              alt="User profile" 
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              John Doe
            </p>
            <p className="text-xs text-muted-foreground truncate">
              john@company.com
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
