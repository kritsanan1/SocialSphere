import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { NotebookPen, Heart, Clock, Link as LinkIcon } from "lucide-react";

interface DashboardStats {
  totalPosts: number;
  totalEngagement: number;
  scheduledPosts: number;
  platformBreakdown: Array<{ platform: string; postCount: number; engagement: number }>;
}

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Posts",
      value: stats?.totalPosts || 0,
      change: "+12% from last month",
      icon: NotebookPen,
      color: "text-[hsl(200,98%,54%)]",
      bgColor: "bg-[hsl(200,98%,54%)]/10",
    },
    {
      title: "Total Engagement",
      value: stats?.totalEngagement ? `${(stats.totalEngagement / 1000).toFixed(1)}K` : "0",
      change: "+8% from last month",
      icon: Heart,
      color: "text-[hsl(329,77%,53%)]",
      bgColor: "bg-[hsl(329,77%,53%)]/10",
    },
    {
      title: "Scheduled Posts",
      value: stats?.scheduledPosts || 0,
      change: stats?.scheduledPosts > 0 ? "Next post in 2 hours" : "No scheduled posts",
      icon: Clock,
      color: "text-[hsl(221,44%,41%)]",
      bgColor: "bg-[hsl(221,44%,41%)]/10",
    },
    {
      title: "Active Platforms",
      value: stats?.platformBreakdown?.length || 0,
      change: "of 13 connected",
      icon: LinkIcon,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${stat.color} text-xl`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
