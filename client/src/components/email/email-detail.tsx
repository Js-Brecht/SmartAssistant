import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Mail, 
  Clock, 
  Tag, 
  Paperclip, 
  Reply, 
  Plus, 
  Zap,
  Check,
  X,
  Edit,
  Brain,
  User,
  Calendar
} from "lucide-react";
import type { EmailWithAnalysis, AiDraftDetails } from "@/lib/types";

interface EmailDetailProps {
  email: EmailWithAnalysis;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailDetail({ email, isOpen, onClose }: EmailDetailProps) {
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [draftContext, setDraftContext] = useState("");
  const { toast } = useToast();

  const { data: aiDraft, isLoading: draftLoading } = useQuery({
    queryKey: ["/api/ai-drafts", "email", email.id],
    enabled: isOpen && email.responseNeeded,
    queryFn: async () => {
      const drafts = await fetch(`/api/ai-drafts`).then(r => r.json());
      return drafts.find((d: AiDraftDetails) => d.emailId === email.id && d.status === "draft");
    }
  });

  const generateDraftMutation = useMutation({
    mutationFn: async (context: string) => {
      return apiRequest("POST", "/api/ai-drafts/generate", {
        emailId: email.id,
        recipientEmail: email.senderEmail,
        recipientName: email.sender,
        context: context || undefined,
        tone: "professional"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-drafts"] });
      setIsGeneratingDraft(false);
      setDraftContext("");
      toast({
        title: "Draft generated",
        description: "AI has generated a response draft for this email.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate draft response.",
        variant: "destructive",
      });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      return apiRequest("POST", "/api/tasks", {
        title,
        description: `Task created from email: ${email.subject}`,
        priority: email.priority === "high" ? "high" : "medium",
        sourceType: "email",
        sourceId: email.id,
        dueDate: email.priority === "high" ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      setIsCreatingTask(false);
      setTaskTitle("");
      toast({
        title: "Task created",
        description: "A new task has been created from this email.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task from email.",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/emails/${email.id}`, { isRead: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
    },
  });

  const approveDraftMutation = useMutation({
    mutationFn: async (draftId: number) => {
      return apiRequest("PATCH", `/api/ai-drafts/${draftId}`, { 
        status: "approved",
        approvedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-drafts"] });
      toast({
        title: "Draft approved",
        description: "The AI draft has been approved and is ready to send.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve draft.",
        variant: "destructive",
      });
    },
  });

  // Mark as read when opening
  if (isOpen && !email.isRead) {
    markAsReadMutation.mutate();
  }

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

  const handleGenerateDraft = () => {
    generateDraftMutation.mutate(draftContext);
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    createTaskMutation.mutate(taskTitle);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <span className={`priority-indicator ${getPriorityColor(email.priority)}`} />
            <span className="text-lg font-semibold line-clamp-1">
              {email.subject}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{email.sender}</p>
                  <p className="text-sm text-muted-foreground">{email.senderEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className={`status-badge ${getPriorityBadge(email.priority)}`}>
                  {email.priority === "urgent" ? "Urgent" : 
                   email.priority === "high" ? "High Priority" :
                   email.priority === "medium" ? "Medium Priority" : 
                   "Low Priority"}
                </Badge>
                {!email.isRead && (
                  <Badge variant="default">Unread</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {format(new Date(email.receivedAt), "PPp")}
              </span>
              <span className="flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                {email.category}
              </span>
              {email.hasAttachments && (
                <span className="flex items-center">
                  <Paperclip className="w-4 h-4 mr-1" />
                  {email.attachmentCount} attachments
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* AI Summary */}
          {email.aiSummary && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{email.aiSummary}</p>
              </CardContent>
            </Card>
          )}

          {/* Email Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Email Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {email.content}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {email.tags && email.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {email.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Draft Section */}
          {email.responseNeeded && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  AI Response Draft
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiDraft ? (
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Generated Response</span>
                        <Badge className="ai-draft-ready">
                          Confidence: {aiDraft.confidence}%
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-2">Subject: {aiDraft.subject}</p>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {aiDraft.content}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => approveDraftMutation.mutate(aiDraft.id)}
                        disabled={approveDraftMutation.isPending}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve & Send
                      </Button>
                      <Button variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Draft
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isGeneratingDraft ? (
                      <div>
                        <Textarea
                          placeholder="Add context for AI to generate a better response (optional)..."
                          value={draftContext}
                          onChange={(e) => setDraftContext(e.target.value)}
                          rows={3}
                        />
                        <div className="flex space-x-2 mt-3">
                          <Button 
                            onClick={handleGenerateDraft}
                            disabled={generateDraftMutation.isPending}
                            className="flex-1"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            {generateDraftMutation.isPending ? "Generating..." : "Generate Response"}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsGeneratingDraft(false)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => setIsGeneratingDraft(true)}
                        className="w-full"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Generate AI Response
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Task Creation Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create Task from Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCreatingTask ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Enter task title..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleCreateTask}
                      disabled={createTaskMutation.isPending || !taskTitle.trim()}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreatingTask(false);
                        setTaskTitle("");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsCreatingTask(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task from this Email
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
