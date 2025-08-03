import {
  users,
  content,
  socialPosts,
  analytics,
  media,
  type User,
  type UpsertUser,
  type Content,
  type InsertContent,
  type SocialPost,
  type InsertSocialPost,
  type Analytics,
  type InsertAnalytics,
  type Media,
  type InsertMedia,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Content operations
  createContent(contentData: InsertContent): Promise<Content>;
  getContent(id: string): Promise<Content | undefined>;
  getContentByUser(userId: string, limit?: number): Promise<Content[]>;
  updateContent(id: string, updates: Partial<InsertContent>): Promise<Content | undefined>;
  deleteContent(id: string): Promise<void>;
  getScheduledContent(limit?: number): Promise<Content[]>;

  // Social posts operations
  createSocialPost(postData: InsertSocialPost): Promise<SocialPost>;
  getSocialPost(id: string): Promise<SocialPost | undefined>;
  getSocialPostsByContent(contentId: string): Promise<SocialPost[]>;
  updateSocialPost(id: string, updates: Partial<InsertSocialPost>): Promise<SocialPost | undefined>;
  getPostHistory(userId?: string, limit?: number): Promise<SocialPost[]>;

  // Analytics operations
  createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics>;
  getAnalyticsByPost(socialPostId: string): Promise<Analytics | undefined>;
  getAnalyticsSummary(userId?: string, days?: number): Promise<any>;

  // Media operations
  createMedia(mediaData: InsertMedia): Promise<Media>;
  getMedia(id: string): Promise<Media | undefined>;
  getMediaByUser(userId: string, limit?: number): Promise<Media[]>;
  deleteMedia(id: string): Promise<void>;

  // Dashboard operations
  getDashboardStats(userId?: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Content operations
  async createContent(contentData: InsertContent): Promise<Content> {
    const [newContent] = await db
      .insert(content)
      .values(contentData)
      .returning();
    return newContent;
  }

  async getContent(id: string): Promise<Content | undefined> {
    const [contentItem] = await db
      .select()
      .from(content)
      .where(eq(content.id, id));
    return contentItem;
  }

  async getContentByUser(userId: string, limit = 50): Promise<Content[]> {
    return await db
      .select()
      .from(content)
      .where(eq(content.createdBy, userId))
      .orderBy(desc(content.createdAt))
      .limit(limit);
  }

  async updateContent(id: string, updates: Partial<InsertContent>): Promise<Content | undefined> {
    const [updatedContent] = await db
      .update(content)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(content.id, id))
      .returning();
    return updatedContent;
  }

  async deleteContent(id: string): Promise<void> {
    await db.delete(content).where(eq(content.id, id));
  }

  async getScheduledContent(limit = 50): Promise<Content[]> {
    const now = new Date();
    return await db
      .select()
      .from(content)
      .where(
        and(
          eq(content.status, 'scheduled'),
          gte(content.scheduledTime, now)
        )
      )
      .orderBy(content.scheduledTime)
      .limit(limit);
  }

  // Social posts operations
  async createSocialPost(postData: InsertSocialPost): Promise<SocialPost> {
    const [newPost] = await db
      .insert(socialPosts)
      .values(postData)
      .returning();
    return newPost;
  }

  async getSocialPost(id: string): Promise<SocialPost | undefined> {
    const [post] = await db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.id, id));
    return post;
  }

  async getSocialPostsByContent(contentId: string): Promise<SocialPost[]> {
    return await db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.contentId, contentId))
      .orderBy(desc(socialPosts.createdAt));
  }

  async updateSocialPost(id: string, updates: Partial<InsertSocialPost>): Promise<SocialPost | undefined> {
    const [updatedPost] = await db
      .update(socialPosts)
      .set(updates)
      .where(eq(socialPosts.id, id))
      .returning();
    return updatedPost;
  }

  async getPostHistory(userId?: string, limit = 100): Promise<SocialPost[]> {
    let query = db
      .select({
        id: socialPosts.id,
        contentId: socialPosts.contentId,
        platform: socialPosts.platform,
        externalPostId: socialPosts.externalPostId,
        status: socialPosts.status,
        postedAt: socialPosts.postedAt,
        errorMessage: socialPosts.errorMessage,
        createdAt: socialPosts.createdAt,
        contentBody: content.body,
        contentTitle: content.title,
      })
      .from(socialPosts)
      .leftJoin(content, eq(socialPosts.contentId, content.id))
      .orderBy(desc(socialPosts.createdAt))
      .limit(limit);

    if (userId) {
      query = query.where(eq(content.createdBy, userId)) as any;
    }

    return await query as any;
  }

  // Analytics operations
  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [newAnalytics] = await db
      .insert(analytics)
      .values(analyticsData)
      .returning();
    return newAnalytics;
  }

  async getAnalyticsByPost(socialPostId: string): Promise<Analytics | undefined> {
    const [analyticsData] = await db
      .select()
      .from(analytics)
      .where(eq(analytics.socialPostId, socialPostId));
    return analyticsData;
  }

  async getAnalyticsSummary(userId?: string, days = 30): Promise<any> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    let query = db
      .select({
        platform: socialPosts.platform,
        totalLikes: sql<number>`sum(${analytics.likes})`,
        totalShares: sql<number>`sum(${analytics.shares})`,
        totalComments: sql<number>`sum(${analytics.comments})`,
        totalReach: sql<number>`sum(${analytics.reach})`,
        totalImpressions: sql<number>`sum(${analytics.impressions})`,
        totalClicks: sql<number>`sum(${analytics.clicks})`,
        postCount: sql<number>`count(*)`,
      })
      .from(analytics)
      .leftJoin(socialPosts, eq(analytics.socialPostId, socialPosts.id))
      .leftJoin(content, eq(socialPosts.contentId, content.id))
      .where(gte(analytics.updatedAt, dateThreshold))
      .groupBy(socialPosts.platform);

    if (userId) {
      query = query.where(eq(content.createdBy, userId)) as any;
    }

    return await query;
  }

  // Media operations
  async createMedia(mediaData: InsertMedia): Promise<Media> {
    const [newMedia] = await db
      .insert(media)
      .values(mediaData)
      .returning();
    return newMedia;
  }

  async getMedia(id: string): Promise<Media | undefined> {
    const [mediaItem] = await db
      .select()
      .from(media)
      .where(eq(media.id, id));
    return mediaItem;
  }

  async getMediaByUser(userId: string, limit = 50): Promise<Media[]> {
    return await db
      .select()
      .from(media)
      .where(eq(media.uploadedBy, userId))
      .orderBy(desc(media.createdAt))
      .limit(limit);
  }

  async deleteMedia(id: string): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  // Dashboard operations
  async getDashboardStats(userId?: string): Promise<any> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 30);

    // Get total posts
    let totalPostsQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(content);
    
    if (userId) {
      totalPostsQuery = totalPostsQuery.where(eq(content.createdBy, userId)) as any;
    }

    // Get total engagement
    let totalEngagementQuery = db
      .select({
        totalEngagement: sql<number>`sum(${analytics.likes} + ${analytics.shares} + ${analytics.comments})`,
      })
      .from(analytics)
      .leftJoin(socialPosts, eq(analytics.socialPostId, socialPosts.id))
      .leftJoin(content, eq(socialPosts.contentId, content.id))
      .where(gte(analytics.updatedAt, dateThreshold));

    if (userId) {
      totalEngagementQuery = totalEngagementQuery.where(eq(content.createdBy, userId)) as any;
    }

    // Get scheduled posts count
    let scheduledPostsQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(content)
      .where(eq(content.status, 'scheduled'));

    if (userId) {
      scheduledPostsQuery = scheduledPostsQuery.where(eq(content.createdBy, userId)) as any;
    }

    // Get platform breakdown
    let platformBreakdownQuery = db
      .select({
        platform: socialPosts.platform,
        postCount: sql<number>`count(*)`,
        engagement: sql<number>`sum(${analytics.likes} + ${analytics.shares} + ${analytics.comments})`,
      })
      .from(socialPosts)
      .leftJoin(analytics, eq(socialPosts.id, analytics.socialPostId))
      .leftJoin(content, eq(socialPosts.contentId, content.id))
      .where(gte(socialPosts.createdAt, dateThreshold))
      .groupBy(socialPosts.platform);

    if (userId) {
      platformBreakdownQuery = platformBreakdownQuery.where(eq(content.createdBy, userId)) as any;
    }

    const [totalPosts] = await totalPostsQuery;
    const [totalEngagement] = await totalEngagementQuery;
    const [scheduledPosts] = await scheduledPostsQuery;
    const platformBreakdown = await platformBreakdownQuery;

    return {
      totalPosts: totalPosts?.count || 0,
      totalEngagement: totalEngagement?.totalEngagement || 0,
      scheduledPosts: scheduledPosts?.count || 0,
      platformBreakdown: platformBreakdown || [],
    };
  }
}

export const storage = new DatabaseStorage();
