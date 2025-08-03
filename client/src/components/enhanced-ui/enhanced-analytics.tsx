import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MobileSidebar from "./mobile-sidebar";
import Sidebar from "@/components/sidebar";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Share2, 
  MessageSquare,
  Download,
  Calendar,
  Target,
  Zap
} from "lucide-react";
import { Link } from "wouter";

interface AnalyticsData {
  platform: string;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalReach: number;
  totalImpressions: number;
  postCount: number;
}

const platformIcons: Record<string, string> = {
  facebook: "📘",
  instagram: "📷", 
  x: "🐦",
  linkedin: "💼",
  tiktok: "🎵",
  youtube: "📺",
  pinterest: "📌",
  reddit: "🔴",
  snapchat: "👻",
  telegram: "✈️",
  threads: "🧵",
  bluesky: "🦋",
  google_business: "🏢"
};

const platformColors: Record<string, string> = {
  facebook: "from-blue-600 to-blue-700",
  instagram: "from-purple-500 to-pink-500",
  x: "from-gray-800 to-gray-900",
  linkedin: "from-blue-600 to-blue-800",
  tiktok: "from-gray-900 to-black",
  youtube: "from-red-500 to-red-600",
  pinterest: "from-red-500 to-red-600",
  reddit: "from-orange-500 to-orange-600",
  snapchat: "from-yellow-400 to-yellow-500",
  telegram: "from-blue-400 to-blue-500",
  threads: "from-gray-700 to-gray-800",
  bluesky: "from-sky-400 to-sky-500",
  google_business: "from-green-500 to-green-600"
};

export default function EnhancedAnalytics() {
  const [timeRange, setTimeRange] = useState("7");
  
  const { data: analytics = [], isLoading } = useQuery<AnalyticsData[]>({
    queryKey: [`/api/analytics/summary?days=${timeRange}`],
    refetchInterval: 30000,
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const calculateTotalEngagement = () => {
    return analytics.reduce((total, platform) => 
      total + (platform.totalLikes || 0) + (platform.totalShares || 0) + (platform.totalComments || 0), 0
    );
  };

  const calculateTotalReach = () => {
    return analytics.reduce((total, platform) => total + (platform.totalReach || 0), 0);
  };

  const calculateTotalImpressions = () => {
    return analytics.reduce((total, platform) => total + (platform.totalImpressions || 0), 0);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getEngagementRate = (platform: AnalyticsData): number => {
    const totalEngagement = platform.totalLikes + platform.totalShares + platform.totalComments;
    return platform.totalReach > 0 ? Math.round((totalEngagement / platform.totalReach) * 100) : 0;
  };

  const summaryMetrics = [
    {
      title: "Total Posts",
      value: dashboardStats?.totalPosts || 0,
      change: "+12%",
      changeType: "positive" as const,
      icon: BarChart3,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Engagement",
      value: formatNumber(calculateTotalEngagement()),
      change: "+18%",
      changeType: "positive" as const,
      icon: Heart,
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Total Reach",
      value: formatNumber(calculateTotalReach()),
      change: "+25%",
      changeType: "positive" as const,
      icon: Eye,
      color: "from-purple-500 to-indigo-500",
    },
    {
      title: "Total Impressions",
      value: formatNumber(calculateTotalImpressions()),
      change: "+15%",
      changeType: "positive" as const,
      icon: Target,
      color: "from-green-500 to-emerald-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex h-screen">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-spin mx-auto flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-medium text-gray-700">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <MobileSidebar />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Analytics
              </h1>
              <Button variant="ghost" size="icon">
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Header */}
          <header className="hidden md:block bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Analytics Dashboard 📊
                </h2>
                <p className="text-gray-600 mt-1">Track your social media performance and insights</p>
              </div>
              <div className="flex items-center space-x-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {summaryMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                          <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            {metric.value}
                          </p>
                          <Badge 
                            variant="default"
                            className="bg-green-100 text-green-800 hover:bg-green-100"
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {metric.change}
                          </Badge>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${metric.color} bg-opacity-10 flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-gray-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Charts and Platform Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Chart */}
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Engagement Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-3" />
                      <p className="text-lg font-medium text-gray-700">Interactive Chart</p>
                      <p className="text-sm text-gray-500">Coming soon with real-time data visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Performance */}
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Platform Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics && analytics.length > 0 ? (
                    analytics.map((platform, index) => {
                      const totalEngagement = (platform.totalLikes || 0) + (platform.totalShares || 0) + (platform.totalComments || 0);
                      const engagementRate = getEngagementRate(platform);
                      
                      return (
                        <div key={index} className="p-4 bg-white/50 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 bg-gradient-to-r ${platformColors[platform.platform] || 'from-gray-500 to-gray-600'} rounded-lg flex items-center justify-center text-white text-lg`}>
                                {platformIcons[platform.platform] || '📱'}
                              </div>
                              <div>
                                <p className="font-semibold capitalize">{platform.platform.replace('_', ' ')}</p>
                                <p className="text-sm text-gray-500">{platform.postCount} posts</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">{formatNumber(totalEngagement)}</p>
                              <p className="text-sm text-gray-500">engagement</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Likes</p>
                              <p className="text-lg font-semibold text-pink-600">{formatNumber(platform.totalLikes || 0)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Shares</p>
                              <p className="text-lg font-semibold text-blue-600">{formatNumber(platform.totalShares || 0)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Comments</p>
                              <p className="text-lg font-semibold text-green-600">{formatNumber(platform.totalComments || 0)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-sm text-gray-600">Engagement Rate</span>
                            <Badge variant="outline" className="font-semibold">
                              {engagementRate}%
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">No analytics data yet</p>
                      <p className="text-sm">Start posting to see performance metrics</p>
                      <Link href="/create">
                        <Button className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                          Create Your First Post
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics Table */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Detailed Platform Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Platform</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Posts</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Reach</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Impressions</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Engagement</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics && analytics.length > 0 ? (
                        analytics.map((platform, index) => {
                          const totalEngagement = (platform.totalLikes || 0) + (platform.totalShares || 0) + (platform.totalComments || 0);
                          const engagementRate = getEngagementRate(platform);
                          
                          return (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 bg-gradient-to-r ${platformColors[platform.platform] || 'from-gray-500 to-gray-600'} rounded-lg flex items-center justify-center text-white`}>
                                    {platformIcons[platform.platform] || '📱'}
                                  </div>
                                  <span className="font-medium capitalize">{platform.platform.replace('_', ' ')}</span>
                                </div>
                              </td>
                              <td className="text-center py-4 px-4 font-semibold">{platform.postCount}</td>
                              <td className="text-center py-4 px-4 font-semibold">{formatNumber(platform.totalReach || 0)}</td>
                              <td className="text-center py-4 px-4 font-semibold">{formatNumber(platform.totalImpressions || 0)}</td>
                              <td className="text-center py-4 px-4 font-semibold">{formatNumber(totalEngagement)}</td>
                              <td className="text-center py-4 px-4">
                                <Badge variant="outline" className="font-semibold">
                                  {engagementRate}%
                                </Badge>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            No data available for the selected time period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}