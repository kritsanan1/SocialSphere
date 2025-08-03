import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { insertContentSchema } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import MobileSidebar from "./mobile-sidebar";
import Sidebar from "@/components/sidebar";
import { 
  Calendar,
  Clock,
  Image as ImageIcon,
  Send,
  Save,
  Sparkles,
  Wand2,
  Eye,
  Plus,
  X,
  Upload
} from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";

const platforms = [
  { id: "facebook", name: "Facebook", icon: "📘", color: "bg-blue-600" },
  { id: "instagram", name: "Instagram", icon: "📷", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { id: "x", name: "X (Twitter)", icon: "🐦", color: "bg-gray-900" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "bg-blue-700" },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "bg-black" },
  { id: "youtube", name: "YouTube", icon: "📺", color: "bg-red-600" },
  { id: "pinterest", name: "Pinterest", icon: "📌", color: "bg-red-500" },
  { id: "reddit", name: "Reddit", icon: "🔴", color: "bg-orange-600" },
  { id: "snapchat", name: "Snapchat", icon: "👻", color: "bg-yellow-400" },
  { id: "telegram", name: "Telegram", icon: "✈️", color: "bg-blue-500" },
  { id: "threads", name: "Threads", icon: "🧵", color: "bg-gray-800" },
  { id: "bluesky", name: "Bluesky", icon: "🦋", color: "bg-sky-500" },
  { id: "google_business", name: "Google Business", icon: "🏢", color: "bg-green-600" },
];

const formSchema = insertContentSchema.extend({
  scheduledTime: z.string().optional(),
  postNow: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export default function EnhancedCreateContent() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
      platforms: [],
      postNow: false,
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        platforms: selectedPlatforms,
        scheduledTime: data.postNow ? undefined : data.scheduledTime,
      };
      return apiRequest("POST", "/api/content", payload);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your content has been created successfully.",
      });
      form.reset();
      setSelectedPlatforms([]);
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

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const selectAllPlatforms = () => {
    setSelectedPlatforms(platforms.map(p => p.id));
  };

  const clearAllPlatforms = () => {
    setSelectedPlatforms([]);
  };

  const generateAISuggestion = () => {
    const suggestions = [
      "🚀 Exciting news! We're launching something amazing this week. Stay tuned for the big reveal!",
      "💡 Pro tip: The best time to start working on your goals is right now. What's your next move?",
      "🌟 Behind the scenes: Here's what we've been working on to make your experience even better.",
      "🔥 This week's motivation: Every expert was once a beginner. Keep pushing forward!",
      "✨ Quick reminder: Small steps every day lead to big results over time.",
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    form.setValue("body", randomSuggestion);
  };

  const onSubmit = (data: FormData) => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No platforms selected",
        description: "Please select at least one platform to post to.",
        variant: "destructive",
      });
      return;
    }
    createContentMutation.mutate(data);
  };

  const characterCount = form.watch("body")?.length || 0;
  const maxCharacters = 280; // Twitter limit as reference

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
                Create Content
              </h1>
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Header */}
          <header className="hidden md:block bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Create New Content ✨
                </h2>
                <p className="text-gray-600 mt-1">Share your story across all social platforms</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="border-gray-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {previewMode ? "Edit" : "Preview"}
                </Button>
                <Link href="/">
                  <Button variant="ghost">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {previewMode ? (
                    /* Preview Mode */
                    <Card className="card-enhanced">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Eye className="w-5 h-5 mr-2" />
                          Content Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Preview for each selected platform */}
                        {selectedPlatforms.map((platformId) => {
                          const platform = platforms.find(p => p.id === platformId);
                          if (!platform) return null;
                          
                          return (
                            <div key={platformId} className="border rounded-xl p-4 space-y-3">
                              <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                                  {platform.icon}
                                </div>
                                <span className="font-semibold">{platform.name}</span>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4">
                                {form.watch("title") && (
                                  <h3 className="font-semibold mb-2">{form.watch("title")}</h3>
                                )}
                                <p className="text-gray-800 whitespace-pre-wrap">
                                  {form.watch("body") || "No content yet..."}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        
                        {selectedPlatforms.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Select platforms to see preview</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    /* Edit Mode */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Content Form */}
                      <div className="lg:col-span-2 space-y-6">
                        <Card className="card-enhanced">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className="flex items-center">
                                <Sparkles className="w-5 h-5 mr-2" />
                                Content Details
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={generateAISuggestion}
                                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                              >
                                <Wand2 className="w-4 h-4 mr-1" />
                                AI Suggest
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title (Optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Give your post a catchy title..." 
                                      className="text-lg"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="body"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center justify-between">
                                    <span>Content</span>
                                    <span className={`text-sm ${characterCount > maxCharacters ? 'text-red-500' : 'text-gray-500'}`}>
                                      {characterCount}/{maxCharacters}
                                    </span>
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="What's on your mind? Share your story..."
                                      className="min-h-32 text-base leading-relaxed"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Media Upload (Future Enhancement) */}
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-500 mb-2">Add media to your post</p>
                              <Button variant="outline" size="sm" disabled>
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Upload Media (Coming Soon)
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Scheduling */}
                        <Card className="card-enhanced">
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Calendar className="w-5 h-5 mr-2" />
                              Publishing Options
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Tabs defaultValue="now" className="space-y-4">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="now">Post Now</TabsTrigger>
                                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="now" className="space-y-4">
                                <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg">
                                  <Send className="w-5 h-5 text-green-600" />
                                  <div>
                                    <p className="font-medium text-green-800">Post Immediately</p>
                                    <p className="text-sm text-green-600">Your content will be published right away</p>
                                  </div>
                                </div>
                                <FormField
                                  control={form.control}
                                  name="postNow"
                                  render={({ field }) => (
                                    <FormItem className="hidden">
                                      <FormControl>
                                        <input 
                                          type="hidden" 
                                          value={field.value ? "true" : "false"}
                                          onChange={(e) => field.onChange(e.target.value === "true")}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </TabsContent>
                              
                              <TabsContent value="schedule" className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="scheduledTime"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Schedule for later</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="datetime-local"
                                          min={new Date().toISOString().slice(0, 16)}
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Platform Selection */}
                      <div className="space-y-6">
                        <Card className="card-enhanced">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>Select Platforms</CardTitle>
                              <div className="space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={selectAllPlatforms}
                                >
                                  All
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={clearAllPlatforms}
                                >
                                  Clear
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {selectedPlatforms.length} of {platforms.length} platforms selected
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 gap-3">
                              {platforms.map((platform) => (
                                <div
                                  key={platform.id}
                                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                    selectedPlatforms.includes(platform.id)
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                  }`}
                                  onClick={() => togglePlatform(platform.id)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                                      {platform.icon}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium">{platform.name}</p>
                                    </div>
                                    {selectedPlatforms.includes(platform.id) && (
                                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <Card className="card-enhanced">
                          <CardContent className="p-4 space-y-3">
                            <Button
                              type="submit"
                              disabled={createContentMutation.isPending}
                              className="w-full btn-gradient"
                            >
                              {createContentMutation.isPending ? (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                  Creating...
                                </div>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Create & Publish
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              disabled
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save as Draft (Coming Soon)
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}