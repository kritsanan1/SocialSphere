import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, Heart, Upload, AlertTriangle } from "lucide-react";

interface PostHistory {
  id: string;
  platform: string;
  status: string;
  postedAt: string;
  content: {
    title: string;
    body: string;
  };
}

export default function RecentActivity() {
  const { data: activities = [], isLoading } = useQuery<PostHistory[]>({
    queryKey: ["/api/post-history"],
    select: (data) => data?.slice(0, 5), // Only show latest 5 activities
  });

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "published":
        return { icon: Check, color: "text-green-600", bgColor: "bg-green-100" };
      case "scheduled":
        return { icon: Clock, color: "text-blue-600", bgColor: "bg-blue-100" };
      case "failed":
        return { icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-100" };
      default:
        return { icon: Upload, color: "text-yellow-600", bgColor: "bg-yellow-100" };
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No recent activity found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity: any, index: number) => {
            const { icon: Icon, color, bgColor } = getActivityIcon(activity.status);
            
            return (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`${color} text-sm`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Post {activity.status} to {activity.platform}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Button variant="ghost" className="w-full mt-4 text-sm text-[hsl(200,98%,54%)] hover:text-[hsl(200,98%,48%)]">
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
}
