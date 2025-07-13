import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Mail, Paperclip, Tag, Clock, Zap, Plus } from "lucide-react";
import type { EmailWithAnalysis } from "@/lib/types";

export default function EmailPage() {
  const { data: emails, isLoading } = useQuery({
    queryKey: ["/api/emails"],
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "priority-high";
      case "urgent": return "priority-urgent";
      case "medium": return "priority-medium";
      case "low": return "priority-low";
      default: return "priority-medium";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "status-high-priority";
      case "urgent": return "status-urgent";
      case "medium": return "status-medium-priority";
      case "low": return "status-low-priority";
      default: return "status-medium-priority";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <TopBar title="Email" subtitle="Manage your email communications" />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-3 h-3 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex space-x-4">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Email" 
          subtitle="Manage your email communications"
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {emails?.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">No emails yet</h3>
                <p className="text-muted-foreground">
                  Emails will appear here when they arrive.
                </p>
              </div>
            ) : (
              emails?.map((email: EmailWithAnalysis) => (
                <Card key={email.id} className="email-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`priority-indicator ${getPriorityColor(email.priority)}`} />
                          <span className="text-sm font-medium text-foreground">
                            {email.sender}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(email.receivedAt), { addSuffix: true })}
                          </span>
                          <Badge className={`status-badge ${getPriorityBadge(email.priority)}`}>
                            {email.priority === "urgent" ? "Urgent" : 
                             email.priority === "high" ? "High Priority" :
                             email.priority === "medium" ? "Medium Priority" : 
                             "Low Priority"}
                          </Badge>
                          {!email.isRead && (
                            <Badge variant="default" className="text-xs">
                              Unread
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-medium text-foreground mb-1">
                          {email.subject}
                        </h4>
                        
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {email.aiSummary || email.content.substring(0, 200) + "..."}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {email.category}
                          </span>
                          {email.hasAttachments && (
                            <span className="flex items-center">
                              <Paperclip className="w-3 h-3 mr-1" />
                              {email.attachmentCount} attachments
                            </span>
                          )}
                          {email.responseNeeded && (
                            <span className="flex items-center text-orange-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Response needed
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {email.responseNeeded && (
                          <Button size="sm" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Generate Draft
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="text-xs">
                          <Plus className="w-3 h-3 mr-1" />
                          Create Task
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
