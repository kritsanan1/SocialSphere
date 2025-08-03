import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function UpcomingPosts() {
  const { data: scheduledPosts, isLoading } = useQuery({
    queryKey: ["/api/scheduled-posts"],
    select: (data) => data?.slice(0, 3), // Only show first 3
  });

  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Upcoming Posts</CardTitle>
            <Button variant="ghost" size="sm">
              View Calendar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="flex space-x-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-20 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="flex space-x-2">
                  <div className="w-8 h-3 bg-gray-200 rounded"></div>
                  <div className="w-12 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Upcoming Posts</CardTitle>
          <Link href="/scheduled">
            <Button variant="ghost" size="sm" className="text-[hsl(200,98%,54%)] hover:text-[hsl(200,98%,48%)]">
              View Calendar
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scheduledPosts && scheduledPosts.length > 0 ? (
            scheduledPosts.map((post: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex space-x-2">
                    {getPlatformIcons(post.platforms || []).map((icon, i) => (
                      <span key={i} className="text-sm">{icon}</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {post.scheduledTime ? formatScheduledTime(post.scheduledTime) : "No schedule"}
                  </span>
                </div>
                <p className="text-sm text-gray-900 mb-2 line-clamp-2">
                  {post.body || post.title || "No content preview available"}
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-xs text-[hsl(200,98%,54%)] hover:text-[hsl(200,98%,48%)]">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700">
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No upcoming scheduled posts
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
