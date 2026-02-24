# Glamlink Documentation

Welcome to the comprehensive documentation for the Glamlink beauty marketplace platform. This directory contains detailed information about the application's architecture, features, and development guides.

## Documentation Structure

### 📁 architecture/
Technical documentation about the system architecture and implementation details.

- **[technical-stack.md](./architecture/technical-stack.md)** - Frontend/backend technologies, development tools, and architecture patterns
- **[database-structure.md](./architecture/database-structure.md)** - Nested document architecture, Firestore implementation, and data models
- **[authentication.md](./architecture/authentication.md)** - Firebase Auth setup, session management, and security implementation
- **[application-flow.md](./architecture/application-flow.md)** - User journeys, data flow, and system interactions

### 📁 features/
Detailed documentation of all platform features and capabilities.

- **[admin-panel.md](./features/admin-panel.md)** - Complete guide to all admin panel tabs and functionality
- **[public-pages.md](./features/public-pages.md)** - Public-facing pages, detail views, and customer experience
- **[content-settings.md](./features/content-settings.md)** - Dynamic page visibility and content management system
- **[ai-integration.md](./features/ai-integration.md)** - AI features including content generation, image creation, and brainstorming

### 📁 guides/
How-to guides and best practices for development.

- **[common-tasks.md](./guides/common-tasks.md)** - Step-by-step guides for common development tasks
- **[best-practices.md](./guides/best-practices.md)** - Coding standards, patterns, and recommendations
- **[testing-scenarios.md](./guides/testing-scenarios.md)** - Comprehensive testing checklist and scenarios
- **[environment-setup.md](./guides/environment-setup.md)** - Complete setup guide for local development

### 📁 updates/
Release notes and feature updates organized by date.

- **[2025-07-11-updates.md](./updates/2025-07-11-updates.md)** - Profile management, AI image generation, date handling
- **[2025-07-10-updates.md](./updates/2025-07-10-updates.md)** - AI brainstorming, database restructure, detail pages
- **[2025-07-10-previous.md](./updates/2025-07-10-previous.md)** - Multi-brand architecture, user roles, initial features

## Quick Links

### For New Developers
1. Start with [Environment Setup](./guides/environment-setup.md)
2. Review [Technical Stack](./architecture/technical-stack.md)
3. Understand [Database Structure](./architecture/database-structure.md)
4. Learn [Best Practices](./guides/best-practices.md)

### For Feature Development
1. Check [Common Tasks](./guides/common-tasks.md)
2. Review relevant feature documentation
3. Follow [Testing Scenarios](./guides/testing-scenarios.md)
4. Update documentation as needed

### For Understanding the System
1. Read [Application Flow](./architecture/application-flow.md)
2. Explore [Admin Panel](./features/admin-panel.md) features
3. Review [AI Integration](./features/ai-integration.md) capabilities
4. Check latest [Updates](./updates/)

## Key Concepts Summary

### User Types
- **Super Admin**: System management (admin@glamlink.com)
- **Brand Owners**: Full brand management capabilities
- **Customers**: Browse and interact with brands

### Technology Stack
- **Frontend**: Next.js 15, TypeScript, Redux, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: OpenAI GPT-4, DALL-E 3
- **Deployment**: Vercel

### Core Features
- Multi-tenant brand management
- AI-powered content generation
- Professional marketplace
- Real-time updates
- Mobile-responsive design

## Contributing to Documentation

When adding new features or making significant changes:

1. Update relevant documentation files
2. Add entries to appropriate update files
3. Keep examples current
4. Maintain consistent formatting
5. Test all code examples

## Need Help?

- Main guide: [CLAUDE.md](../CLAUDE.md)
- Quick start: [Environment Setup](./guides/environment-setup.md)
- Common issues: [Testing Scenarios](./guides/testing-scenarios.md)
- Architecture questions: [Technical Stack](./architecture/technical-stack.md)