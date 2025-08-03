import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import PlatformSelector from "./platform-selector";
import { Image, Video, Hash, Calendar } from "lucide-react";

export default function QuickCreatePost() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (data: { body: string; platforms: string[] }) => {
      const response = await apiRequest("POST", "/api/content", {
        body: data.body,
        platforms: data.platforms,
        status: "published",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      setContent("");
      setSelectedPlatforms([]);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
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
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Validation Error",
        description: "Post content is required.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      body: content,
      platforms: selectedPlatforms,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Create Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Select Platforms
          </Label>
          <PlatformSelector
            selectedPlatforms={selectedPlatforms}
            onPlatformToggle={handlePlatformToggle}
          />
        </div>

        {/* Content Input */}
        <div>
          <Label htmlFor="content" className="text-sm font-medium text-gray-700 mb-2 block">
            Post Content
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
            placeholder="What's happening? Share your thoughts with the world..."
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">{content.length}/280 characters</span>
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
              <Button variant="ghost" size="sm">
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            onClick={handleSubmit}
            disabled={createPostMutation.isPending}
            className="flex-1 bg-[hsl(200,98%,54%)] hover:bg-[hsl(200,98%,48%)]"
          >
            {createPostMutation.isPending ? "Posting..." : "Post Now"}
          </Button>
          <Button variant="outline">
            Schedule
          </Button>
          <Button variant="outline">
            Save Draft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
