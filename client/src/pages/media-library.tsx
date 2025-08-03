import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import MediaGrid from "@/components/media-grid";
import { Upload, Search, Filter, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function MediaLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dragActive, setDragActive] = useState(false);
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

  const { data: media, isLoading: mediaLoading } = useQuery({
    queryKey: ["/api/media"],
    enabled: isAuthenticated,
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      formData.append('file', files[0]);
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Media uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
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
        description: "Failed to upload media. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadMutation.mutate(e.dataTransfer.files);
    }
  }, [uploadMutation]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files);
    }
  };

  const filteredMedia = media?.filter((item: any) =>
    item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.fileType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-r-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading media library...</p>
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
                <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
                <p className="text-gray-600">Manage your media files and assets</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Upload Area */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-[hsl(200,98%,54%)] bg-[hsl(200,98%,54%)]/5"
                    : "border-gray-300 bg-gray-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop your files here
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse files
                </p>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={uploadMutation.isPending}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outline"
                    disabled={uploadMutation.isPending}
                    className="cursor-pointer"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Browse Files"}
                  </Button>
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  Supported formats: JPG, PNG, GIF, MP4, MOV (Max 10MB)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Media Grid */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Media Files</CardTitle>
                <span className="text-sm text-gray-500">
                  {filteredMedia?.length || 0} files
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {mediaLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : filteredMedia && filteredMedia.length > 0 ? (
                <MediaGrid media={filteredMedia} />
              ) : (
                <div className="text-center py-12">
                  <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? "No media found" : "No media uploaded yet"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? "Try adjusting your search terms"
                      : "Upload your first media file to get started"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
