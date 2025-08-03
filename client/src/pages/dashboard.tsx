import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import QuickCreatePost from "@/components/quick-create-post";
import RecentActivity from "@/components/recent-activity";
import AnalyticsOverview from "@/components/analytics-overview";
import UpcomingPosts from "@/components/upcoming-posts";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import { Link } from "wouter";

import EnhancedDashboard from "@/components/enhanced-ui/enhanced-dashboard";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-spin mx-auto flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">Loading your dashboard...</p>
            <p className="text-sm text-gray-500">Please wait while we prepare everything</p>
          </div>
        </div>
      </div>
    );
  }

  return <EnhancedDashboard />;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-600">Manage your social media presence across all platforms</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/create">
                <Button className="bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </Link>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <QuickCreatePost />
            </div>
            <div>
              <RecentActivity />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsOverview />
            <UpcomingPosts />
          </div>
        </main>
      </div>
    </div>
  );
}
