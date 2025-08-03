import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'viewer']);

// Post status enum
export const postStatusEnum = pgEnum('post_status', ['draft', 'scheduled', 'published', 'failed']);

// Platform enum
export const platformEnum = pgEnum('platform', [
  'facebook', 'instagram', 'x', 'linkedin', 'tiktok', 'youtube', 
  'pinterest', 'reddit', 'snapchat', 'telegram', 'threads', 'bluesky', 'google_business'
]);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('viewer').notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content table
export const content = pgTable("content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }),
  body: text("body").notNull(),
  mediaUrls: text("media_urls").array(),
  platforms: platformEnum("platforms").array().notNull(),
  status: postStatusEnum("status").default('draft').notNull(),
  scheduledTime: timestamp("scheduled_time"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social posts table (tracks individual platform posts)
export const socialPosts = pgTable("social_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull().references(() => content.id),
  platform: platformEnum("platform").notNull(),
  externalPostId: varchar("external_post_id"),
  status: postStatusEnum("status").default('scheduled').notNull(),
  postedAt: timestamp("posted_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics table
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  socialPostId: varchar("social_post_id").notNull().references(() => socialPosts.id),
  likes: integer("likes").default(0),
  shares: integer("shares").default(0),
  comments: integer("comments").default(0),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Media table
export const media = pgTable("media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  content: many(content),
  media: many(media),
}));

export const contentRelations = relations(content, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [content.createdBy],
    references: [users.id],
  }),
  socialPosts: many(socialPosts),
}));

export const socialPostsRelations = relations(socialPosts, ({ one, many }) => ({
  content: one(content, {
    fields: [socialPosts.contentId],
    references: [content.id],
  }),
  analytics: many(analytics),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  socialPost: one(socialPosts, {
    fields: [analytics.socialPostId],
    references: [socialPosts.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [media.uploadedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof content.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof media.$inferSelect;
