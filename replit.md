# Email Management System

## Overview

This is a full-stack email management application built with React, Express, TypeScript, and PostgreSQL. The system provides intelligent email processing with AI-powered analysis, task management, calendar integration, and contact management. It features a modern dashboard interface with real-time analytics and automated workflow capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Design**: RESTful endpoints with structured error handling
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle with migrations in `/migrations` directory
- **Tables**: Users, emails, tasks, calendar events, contacts, AI drafts, projects
- **Relationships**: Foreign keys linking user data across entities

## Key Components

### Email Management
- **AI Analysis**: OpenAI integration for email categorization, priority scoring, and summary generation
- **Smart Filtering**: Priority-based email sorting (high, medium, low)
- **Response Generation**: AI-powered draft responses with tone analysis
- **Task Extraction**: Automatic task creation from email content

### Task Management
- **Multi-Source Tasks**: Tasks from emails, calendar events, or manual creation
- **Priority System**: Urgent, high, medium, low priority levels
- **Status Tracking**: Pending, in-progress, completed states
- **Due Date Management**: Time-based organization and alerts

### Calendar Integration
- **Event Management**: Create, update, delete calendar events
- **Schedule Overview**: Today's events and upcoming meetings
- **Task Linkage**: Connect calendar events to actionable tasks

### Contact Management
- **Relationship Tracking**: Business, personal, vendor classifications
- **Communication History**: Integration with email interactions
- **Profile Management**: Comprehensive contact information storage

### Dashboard Analytics
- **Real-time Stats**: Unread emails, pending tasks, today's meetings
- **Priority Alerts**: Urgent task notifications and high-priority email indicators
- **Quick Actions**: Fast access to common operations

## Data Flow

1. **Email Processing**: Incoming emails → AI analysis → categorization → task extraction → dashboard updates
2. **Task Management**: Manual creation or AI extraction → priority assignment → status tracking → completion
3. **Calendar Events**: Event creation → task linkage → schedule visualization → notifications
4. **Contact Interactions**: Contact management → email association → relationship tracking

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **AI Services**: OpenAI GPT-4o for email analysis and response generation
- **UI Components**: Radix UI primitives for accessible components
- **Validation**: Zod for runtime type checking and form validation

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Database Migrations**: Drizzle Kit for schema management
- **Code Quality**: TypeScript strict mode with ES2020+ target
- **Development Server**: Express with Vite middleware in development

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite development server with HMR
- **Database**: Local or development PostgreSQL instance
- **Environment Variables**: `.env` file for configuration
- **Error Handling**: Runtime error overlay for development debugging

### Production Build
- **Frontend**: Vite build with optimized bundles in `dist/public`
- **Backend**: ESBuild compilation to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Database**: Production PostgreSQL with connection pooling

### Configuration Management
- **Environment Variables**: `DATABASE_URL` for database connection, `OPENAI_API_KEY` for AI services
- **Build Scripts**: Separate development and production build processes
- **Health Checks**: API endpoint monitoring and database connection validation

The application follows a modern full-stack architecture with clear separation of concerns, scalable data management, and intelligent automation features powered by AI integration.