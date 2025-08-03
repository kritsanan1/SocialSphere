import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getAyrshareService } from "./services/ayrshare";
import { insertContentSchema, insertMediaSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Content routes
  app.post('/api/content', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contentData = insertContentSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const newContent = await storage.createContent(contentData);

      // If it's scheduled or immediate posting, handle with Ayrshare
      if (contentData.status === 'scheduled' || contentData.status === 'published') {
        const ayrshare = getAyrshareService();
        const postData = {
          post: contentData.body,
          platforms: contentData.platforms,
          mediaUrls: contentData.mediaUrls || [],
          ...(contentData.scheduledTime && {
            scheduleDate: contentData.scheduledTime.toISOString(),
          }),
        };

        const ayrshareResponse = await ayrshare.postContent(postData);

        if (ayrshareResponse.status === 'success' && ayrshareResponse.postIds) {
          // Create social posts for each platform
          for (const [platform, postId] of Object.entries(ayrshareResponse.postIds)) {
            await storage.createSocialPost({
              contentId: newContent.id,
              platform: platform as any,
              externalPostId: postId,
              status: contentData.status,
              postedAt: contentData.status === 'published' ? new Date() : undefined,
            });
          }
        }
      }

      res.json(newContent);
    } catch (error) {
      console.error("Error creating content:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create content" });
      }
    }
  });

  app.get('/api/content', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const content = await storage.getContentByUser(userId, limit);
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.get('/api/content/:id', isAuthenticated, async (req, res) => {
    try {
      const content = await storage.getContent(req.params.id);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.put('/api/content/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = insertContentSchema.partial().parse(req.body);
      const updatedContent = await storage.updateContent(req.params.id, updates);
      if (!updatedContent) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(updatedContent);
    } catch (error) {
      console.error("Error updating content:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update content" });
      }
    }
  });

  app.delete('/api/content/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteContent(req.params.id);
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ message: "Failed to delete content" });
    }
  });

  // Scheduled posts
  app.get('/api/scheduled-posts', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const scheduledContent = await storage.getScheduledContent(limit);
      res.json(scheduledContent);
    } catch (error) {
      console.error("Error fetching scheduled posts:", error);
      res.status(500).json({ message: "Failed to fetch scheduled posts" });
    }
  });

  // Post history
  app.get('/api/post-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 100;
      const history = await storage.getPostHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching post history:", error);
      res.status(500).json({ message: "Failed to fetch post history" });
    }
  });

  // Analytics
  app.get('/api/analytics/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 30;
      const summary = await storage.getAnalyticsSummary(userId, days);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching analytics summary:", error);
      res.status(500).json({ message: "Failed to fetch analytics summary" });
    }
  });

  app.get('/api/analytics/ayrshare', isAuthenticated, async (req, res) => {
    try {
      const ayrshare = getAyrshareService();
      const postId = req.query.postId as string;
      const platform = req.query.platform as string;
      const analytics = await ayrshare.getAnalytics(postId, platform);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching Ayrshare analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Media routes
  app.post('/api/media/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const userId = req.user.claims.sub;
      
      // Upload to Ayrshare first
      const ayrshare = getAyrshareService();
      const uploadResponse = await ayrshare.uploadMedia(req.file.buffer, req.file.originalname);

      if (uploadResponse.status === 'failed') {
        return res.status(500).json({ message: "Failed to upload to Ayrshare", error: uploadResponse.error });
      }

      // Save media record to database
      const mediaData = insertMediaSchema.parse({
        filename: req.file.filename || Date.now().toString(),
        originalName: req.file.originalname,
        url: uploadResponse.url || '',
        fileType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: userId,
      });

      const media = await storage.createMedia(mediaData);
      res.json(media);
    } catch (error) {
      console.error("Error uploading media:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to upload media" });
      }
    }
  });

  app.get('/api/media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const media = await storage.getMediaByUser(userId, limit);
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.delete('/api/media/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteMedia(req.params.id);
      res.json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Ayrshare integration routes
  app.post('/api/ayrshare/post', isAuthenticated, async (req, res) => {
    try {
      const ayrshare = getAyrshareService();
      const result = await ayrshare.postContent(req.body);
      res.json(result);
    } catch (error) {
      console.error("Error posting to Ayrshare:", error);
      res.status(500).json({ message: "Failed to post content" });
    }
  });

  app.get('/api/ayrshare/history', isAuthenticated, async (req, res) => {
    try {
      const ayrshare = getAyrshareService();
      const days = parseInt(req.query.days as string) || 30;
      const history = await ayrshare.getPostHistory(days);
      res.json(history);
    } catch (error) {
      console.error("Error fetching Ayrshare history:", error);
      res.status(500).json({ message: "Failed to fetch post history" });
    }
  });

  app.delete('/api/ayrshare/post/:postId', isAuthenticated, async (req, res) => {
    try {
      const ayrshare = getAyrshareService();
      const { postId } = req.params;
      const { platform } = req.body;
      const result = await ayrshare.deletePost(postId, platform);
      res.json(result);
    } catch (error) {
      console.error("Error deleting Ayrshare post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // User management routes (Admin only)
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // For now, return empty array since we don't have user listing functionality
      res.json([]);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
