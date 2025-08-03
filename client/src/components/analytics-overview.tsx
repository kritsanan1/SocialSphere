import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3 } from "lucide-react";
import { useState } from "react";

export default function AnalyticsOverview() {
  const [timeRange, setTimeRange] = useState("7");
  
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: [`/api/analytics/summary?days=${timeRange}`],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Analytics Overview</CardTitle>
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
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Analytics Overview</CardTitle>
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
      </CardHeader>
      <CardContent>
        {/* Mock Chart Area */}
        <div className="h-48 bg-gray-50 rounded-lg mb-4 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Engagement Trends Chart</p>
          </div>
        </div>

        {/* Platform Performance */}
        <div className="space-y-3">
          {analytics && analytics.length > 0 ? (
            analytics.map((platform: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium capitalize">{platform.platform}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {platform.totalLikes + platform.totalShares + platform.totalComments}
                  </span>
                  <span className="text-xs text-green-600 ml-1">
                    {platform.postCount} posts
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No analytics data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
