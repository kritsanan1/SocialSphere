import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/sidebar";
import { Search, Filter, ArrowLeft, ExternalLink, Heart, MessageCircle, Share2, Eye } from "lucide-react";
import { Link } from "wouter";

export default function PostHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: postHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/post-history"],
    enabled: isAuthenticated,
  });

  const platforms = [
    { value: "facebook", label: "Facebook", icon: "📘" },
    { value: "instagram", label: "Instagram", icon: "📷" },
    { value: "x", label: "X/Twitter", icon: "🐦" },
    { value: "linkedin", label: "LinkedIn", icon: "💼" },
    { value: "tiktok", label: "TikTok", icon: "🎵" },
    { value: "youtube", label: "YouTube", icon: "📺" },
    { value: "pinterest", label: "Pinterest", icon: "📌" },
    { value: "reddit", label: "Reddit", icon: "🔴" },
    { value: "snapchat", label: "Snapchat", icon: "👻" },
    { value: "telegram", label: "Telegram", icon: "✈️" },
    { value: "threads", label: "Threads", icon: "🧵" },
    { value: "bluesky", label: "Bluesky", icon: "🦋" },
    { value: "google_business", label: "Google Business", icon: "🏢" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.value === platform);
    return platformData?.icon || "📱";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredHistory = postHistory?.filter((post: any) => {
    const matchesSearch = !searchTerm || 
      post.contentBody?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.contentTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlatform = filterPlatform === "all" || post.platform === filterPlatform;
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;
    
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-r-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post history...</p>
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
                <h2 className="text-2xl font-bold text-gray-900">Post History</h2>
                <p className="text-gray-600">View and analyze your published social media posts</p>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.map(platform => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.icon} {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {historyLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredHistory && filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((post: any) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {getPlatformIcon(post.platform)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 capitalize">
                              {post.platform}
                            </h3>
                            {post.externalPostId && (
                              <Button variant="ghost" size="sm" className="p-0 h-auto">
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {post.postedAt ? formatDate(post.postedAt) : formatDate(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(post.status)}
                      </div>
                    </div>

                    <div className="mb-4">
                      {post.contentTitle && (
                        <h4 className="font-medium text-gray-900 mb-2">{post.contentTitle}</h4>
                      )}
                      <p className="text-gray-700 line-clamp-3">
                        {post.contentBody || "No content available"}
                      </p>
                    </div>

                    {post.status === "failed" && post.errorMessage && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">
                          <strong>Error:</strong> {post.errorMessage}
                        </p>
                      </div>
                    )}

                    {/* Mock engagement metrics - would come from analytics API */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>0</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>0</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share2 className="w-4 h-4" />
                          <span>0</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>0</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {post.id.slice(0, 8)}...
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterPlatform !== "all" || filterStatus !== "all" 
                    ? "No posts match your filters" 
                    : "No post history yet"
                  }
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterPlatform !== "all" || filterStatus !== "all"
                    ? "Try adjusting your search terms or filters"
                    : "Start creating and publishing posts to see your history here"
                  }
                </p>
                {(!searchTerm && filterPlatform === "all" && filterStatus === "all") && (
                  <Link href="/create">
                    <Button className="bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)]">
                      Create Your First Post
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
