import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { CalendarEventDetails } from "@/lib/types";

interface ScheduleProps {
  events: CalendarEventDetails[];
  isLoading: boolean;
}

export default function Schedule({ events, isLoading }: ScheduleProps) {
  if (isLoading) {
    return (
      <Card className="bg-surface dark:bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today's Schedule</CardTitle>
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-12 text-center">
                <Skeleton className="h-4 w-8 mx-auto" />
                <Skeleton className="h-3 w-6 mx-auto mt-1" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="border-l-4 border-gray-300 p-3 rounded-r-lg">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2 mb-2" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getEventStyling = (priority: string) => {
    switch (priority) {
      case "high":
        return "meeting-urgent";
      case "medium":
        return "meeting-normal";
      case "low":
        return "meeting-low";
      default:
        return "meeting-normal";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high": return "Critical";
      case "medium": return "Normal";
      case "low": return "Low";
      default: return "Normal";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "status-critical";
      case "medium": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  const getDuration = (startTime: Date, endTime: Date) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  return (
    <Card className="bg-surface dark:bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
          <Link href="/calendar">
            <Button variant="ghost" size="sm">
              View Calendar
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No events scheduled for today</p>
            <p className="text-sm">Enjoy your free time!</p>
          </div>
        ) : (
          <>
            {events.slice(0, 3).map((event) => {
              const startTime = new Date(event.startTime);
              const endTime = new Date(event.endTime);
              
              return (
                <div key={event.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-12 text-center">
                    <div className="text-sm font-medium text-foreground">
                      {format(startTime, "H:mm")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(startTime, "a").toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`p-3 rounded-r-lg ${getEventStyling(event.priority)}`}>
                      <p className="font-medium text-foreground line-clamp-1">
                        {event.title}
                      </p>
                      
                      {event.location && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={`status-badge ${getPriorityBadge(event.priority)}`}>
                          {getPriorityLabel(event.priority)}
                        </Badge>
                        
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {getDuration(startTime, endTime)}
                        </span>
                        
                        {event.isRecurring && (
                          <Badge variant="outline" className="text-xs">
                            Recurring
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {events.length > 3 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm">
                  {events.length - 3} more events today
                </p>
                <Link href="/calendar">
                  <Button variant="ghost" size="sm" className="mt-1">
                    View full schedule
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
