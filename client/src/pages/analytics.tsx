import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/sidebar";
import { BarChart3, TrendingUp, Users, Eye } from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30");
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/analytics/summary?days=${timeRange}`],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const calculateTotalEngagement = () => {
    if (!analytics || (analytics as any[]).length === 0) return 0;
    return (analytics as any[]).reduce((total: number, platform: any) => 
      total + (platform.totalLikes || 0) + (platform.totalShares || 0) + (platform.totalComments || 0), 0
    );
  };

  const calculateTotalReach = () => {
    if (!analytics || (analytics as any[]).length === 0) return 0;
    return (analytics as any[]).reduce((total: number, platform: any) => 
      total + (platform.totalReach || 0), 0
    );
  };

  const calculateTotalImpressions = () => {
    if (!analytics || (analytics as any[]).length === 0) return 0;
    return (analytics as any[]).reduce((total: number, platform: any) => 
      total + (platform.totalImpressions || 0), 0
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-r-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              <p className="text-gray-600">Track your social media performance and engagement</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Posts</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardStats?.totalPosts || 0}
                    </p>
                    <p className="text-sm text-green-600">+12% from last period</p>
                  </div>
                  <div className="w-12 h-12 bg-[hsl(200,98%,54%)]/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-[hsl(200,98%,54%)] text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatNumber(calculateTotalEngagement())}
                    </p>
                    <p className="text-sm text-green-600">+8% from last period</p>
                  </div>
                  <div className="w-12 h-12 bg-[hsl(329,77%,53%)]/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-[hsl(329,77%,53%)] text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reach</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatNumber(calculateTotalReach())}
                    </p>
                    <p className="text-sm text-green-600">+15% from last period</p>
                  </div>
                  <div className="w-12 h-12 bg-[hsl(221,44%,41%)]/10 rounded-lg flex items-center justify-center">
                    <Users className="text-[hsl(221,44%,41%)] text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatNumber(calculateTotalImpressions())}
                    </p>
                    <p className="text-sm text-green-600">+22% from last period</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Eye className="text-green-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Engagement chart visualization</p>
                    <p className="text-xs text-gray-400">Chart integration coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics && (analytics as any[]).length > 0 ? (
                    (analytics as any[]).map((platform: any, index: number) => {
                      const totalEngagement = (platform.totalLikes || 0) + (platform.totalShares || 0) + (platform.totalComments || 0);
                      const engagementPercentage = calculateTotalEngagement() > 0 
                        ? Math.round((totalEngagement / calculateTotalEngagement()) * 100)
                        : 0;
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium capitalize">{platform.platform}</span>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatNumber(totalEngagement)}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                {platform.postCount || 0} posts
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[hsl(200,98%,54%)] h-2 rounded-full"
                              style={{ width: `${engagementPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No analytics data available for the selected time period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
