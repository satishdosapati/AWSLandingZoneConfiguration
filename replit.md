# Overview

This is an AWS Landing Zone Configuration Tool - a professional web application designed to help partners and customers select appropriate AWS Landing Zone configurations based on their organization size and requirements. The application provides an interactive intake form that presents different configuration options (Very Small, Small, Medium, Large), allows feature customization, and calculates real-time costs including infrastructure, professional services, and managed services pricing.

The tool serves as a sales and consultation aid, enabling users to visualize different AWS Landing Zone setups, understand their components, and get accurate cost estimates before implementation. It features a clean, enterprise-focused design inspired by AWS and modern SaaS platforms.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React + TypeScript**: Modern React 18 application with strict TypeScript configuration
- **Vite Build System**: Fast development server with hot module replacement and optimized production builds
- **Component Architecture**: Modular component structure using React functional components with hooks
- **State Management**: Local React state with useState hooks for form data and selections
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Radix UI primitives with custom shadcn/ui components for accessibility and consistency

## Design System
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Theme System**: Light/dark mode support with CSS variables and next-themes
- **Color Palette**: AWS-inspired color scheme with professional blues, grays, and accent colors
- **Typography**: Inter font for UI text, JetBrains Mono for technical/cost data
- **Component Library**: Comprehensive set of reusable UI components (cards, buttons, forms, sliders)

## Data Architecture
- **Schema Definition**: Zod-based type-safe schema definitions in shared directory
- **Configuration Data**: Hardcoded JSON data structures for AWS Landing Zone configurations and features
- **Cost Calculation Engine**: Pure functions for calculating infrastructure, professional services, and managed services costs
- **Type Safety**: Full TypeScript coverage with strict type checking across all data transformations

## Backend Architecture
- **Express.js Server**: Node.js backend with Express framework
- **Development Setup**: Vite integration for seamless development experience with middleware mode
- **Database Ready**: Drizzle ORM configuration with PostgreSQL support (currently using in-memory storage)
- **RESTful Structure**: Prepared API route structure for future backend functionality

## Form and Interaction Design
- **Multi-step Interface**: Tabbed interface for configuration selection, feature customization, and cost review
- **Real-time Calculations**: Instant cost updates as users modify VM counts, storage, and feature selections
- **Interactive Components**: Custom sliders for resource adjustment, radio button cards for configuration selection
- **Export Functionality**: Prepared infrastructure for PDF and CSV export of configuration summaries

## Development Infrastructure
- **Monorepo Structure**: Organized codebase with separate client, server, and shared directories
- **Path Aliases**: TypeScript path mapping for clean imports (@/, @shared/, @assets/)
- **Development Tools**: ESLint configuration, hot reloading, error overlay for development
- **Build Process**: Optimized production builds with static asset handling

## Key Design Patterns
- **Separation of Concerns**: Clear separation between UI components, business logic, and data structures
- **Composition over Inheritance**: React component composition for flexible and reusable UI elements
- **Type-Driven Development**: Zod schemas driving both runtime validation and TypeScript types
- **Progressive Enhancement**: Base functionality works without JavaScript, enhanced with interactive features

# External Dependencies

## UI and Styling
- **@radix-ui/**: Complete set of accessible React primitives for building the component library
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **next-themes**: Theme management system for light/dark mode switching
- **lucide-react**: Icon library for consistent iconography throughout the application
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx + tailwind-merge**: Class name management utilities for conditional styling

## Development and Build Tools
- **Vite**: Modern build tool with fast development server and optimized production builds
- **TypeScript**: Static type checking and enhanced developer experience
- **React**: Core framework for building the user interface
- **Wouter**: Lightweight routing solution for single-page application navigation

## Form Management and Validation
- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Integration layer for validation libraries
- **Zod**: Schema validation and type generation for runtime type safety

## Data Fetching and State
- **@tanstack/react-query**: Server state management and caching (prepared for future API integration)
- **date-fns**: Date manipulation utilities for any time-based calculations

## Database and Backend (Configured but not actively used)
- **Drizzle ORM**: Type-safe ORM for database operations
- **@neondatabase/serverless**: Serverless PostgreSQL database driver
- **Express.js**: Web framework for the Node.js backend
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Development and Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling for enhanced IDE integration