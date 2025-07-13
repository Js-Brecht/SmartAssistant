import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import StatsCards from "@/components/dashboard/stats-cards";
import PriorityEmails from "@/components/email/priority-emails";
import TaskList from "@/components/tasks/task-list";
import Schedule from "@/components/calendar/schedule";
import AiDrafts from "@/components/email/ai-drafts";
import QuickActions from "@/components/dashboard/quick-actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: priorityEmails, isLoading: emailsLoading } = useQuery({
    queryKey: ["/api/emails/priority/high"],
  });

  const { data: todayTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks/today"],
  });

  const { data: todayEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/calendar/events/today"],
  });

  const { data: aiDrafts, isLoading: draftsLoading } = useQuery({
    queryKey: ["/api/ai-drafts/status/draft"],
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Dashboard"
          subtitle="Welcome back! Here's what needs your attention."
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Priority Alert */}
          {stats?.urgentTasks > 0 && (
            <div className="mb-6">
              <div className="gradient-border p-4 rounded-lg shadow-lg">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-exclamation-triangle text-xl"></i>
                    <div>
                      <h3 className="font-semibold">
                        Urgent: {stats.urgentTasks} tasks need immediate attention
                      </h3>
                      <p className="text-orange-100">
                        Review your urgent tasks and update priorities as needed
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:text-orange-200"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <StatsCards stats={stats} isLoading={statsLoading} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Priority Emails & Tasks Column */}
            <div className="lg:col-span-2 space-y-6">
              <PriorityEmails 
                emails={priorityEmails || []} 
                isLoading={emailsLoading} 
              />
              <TaskList 
                tasks={todayTasks || []} 
                isLoading={tasksLoading}
                title="Today's Tasks"
                showAddButton={true}
              />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <Schedule 
                events={todayEvents || []} 
                isLoading={eventsLoading} 
              />
              <AiDrafts 
                drafts={aiDrafts || []} 
                isLoading={draftsLoading} 
              />
              <QuickActions />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-all duration-200 z-50"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
