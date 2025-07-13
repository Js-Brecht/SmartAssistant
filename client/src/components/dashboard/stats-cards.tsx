import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, CheckSquare, Calendar, Bot, TrendingDown, TrendingUp, Clock, Zap } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

interface StatsCardsProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Unread Emails",
      value: stats?.unreadEmails || 0,
      change: stats?.highPriorityEmails || 0,
      changeText: `${stats?.highPriorityEmails || 0} high priority`,
      changeType: stats?.highPriorityEmails ? "down" as const : "neutral" as const,
      icon: Mail,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-primary"
    },
    {
      title: "Pending Tasks",
      value: stats?.pendingTasks || 0,
      change: stats?.urgentTasks || 0,
      changeText: `${stats?.urgentTasks || 0} urgent`,
      changeType: stats?.urgentTasks ? "up" as const : "neutral" as const,
      icon: CheckSquare,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-accent"
    },
    {
      title: "Today's Meetings",
      value: stats?.todayMeetings || 0,
      change: 0,
      changeText: "Next at 2:00 PM",
      changeType: "neutral" as const,
      icon: Calendar,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600"
    },
    {
      title: "AI Drafts Ready",
      value: stats?.aiDrafts || 0,
      change: 0,
      changeText: "Awaiting approval",
      changeType: "neutral" as const,
      icon: Bot,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="stats-card transition-all-smooth hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {card.value}
                  </p>
                  <div className="flex items-center mt-1 text-sm">
                    {card.changeType === "up" && (
                      <TrendingUp className="w-3 h-3 text-red-600 mr-1" />
                    )}
                    {card.changeType === "down" && (
                      <TrendingDown className="w-3 h-3 text-green-600 mr-1" />
                    )}
                    {card.changeType === "neutral" && (
                      <Clock className="w-3 h-3 text-blue-600 mr-1" />
                    )}
                    <span className={
                      card.changeType === "up" ? "text-red-600" :
                      card.changeType === "down" ? "text-green-600" :
                      "text-blue-600"
                    }>
                      {card.changeText}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.iconColor} w-6 h-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
