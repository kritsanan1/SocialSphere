import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import PlatformSelector from "@/components/platform-selector";
import { ArrowLeft, Image, Video, Hash, Calendar, Save, Send } from "lucide-react";
import { Link } from "wouter";

export default function CreateContent() {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    platforms: [] as string[],
    scheduledTime: "",
    status: "draft" as "draft" | "scheduled" | "published",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createContentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        scheduledTime: data.scheduledTime ? new Date(data.scheduledTime).toISOString() : undefined,
      };
      const response = await apiRequest("POST", "/api/content", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content created successfully!",
      });
      setFormData({
        title: "",
        body: "",
        platforms: [],
        scheduledTime: "",
        status: "draft",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
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
        description: "Failed to create content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(id => id !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleSubmit = (status: "draft" | "scheduled" | "published") => {
    if (!formData.body.trim()) {
      toast({
        title: "Validation Error",
        description: "Content body is required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.platforms.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    if (status === "scheduled" && !formData.scheduledTime) {
      toast({
        title: "Validation Error",
        description: "Please select a schedule time for scheduled posts.",
        variant: "destructive",
      });
      return;
    }

    createContentMutation.mutate({
      ...formData,
      status,
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Content</h2>
              <p className="text-gray-600">Create and schedule content for your social media platforms</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>New Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter a title for your content..."
                  />
                </div>

                {/* Platform Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Select Platforms *
                  </Label>
                  <PlatformSelector
                    selectedPlatforms={formData.platforms}
                    onPlatformToggle={handlePlatformToggle}
                    maxColumns={4}
                  />
                </div>

                {/* Content Body */}
                <div>
                  <Label htmlFor="body">Content *</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    rows={8}
                    className="resize-none"
                    placeholder="Write your content here... Share your thoughts, announcements, or updates with your audience."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">{formData.body.length} characters</span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Image className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Hash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Schedule Time */}
                <div>
                  <Label htmlFor="scheduledTime">Schedule Time (Optional)</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => handleSubmit("published")}
                    disabled={createContentMutation.isPending}
                    className="bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createContentMutation.isPending ? "Publishing..." : "Publish Now"}
                  </Button>
                  
                  <Button
                    onClick={() => handleSubmit("scheduled")}
                    disabled={createContentMutation.isPending || !formData.scheduledTime}
                    variant="outline"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Post
                  </Button>
                  
                  <Button
                    onClick={() => handleSubmit("draft")}
                    disabled={createContentMutation.isPending}
                    variant="outline"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
