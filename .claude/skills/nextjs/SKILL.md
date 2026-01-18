---
name: nextjs-expert-skill
description: Next.js 16 is a React framework for building full-stack web applications with built-in optimizations, routing, and server-side capabilities.
---

### Core Concepts
- **App Router** - File-system based routing in `app/` directory
- **Server Components** - Components that render on the server by default
- **Server Actions** - Server-side functions callable from client components
- **Streaming & Suspense** - Progressive rendering for better UX
- **Metadata API** - Built-in SEO optimization
- **Image Optimization** - Automatic image optimization with next/image
- **Font Optimization** - Automatic font optimization with next/font

### Skill Files Organization
```
nextjs-16/
├── NEXTJS.md                    # This file - Overview & quick start
├── APP-ROUTER.md                # Routing, layouts, pages, navigation
├── SERVER-COMPONENTS.md         # Server vs Client components
├── SERVER-ACTIONS.md            # Form handling, data mutations
├── DATA-FETCHING.md             # Fetching patterns, caching, revalidation
├── STYLING.md                   # Tailwind CSS integration & best practices
├── API-ROUTES.md                # REST API endpoints (Route Handlers)
├── DEPLOYMENT.md                # Vercel & production deployment
└── examples/
    ├── basic-page.tsx           # Simple page component
    ├── dynamic-route.tsx        # Dynamic route with params
    ├── form-action.tsx          # Form with server action
    ├── data-fetch.tsx           # Data fetching example
    └── layout-example.tsx       # Layout with metadata
```

## Standard Project Structure
```
my-nextjs-app/
├── app/                         # Next.js App Router
│   ├── layout.tsx              # Root layout (required)
│   ├── page.tsx                # Home page (/) (required)
│   ├── globals.css             # Global styles
│   ├── loading.tsx             # Global loading UI
│   ├── error.tsx               # Global error UI
│   ├── not-found.tsx           # Global 404 page
│   ├── (routes)/               # Route groups (optional organization)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx     # Dashboard layout
│   │   │   ├── page.tsx       # /dashboard
│   │   │   └── settings/
│   │   │       └── page.tsx   # /dashboard/settings
│   │   └── auth/
│   │       ├── login/
│   │       │   └── page.tsx   # /auth/login
│   │       └── register/
│   │           └── page.tsx   # /auth/register
│   └── api/                    # API routes (Route Handlers)
│       └── example/
│           └── route.ts        # /api/example
├── components/                  # React components
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Dialog.tsx
│   ├── layout/                 # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── features/               # Feature-specific components
│       └── example/
│           ├── ExampleList.tsx
│           └── ExampleForm.tsx
├── lib/                        # Utility functions & configurations
│   ├── api.ts                 # API client functions
│   ├── types.ts               # TypeScript types & interfaces
│   ├── utils.ts               # Helper functions
│   ├── constants.ts           # Application constants
│   └── validations.ts         # Form validation schemas
├── hooks/                      # Custom React hooks
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
├── public/                     # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
├── styles/                     # Additional styles (optional)
├── .env.local                 # Environment variables (local)
├── .env.production            # Environment variables (production)
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── postcss.config.js          # PostCSS configuration
├── .eslintrc.json             # ESLint configuration
└── package.json               # Dependencies & scripts
```

## Installation & Setup

### 1. Create Next.js Project
```bash
# Using npx (recommended)
npx create-next-app@latest my-app-name

# Interactive prompts:
✔ Would you like to use TypeScript? Yes
✔ Would you like to use ESLint? Yes
✔ Would you like to use Tailwind CSS? Yes
✔ Would you like your code inside a `src/` directory? No (recommended)
✔ Would you like to use App Router? Yes (recommended)
✔ Would you like to use Turbopack? Yes (recommended for faster dev)
✔ Would you like to customize the import alias? No (use default @/*)
```

### 2. Navigate to Project
```bash
cd my-app-name
```

