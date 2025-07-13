import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import TaskList from "@/components/tasks/task-list";
import { CheckSquare } from "lucide-react";

export default function TasksPage() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Tasks" 
          subtitle="Manage your tasks and todos"
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          {tasks?.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
              <p className="text-muted-foreground">
                Tasks will appear here when you create them or they're generated from emails.
              </p>
            </div>
          ) : (
            <TaskList 
              tasks={tasks || []} 
              isLoading={isLoading}
              title="All Tasks"
              showAddButton={true}
            />
          )}
        </div>
      </main>
    </div>
  );
}
