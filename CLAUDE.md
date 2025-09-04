# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 8080
- `npm run build` - Build production version
- `npm run build:dev` - Build development version
- `npm run lint` - Run ESLint for code linting
- `npm run preview` - Preview production build

## Code Architecture

### Frontend (React + Vite + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC plugin for fast compilation
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom education-themed gradients
- **State Management**: React Context (AuthProvider) + TanStack Query
- **Routing**: React Router DOM with protected routes

### Backend (Supabase)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with Google OAuth integration
- **Edge Functions**: Deno runtime functions in `supabase/functions/`
  - `generate-document`: AI document generation using OpenAI GPT-4o-mini
  - `process-students`: Student data processing
  - `rag-search`: RAG-based information search

### Key Architectural Patterns

**Component Structure**:
- Pages in `/src/pages/` (Index.tsx, DashboardPage.tsx, AuthPage.tsx, NotFound.tsx)
- Reusable components in `/src/components/`
- UI primitives in `/src/components/ui/` (shadcn/ui components)
- Custom hooks in `/src/hooks/`

**Authentication Flow**:
- `useAuth` hook provides user session state
- `ProtectedRoute` component wraps authenticated pages
- Supabase handles OAuth and session management

**AI Integration**:
- Document generation via `GiamunGenerator` component
- OpenAI API calls through Supabase Edge Functions
- K-EDUFINE format compliance for Korean educational documents

**Styling System**:
- Custom Tailwind theme with Korean education-focused design
- CSS variables for consistent theming
- Gradient utilities for educational branding

### File Structure Conventions

- All TypeScript files use `.tsx` extension for components, `.ts` for utilities
- Import paths use `@/` alias pointing to `src/` directory
- UI components follow shadcn/ui naming conventions
- Custom components use PascalCase naming

### Environment Configuration

- Supabase client configuration in `src/integrations/supabase/client.ts`
- Database types auto-generated in `src/integrations/supabase/types.ts`
- Vite configuration includes development component tagging via lovable-tagger

### Korean Localization

- Text content is primarily in Korean (한국어)
- Font classes use `font-korean` for Korean typography
- Educational terminology follows K-EDUFINE standards
- UI elements designed for Korean education system workflows

### Testing and Quality

- ESLint configuration with React hooks and TypeScript rules
- Unused variables rule disabled for development flexibility
- Strict TypeScript configuration across all files