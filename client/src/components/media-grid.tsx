import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Trash2, Download, Copy, Eye, Calendar } from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  fileType: string;
  size: number;
  createdAt: string;
}

interface MediaGridProps {
  media: MediaItem[];
}

export default function MediaGrid({ media }: MediaGridProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const response = await apiRequest("DELETE", `/api/media/${mediaId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Media file deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      setSelectedMedia(null);
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
        description: "Failed to delete media file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    return '📄';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Media URL copied to clipboard!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadMedia = (mediaItem: MediaItem) => {
    const link = document.createElement('a');
    link.href = mediaItem.url;
    link.download = mediaItem.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {media.map((mediaItem) => (
        <div key={mediaItem.id} className="group relative">
          <Dialog>
            <DialogTrigger asChild>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                {mediaItem.fileType.startsWith('image/') ? (
                  <img
                    src={mediaItem.url}
                    alt={mediaItem.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : mediaItem.fileType.startsWith('video/') ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎥</div>
                      <p className="text-xs text-gray-600 px-2 truncate">
                        {mediaItem.originalName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <div className="text-2xl mb-2">{getFileTypeIcon(mediaItem.fileType)}</div>
                      <p className="text-xs text-gray-600 px-2 truncate">
                        {mediaItem.originalName}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <span>{getFileTypeIcon(mediaItem.fileType)}</span>
                  <span className="truncate">{mediaItem.originalName}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Media Preview */}
                <div className="max-h-96 overflow-hidden rounded-lg bg-gray-100">
                  {mediaItem.fileType.startsWith('image/') ? (
                    <img
                      src={mediaItem.url}
                      alt={mediaItem.originalName}
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  ) : mediaItem.fileType.startsWith('video/') ? (
                    <video
                      src={mediaItem.url}
                      controls
                      className="w-full h-auto max-h-96"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{getFileTypeIcon(mediaItem.fileType)}</div>
                        <p className="text-gray-600">Preview not available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Media Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>File Type:</strong>
                    <Badge variant="secondary" className="ml-2">
                      {mediaItem.fileType}
                    </Badge>
                  </div>
                  <div>
                    <strong>File Size:</strong> {formatFileSize(mediaItem.size)}
                  </div>
                  <div>
                    <strong>Upload Date:</strong> {formatDate(mediaItem.createdAt)}
                  </div>
                  <div>
                    <strong>File ID:</strong> {mediaItem.id.slice(0, 8)}...
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(mediaItem.url)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy URL
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadMedia(mediaItem)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMediaMutation.mutate(mediaItem.id)}
                    disabled={deleteMediaMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteMediaMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Quick info overlay */}
          <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="truncate">{mediaItem.originalName}</p>
            <div className="flex items-center justify-between mt-1">
              <span>{formatFileSize(mediaItem.size)}</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(mediaItem.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
