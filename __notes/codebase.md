## Library & Framework Stack

### Server Side
- React 18.x - Core UI library
- Next.js 13.x - React framework with App Router
  - Server Components
  - API Routes
  - Server Actions
  - File-based Routing

### Backend (Supabase)
- Authentication
  - Email/Password
  - Social login (Google, GitHub)
  - Row Level Security (RLS)
- Database
  - Tables
    - users
    - todos
    - documents
    - document_versions
  - Real-time subscriptions
- Storage
  - Document attachments
  - User avatars
  - Image uploads

### Client Side
- Pure JavaScript (ES6+)
- HTML5
- TailwindCSS 3.x
  - Custom configurations
  - Responsive design utilities
- NextUI v2
  - Modern UI components
  - Dark/Light theme support
  - Accessibility features

## Core Features

### Document Editor
- Rich text editing with TipTap
- Markdown support
- Real-time preview
- Image upload & handling
- Code syntax highlighting

### TODO List Application
- CRUD operations
- Real-time updates
- Filtering & sorting
- Due date management
- Priority levels
- Categories/Tags

### Page Structure
#### Create
- New document creation
- Form validations
- Draft saving

#### Read
- Document viewing
- Search functionality
- Filtering options

#### Update
- In-place editing
- Version history
- Auto-save

#### Delete
- Soft delete
- Trash management
- Permanent deletion

## Components

### TipTap Editor
- Core editor component
- Custom extensions
- Toolbar configuration
- Markdown shortcuts
- Collaborative editing support

## Project Structure
```bash
/Users/uhd/Documents/Projects/2.COMPANIES/BBrightCode/unit test/markdown/
├── docs/                         # Documentation files
│   ├── codebase.md             # Project codebase documentation
│   ├── promptrules.md          # Prompt rules and guidelines
│   └── taskorders/             # Task order documentation
│       └── taskorder-phase-1.md # Phase 1 task details
├── app/                          # Next.js app directory
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx               # Home page
│   └── protected/             # Protected routes
├── components/                   # React components
│   ├── common/                # Shared components
│   └── auth/                  # Auth components
├── contexts/                     # React contexts
│   └── AuthContext.tsx       # Authentication context
├── lib/                          # Utility functions
│   ├── hooks/                # Custom hooks
│   │   └── useAuth.ts       # Authentication hook
│   └── supabase/            # Supabase related
│       └── client.ts        # Supabase client
├── styles/                       # Styling files
│   ├── globals.css           # Global styles
│   └── tailwind.config.ts    # Tailwind config
├── types/                        # TypeScript types
│   └── supabase.ts          # Generated types
├── tests/                        # Test files
│   └── auth/                # Auth tests
├── middleware.ts                 # Auth middleware
├── .env.local                   # Environment variables
├── package.json                 # Project dependencies
└── tsconfig.json               # TypeScript config
```

## Database Schema
### Users Table
```sql
create table users (
  id uuid references auth.users primary key,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);
```

### Todos Table
```sql
create table todos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  title text,
  content text,
  is_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Documents Table
```sql
create table documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  title text,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Required Files
### Configuration Files
- package.json - Dependencies and scripts
- tsconfig.json - TypeScript compiler settings
- next.config.ts - Next.js settings
- tailwind.config.ts - TailwindCSS customization

### Supabase Configuration Files
- lib/supabase/client.ts - Supabase client setup
- lib/supabase/auth.ts - Authentication functions
- .env.local - Environment variables
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

### Core Application Files
- app/layout.tsx - Root layout with providers
- app/page.tsx - Landing page
- components/tiptap/Editor.tsx - Main editor implementation
- lib/api/todo.ts - Todo API handlers
- types/todo.d.ts - Todo type definitions
- types/editor.d.ts - Editor type definitions
- lib/supabase/db.ts - Database operations
- types/supabase.d.ts - Database types

### Style Files
- styles/globals.css - Global styles and Tailwind directives

## Development Guidelines
- Component-first architecture
- Server Components by default
- Client Components when needed
- Atomic Design principles
- Strong TypeScript typing
- Interface-first development
- Database-first schema design
- Real-time updates using Supabase subscriptions
- Strong RLS policies for security

## Testing Strategy
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Cypress