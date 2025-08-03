import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import MobileSidebar from "./mobile-sidebar";
import Sidebar from "@/components/sidebar";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MessageSquare,
  BarChart3,
  Clock,
  Heart,
  Share2,
  Eye,
  Plus,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  totalPosts: number;
  totalEngagement: number;
  scheduledPosts: number;
  platformBreakdown: Array<{ platform: string; postCount: number; engagement: number }>;
}

const platformColors: Record<string, string> = {
  facebook: "bg-blue-600",
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  x: "bg-gray-900",
  linkedin: "bg-blue-700",
  tiktok: "bg-black",
  youtube: "bg-red-600",
  pinterest: "bg-red-500",
  reddit: "bg-orange-600",
  snapchat: "bg-yellow-400",
  telegram: "bg-blue-500",
  threads: "bg-gray-800",
  bluesky: "bg-sky-500",
  google_business: "bg-green-600"
};

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

export default function EnhancedDashboard() {
  const [timeRange, setTimeRange] = useState("7");
  
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000,
  });

  const { data: recentPosts = [] } = useQuery({
    queryKey: ["/api/post-history"],
    select: (data) => data?.slice(0, 5),
  });

  const { data: upcomingPosts = [] } = useQuery({
    queryKey: ["/api/scheduled-posts"],
    select: (data) => data?.slice(0, 3),
  });

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
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-medium text-gray-700">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quickStats = [
    {
      title: "Total Posts",
      value: stats?.totalPosts || 0,
      change: "+12%",
      changeType: "positive",
      icon: BarChart3,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Engagement",
      value: `${((stats?.totalEngagement || 0) / 1000).toFixed(1)}K`,
      change: "+8%",
      changeType: "positive",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Scheduled Posts",
      value: stats?.scheduledPosts || 0,
      change: stats?.scheduledPosts ? "Active" : "None",
      changeType: stats?.scheduledPosts ? "positive" : "neutral",
      icon: Clock,
      color: "from-purple-500 to-indigo-500",
    },
    {
      title: "Active Platforms",
      value: stats?.platformBreakdown?.length || 0,
      change: "of 13 total",
      changeType: "neutral",
      icon: Share2,
      color: "from-green-500 to-emerald-500",
    },
  ];

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
                Dashboard
              </h1>
              <div className="w-10" /> {/* Spacer for alignment */}
            </div>
          </div>

          {/* Header */}
          <header className="hidden md:block bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Welcome back! 👋
                </h2>
                <p className="text-gray-600 mt-1">Here's what's happening with your social media today</p>
              </div>
              <Link href="/create">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                          <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            {stat.value}
                          </p>
                          <div className="flex items-center">
                            <Badge 
                              variant={stat.changeType === "positive" ? "default" : "secondary"}
                              className={`text-xs ${
                                stat.changeType === "positive" 
                                  ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {stat.changeType === "positive" && <ArrowUpRight className="w-3 h-3 mr-1" />}
                              {stat.change}
                            </Badge>
                          </div>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-gray-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Mobile Quick Actions */}
            <div className="md:hidden">
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/create">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Post
                    </Button>
                  </Link>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/analytics">
                      <Button variant="outline" className="w-full">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                    </Link>
                    <Link href="/scheduled">
                      <Button variant="outline" className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Scheduled
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Platform Performance */}
              <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Platform Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats?.platformBreakdown && stats.platformBreakdown.length > 0 ? (
                    stats.platformBreakdown.map((platform, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${platformColors[platform.platform] || 'bg-gray-500'} rounded-lg flex items-center justify-center text-white`}>
                            {platformIcons[platform.platform] || '📱'}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{platform.platform.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-500">{platform.postCount} posts</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{platform.engagement || 0}</p>
                          <p className="text-sm text-gray-500">engagement</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Share2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">No platform data yet</p>
                      <p className="text-sm">Start posting to see performance metrics</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentPosts && recentPosts.length > 0 ? (
                    recentPosts.slice(0, 3).map((post: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white/50 rounded-xl">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {post.content?.title || post.content?.body?.substring(0, 50) + "..."}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 capitalize">
                            {post.platform} • {post.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                  
                  <Link href="/history">
                    <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      View All Activity
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Posts */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Upcoming Posts
                  </CardTitle>
                  <Link href="/scheduled">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      View All
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingPosts && upcomingPosts.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingPosts.map((post: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {post.title || post.body?.substring(0, 60) + "..."}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <p className="text-sm text-gray-500">
                              {new Date(post.scheduledTime).toLocaleDateString()} at{" "}
                              {new Date(post.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="flex space-x-1">
                              {post.platforms?.slice(0, 3).map((platform: string, i: number) => (
                                <span key={i} className="text-xs">
                                  {platformIcons[platform] || '📱'}
                                </span>
                              ))}
                              {post.platforms?.length > 3 && (
                                <span className="text-xs text-gray-500">+{post.platforms.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          Scheduled
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No upcoming posts</p>
                    <p className="text-sm">Schedule posts to see them here</p>
                    <Link href="/create">
                      <Button className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Your First Post
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}