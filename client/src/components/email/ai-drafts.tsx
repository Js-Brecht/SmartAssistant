import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit, Zap } from "lucide-react";
import type { AiDraftDetails } from "@/lib/types";

interface AiDraftsProps {
  drafts: AiDraftDetails[];
  isLoading: boolean;
}

export default function AiDrafts({ drafts, isLoading }: AiDraftsProps) {
  if (isLoading) {
    return (
      <Card className="bg-surface dark:bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI Drafts</CardTitle>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface dark:bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">AI Drafts</CardTitle>
          <Badge className="ai-draft-ready">
            {drafts.length} Ready
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {drafts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No AI drafts ready</p>
            <p className="text-sm">Drafts will appear here when emails need responses</p>
          </div>
        ) : (
          <>
            {drafts.slice(0, 2).map((draft) => (
              <div key={draft.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm line-clamp-1">
                      {draft.subject}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      To: {draft.recipientName || draft.recipientEmail}
                    </p>
                  </div>
                  <Badge className="ai-draft-ready">Ready</Badge>
                </div>
                
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                  {draft.content.substring(0, 100)}...
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Confidence: {draft.confidence}%
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm">
                      <Eye className="w-3 h-3 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full border-dashed hover:border-primary hover:text-primary"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate more drafts
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
