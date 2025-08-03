import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { Calendar, Clock, Edit, Trash2, ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";

export default function ScheduledPosts() {
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: scheduledPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/scheduled-posts"],
    enabled: isAuthenticated,
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiRequest("DELETE", `/api/content/${contentId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Scheduled post deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete scheduled post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) {
      return "Overdue";
    } else if (diffInHours < 24) {
      return `In ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.ceil(diffInHours / 24);
      return `In ${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
    }
  };

  const getPlatformIcons = (platforms: string[]) => {
    const iconMap: Record<string, string> = {
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
      google_business: "🏢",
    };
    
    return platforms.map(platform => iconMap[platform] || "📱");
  };

  const getStatusBadge = (scheduledTime: string) => {
    const date = new Date(scheduledTime);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (diffInHours < 2) {
      return <Badge className="bg-orange-500">Publishing Soon</Badge>;
    } else {
      return <Badge variant="secondary">Scheduled</Badge>;
    }
  };

  const filteredPosts = scheduledPosts?.filter((post: any) => {
    if (filterStatus === "all") return true;
    
    const date = new Date(post.scheduledTime);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (filterStatus === "overdue") return diffInHours < 0;
    if (filterStatus === "soon") return diffInHours >= 0 && diffInHours < 24;
    if (filterStatus === "later") return diffInHours >= 24;
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-r-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scheduled posts...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Scheduled Posts</h2>
                <p className="text-gray-600">Manage your upcoming social media posts</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="soon">Publishing Soon</SelectItem>
                  <SelectItem value="later">Publishing Later</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/create">
                <Button className="bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)]">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {postsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex space-x-2">
                          <div className="w-6 h-6 bg-gray-200 rounded"></div>
                          <div className="w-6 h-6 bg-gray-200 rounded"></div>
                        </div>
                        <div className="w-20 h-5 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post: any) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          {getPlatformIcons(post.platforms || []).map((icon, i) => (
                            <span key={i} className="text-lg">{icon}</span>
                          ))}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {post.title || "Untitled Post"}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(post.scheduledTime).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                            <Clock className="w-4 h-4 ml-2" />
                            <span>{formatScheduledTime(post.scheduledTime)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(post.scheduledTime)}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {post.body}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Platforms: {post.platforms?.length || 0}</span>
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                          <span>• {post.mediaUrls.length} media file{post.mediaUrls.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteContentMutation.mutate(post.id)}
                          disabled={deleteContentMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filterStatus === "all" ? "No scheduled posts" : `No ${filterStatus} posts`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {filterStatus === "all" 
                    ? "Schedule your first post to see it here"
                    : "Try adjusting your filter or create a new scheduled post"
                  }
                </p>
                <Link href="/create">
                  <Button className="bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)]">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Your First Post
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