### 3. Install Additional Dependencies (if needed)
```bash
# UI Libraries
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Form Handling
npm install react-hook-form zod @hookform/resolvers

# State Management
npm install zustand

# HTTP Client
npm install axios

# Date Handling
npm install date-fns

# Icons
npm install lucide-react
```

### 4. Run Development Server
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Key Files & Their Purpose

### `app/layout.tsx` - Root Layout (Required)
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Application',
  description: 'Application description',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### `app/page.tsx` - Home Page (Required)
```typescript
export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Welcome</h1>
      <p className="mt-4">Start building your application</p>
    </main>
  )
}
```

### `next.config.ts` - Configuration
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Environment variables accessible on client side
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Image optimization domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
  
  // Experimental features
  experimental: {
    // Enable Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
```

### `.env.local` - Environment Variables
```bash
# Public variables (accessible on client)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=My Application

# Private variables (server-side only)
DATABASE_URL=postgresql://...
API_SECRET_KEY=your-secret-key
```

## Common Commands
```bash
# Development
npm run dev              # Start dev server (default: http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors

# Type Checking
npx tsc --noEmit         # Check TypeScript types without emitting files

# Testing (if configured)
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode

# Clean Build
rm -rf .next             # Remove build cache
npm run build            # Rebuild from scratch
```

## File Naming Conventions

### Special Files in App Router (Reserved Names)
- `layout.tsx` - Shared UI for a segment and its children
- `page.tsx` - Unique UI for a route (makes route publicly accessible)
- `loading.tsx` - Loading UI (shown while page/layout loads)
- `error.tsx` - Error UI (catches errors in segment)
- `not-found.tsx` - 404 UI for segment
- `route.ts` - API endpoint (Route Handler)
- `template.tsx` - Re-rendered layout (creates new instance on navigation)
- `default.tsx` - Fallback UI for Parallel Routes

### Component Files
- **PascalCase** for components: `TodoList.tsx`, `UserProfile.tsx`, `Button.tsx`
- **camelCase** for utilities: `api.ts`, `utils.ts`, `formatDate.ts`
- **kebab-case** for CSS modules: `button.module.css`, `card.module.css`

### Route Organization
```
app/
├── page.tsx                    # Home: /
├── about/
│   └── page.tsx               # About: /about
├── blog/
│   ├── page.tsx               # Blog list: /blog
│   └── [slug]/
│       └── page.tsx           # Blog post: /blog/my-post
└── dashboard/
    ├── layout.tsx             # Dashboard layout
    ├── page.tsx               # Dashboard: /dashboard
    └── settings/
        └── page.tsx           # Settings: /dashboard/settings
```

## TypeScript Configuration

### `tsconfig.json` - Recommended Settings
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Development Workflow

### 1. Plan Feature
- Define routes needed
- Identify components required
- Plan data flow (Server → Client)
- Choose Server vs Client components
- Design state management approach

### 2. Create Routes
- Add `page.tsx` for each route
- Add `layout.tsx` for shared UI
- Use file-system routing conventions
- Add `loading.tsx` and `error.tsx` for UX

### 3. Build Components
- Start with Server Components (default)
- Add `'use client'` directive only when needed
- Keep components small and focused (Single Responsibility)
- Use TypeScript for type safety

### 4. Integrate Data
- Create API client in `lib/api.ts`
- Use `fetch` in Server Components
- Use Server Actions for mutations
- Implement proper error handling

### 5. Style Components
- Use Tailwind utility classes
- Create reusable component variants
- Follow consistent spacing/sizing
- Ensure responsive design

### 6. Test & Optimize
- Test all user flows
- Check loading states
- Test error scenarios
- Optimize images with next/image
- Check Lighthouse scores

### 7. Deploy
- Build for production (`npm run build`)
- Test production build locally (`npm run start`)
- Deploy to Vercel or other platform
- Set environment variables

## When to Use Each Skill File

| Working On | Read This Skill |
|------------|----------------|
| Setting up routes, navigation, dynamic routes | `APP-ROUTER.md` |
| Understanding Server vs Client components | `SERVER-COMPONENTS.md` |
| Forms, data mutations, revalidation | `SERVER-ACTIONS.md` |
| Fetching data, caching strategies | `DATA-FETCHING.md` |
| Styling with Tailwind CSS | `STYLING.md` |
| Creating REST API endpoints | `API-ROUTES.md` |
| Deploying to production | `DEPLOYMENT.md` |

## Quick Tips

### ✅ DO:
- Use Server Components by default (they're faster and more secure)
- Leverage file-system routing for automatic code splitting
- Keep components small and focused on single responsibility
- Use TypeScript for type safety and better developer experience
- Follow Next.js naming conventions for special files
- Optimize images with `next/image` component
- Use environment variables for configuration
- Implement proper loading and error states
- Use Server Actions for form submissions

### ❌ DON'T:
- Add `'use client'` unnecessarily (only when you need interactivity)
- Fetch data in Client Components (use Server Components or Server Actions)
- Mix routing conventions (stick to App Router)
- Skip TypeScript types (they prevent bugs)
- Ignore loading and error states (poor UX)
- Hardcode API URLs (use environment variables)
- Over-nest components (keep structure flat when possible)
- Forget to add alt text to images (accessibility)

## Common Patterns

### Pattern 1: Basic Page (Server Component)
```typescript
// app/example/page.tsx
export default async function ExamplePage() {
  const data = await fetch('https://api.example.com/data').then(r => r.json())
  
  return (
    <div>
      <h1>Example Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

### Pattern 2: Dynamic Route
```typescript
// app/posts/[id]/page.tsx
export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await fetch(`https://api.example.com/posts/${params.id}`)
    .then(r => r.json())
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

### Pattern 3: Client Component with Interactivity
```typescript
// components/Counter.tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

### Pattern 4: Form with Server Action
```typescript
// app/contact/page.tsx
'use server'

async function submitForm(formData: FormData) {
  'use server'
  
  const name = formData.get('name')
  const email = formData.get('email')
  
  // Process form data
  console.log({ name, email })
}

export default function ContactPage() {
  return (
    <form action={submitForm}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Pattern 5: API Route (Route Handler)
```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const users = await fetchUsers() // Your data fetching logic
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newUser = await createUser(body)
  return NextResponse.json(newUser, { status: 201 })
}
```

### Pattern 6: Layout with Metadata
```typescript
// app/dashboard/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'User dashboard',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      <nav>{/* Navigation */}</nav>
      <main>{children}</main>
    </div>
  )
}
```

## Performance Best Practices

### Image Optimization
```typescript
import Image from 'next/image'

// Always use next/image for optimized images
<Image
  src="/profile.jpg"
  alt="Profile picture"
  width={500}
  height={500}
  priority // For above-the-fold images
/>
```

### Font Optimization
```typescript
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const robotoMono = Roboto_Mono({ subsets: ['latin'] })

// Use in components
<body className={inter.className}>
```

### Code Splitting
```typescript
// Automatic code splitting with dynamic imports
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable server-side rendering if needed
})
```

## Resources

- 📚 [Official Next.js Documentation](https://nextjs.org/docs)
- 📚 [App Router Documentation](https://nextjs.org/docs/app)
- 📚 [Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- 📚 [Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)
- 📚 [TypeScript Documentation](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- 📚 [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Summary

Next.js 16 provides a complete framework for modern web applications:

- ⚡ **Fast Performance** - Automatic optimizations, code splitting, prefetching
- 📁 **File-System Routing** - Intuitive routing based on folder structure
- 🖥️ **Server-First** - Server Components by default for better performance
- 🔄 **Server Actions** - Type-safe server mutations without API routes
- 🎨 **Styling Freedom** - Built-in Tailwind CSS support
- 📦 **Optimized Builds** - Automatic tree-shaking and minification
- 🚀 **Easy Deployment** - One-click deployment to Vercel
- 🔒 **Secure by Default** - Server-side rendering protects sensitive data
- 📱 **Responsive** - Mobile-first approach with responsive utilities
- ♿ **Accessible** - Built-in accessibility features

For detailed information on specific topics, refer to the corresponding skill files in this directory.