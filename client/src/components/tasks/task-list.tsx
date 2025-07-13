import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Clock, Edit, Plus, Mail, Calendar, Check } from "lucide-react";
import type { TaskWithSource } from "@/lib/types";

interface TaskListProps {
  tasks: TaskWithSource[];
  isLoading: boolean;
  title?: string;
  showAddButton?: boolean;
}

export default function TaskList({ 
  tasks, 
  isLoading, 
  title = "Tasks",
  showAddButton = false 
}: TaskListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/tasks/${id}`, { 
        status,
        completedAt: status === "completed" ? new Date().toISOString() : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-surface dark:bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
              <Skeleton className="w-4 h-4" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex space-x-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="w-6 h-6" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent": return "status-urgent";
      case "high": return "status-high-priority";
      case "medium": return "status-medium-priority";
      case "low": return "status-low-priority";
      default: return "status-medium-priority";
    }
  };

  const getSourceIcon = (sourceType?: string) => {
    switch (sourceType) {
      case "email": return Mail;
      case "calendar": return Calendar;
      default: return Clock;
    }
  };

  const handleToggleTask = (task: TaskWithSource) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    toggleTaskMutation.mutate({ id: task.id, status: newStatus });
  };

  return (
    <Card className="bg-surface dark:bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks for today</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <>
            {tasks.map((task) => {
              const SourceIcon = getSourceIcon(task.sourceType);
              const isCompleted = task.status === "completed";
              
              return (
                <div 
                  key={task.id} 
                  className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                    isCompleted ? "opacity-60" : ""
                  }`}
                >
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => handleToggleTask(task)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-foreground ${
                      isCompleted ? "line-through" : ""
                    }`}>
                      {task.title}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                      {task.dueDate && (
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Due: {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                        </span>
                      )}
                      
                      <Badge className={`status-badge ${getPriorityBadge(task.priority)}`}>
                        {task.priority === "urgent" ? "Urgent" :
                         task.priority === "high" ? "High Priority" :
                         task.priority === "medium" ? "Medium Priority" :
                         "Low Priority"}
                      </Badge>
                      
                      {task.sourceType && (
                        <span className="flex items-center">
                          <SourceIcon className="w-3 h-3 mr-1" />
                          From: {task.sourceType}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </>
        )}
        
        {showAddButton && (
          <Button 
            variant="outline" 
            className="w-full border-dashed hover:border-primary hover:text-primary"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add new task
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
