# SocialSync - Social Media Content Management System

## Overview

SocialSync is a comprehensive social media content management system built as a full-stack web application. The system enables users to create, schedule, and analyze content across 13 social media platforms through the Ayrshare API integration. It features a React-based frontend with shadcn/ui components and a Node.js/Express backend with PostgreSQL database storage.

The application serves content creators, social media managers, and teams who need to streamline their social media workflow with centralized content management, scheduling capabilities, analytics tracking, and team collaboration features.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Enhanced UX/UI Implementation (January 2025)
- **Mobile-First Design**: Complete mobile responsive redesign with mobile sidebar and adaptive layouts
- **Enhanced Visual Design**: Added gradient backgrounds, glass morphism effects, improved typography with Inter font
- **Advanced Components**: Created enhanced versions of dashboard, create content, and analytics pages
- **Better User Experience**: Added loading animations, improved navigation, AI content suggestions, and platform-specific styling
- **Mobile Optimization**: Dedicated mobile sidebar, responsive grids, touch-friendly interface elements

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript for type safety and modern development patterns
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design system variables for consistent theming across social platforms
- **State Management**: TanStack React Query for server state management, caching, and synchronization
- **Routing**: Wouter for lightweight client-side routing
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **Database ORM**: Drizzle ORM for type-safe database operations and migrations
- **Authentication**: Replit Auth integration with OpenID Connect for secure user authentication
- **Session Management**: Express sessions with PostgreSQL storage for persistent user sessions
- **File Handling**: Multer middleware for media file uploads with type validation

### Database Design
- **Primary Database**: PostgreSQL with the following core entities:
  - **Users**: Authentication data, roles (admin/editor/viewer), and profile information
  - **Content**: Post content, title, body, platform selection, scheduling, and status tracking
  - **Social Posts**: Individual platform post records with external API post IDs
  - **Analytics**: Engagement metrics (likes, shares, comments, reach) per platform post
  - **Media**: File storage metadata with user associations and type information
  - **Sessions**: User session persistence for authentication state

### API Integration Strategy
- **Ayrshare API**: Centralized social media posting service supporting 13 platforms (Facebook, Instagram, X/Twitter, LinkedIn, TikTok, YouTube, Pinterest, Reddit, Snapchat, Telegram, Threads, Bluesky, Google Business)
- **Service Layer**: Abstracted AyrshareService class handling API authentication, request formatting, and response processing
- **Platform Management**: Unified platform selection interface with visual toggles and platform-specific styling

### Security Architecture
- **Authentication Flow**: Replit Auth with JWT tokens and secure session management
- **Authorization**: Role-based access control (RBAC) with admin, editor, and viewer permissions
- **Input Validation**: Zod schema validation for all API inputs and form data
- **File Security**: Media upload restrictions with MIME type validation and size limits
- **Environment Variables**: Secure storage of API keys, database credentials, and session secrets

### Performance Optimizations
- **Client-Side**: React Query caching, code splitting, lazy loading, and optimized bundle sizes
- **Server-Side**: Connection pooling with Neon serverless PostgreSQL, response compression
- **Database**: Proper indexing on frequently queried fields and optimized query patterns
- **Media Handling**: File size limits and efficient storage patterns

## External Dependencies

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **Drizzle Kit**: Database migration management and schema synchronization

### Authentication & Security
- **Replit Auth**: OpenID Connect authentication provider
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Social Media Integration
- **Ayrshare API**: Multi-platform social media posting and analytics service
- **Platform Support**: Facebook, Instagram, X/Twitter, LinkedIn, TikTok, YouTube, Pinterest, Reddit, Snapchat, Telegram, Threads, Bluesky, Google Business

### UI & Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Build tool with development server and production bundling
- **TypeScript**: Type checking and enhanced developer experience
- **Replit Integration**: Development environment plugins and error handling