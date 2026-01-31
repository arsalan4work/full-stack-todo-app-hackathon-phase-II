---
name: nextjs-server-actions-skill
description: Server Actions are asynchronous functions that run on the server and can be called directly from Client Components. They provide a simple way to handle form submissions and data mutations without creating API routes.
---

### Key Benefits
- 🔒 **Secure** - Run on server with access to sensitive data
- 📝 **Progressive Enhancement** - Forms work without JavaScript
- 🚀 **Simple** - No need for separate API routes
- ✅ **Type-Safe** - Full TypeScript support
- 🔄 **Revalidation** - Automatic cache updates
- 📊 **Built-in** - No external libraries needed

## Basic Server Action

### Creating a Server Action
```typescript
// app/actions.ts
'use server'

export async function createUser(formData: FormData) {
  // Extract form data
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  
  // Validate
  if (!name || !email) {
    throw new Error('Name and email are required')
  }
  
  // Save to database
  await db.insert('users', { name, email })
  
  // Return success
  return { success: true, message: 'User created' }
}
```

### Using Server Action in a Form
```typescript
// app/signup/page.tsx
import { createUser } from '@/app/actions'

export default function SignupPage() {
  return (
    <form action={createUser}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Sign Up</button>
    </form>
  )
}
```

**Note:** This form works without JavaScript! If JS is disabled, it falls back to standard form submission.

## Server Action Directives

### File-Level Directive

Mark entire file as server-only:
```typescript
// app/actions.ts
'use server'

// All exports are Server Actions
export async function createPost(formData: FormData) {
  // Server-side code
}

export async function updatePost(formData: FormData) {
  // Server-side code
}

export async function deletePost(id: string) {
  // Server-side code
}
```

### Function-Level Directive

Mark individual function as Server Action:
```typescript
// app/posts/page.tsx
export default function PostsPage() {
  async function handleSubmit(formData: FormData) {
    'use server'
    
    // This function runs on server
    const title = formData.get('title') as string
    await db.insert('posts', { title })
  }
  
  return (
    <form action={handleSubmit}>
      <input name="title" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

## Form Data Handling

### Basic Form Data Extraction
```typescript
// app/actions.ts
'use server'

export async function submitForm(formData: FormData) {
  // Get individual fields
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const age = formData.get('age') as string
  
  // Convert to number
  const ageNumber = parseInt(age, 10)
  
  // Check if field exists
  const newsletter = formData.get('newsletter') // null if unchecked
  const subscribed = newsletter === 'on'
  
  console.log({ name, email, age: ageNumber, subscribed })
}
```

### Multiple Values (Checkboxes, Multi-select)
```typescript
// app/actions.ts
'use server'

export async function submitPreferences(formData: FormData) {
  // Get all values for a field (checkboxes with same name)
  const interests = formData.getAll('interests') as string[]
  
  console.log({ interests })
  // interests = ['coding', 'design', 'music']
}
```
```typescript
// app/preferences/page.tsx
import { submitPreferences } from '@/app/actions'

export default function PreferencesPage() {
  return (
    <form action={submitPreferences}>
      <label>
        <input type="checkbox" name="interests" value="coding" />
        Coding
      </label>
      <label>
        <input type="checkbox" name="interests" value="design" />
        Design
      </label>
      <label>
        <input type="checkbox" name="interests" value="music" />
        Music
      </label>
      <button type="submit">Save</button>
    </form>
  )
}
```

### Converting FormData to Object
```typescript
// app/actions.ts
'use server'

export async function submitForm(formData: FormData) {
  // Convert entire FormData to object
  const data = Object.fromEntries(formData.entries())
  
  console.log(data)
  // { name: 'John', email: 'john@example.com', age: '30' }
  
  // Or use a library like zod for validation
  const result = formSchema.parse(data)
}
```

## Server Actions with Client Components

### Using in Client Component
```typescript
// components/CreatePostForm.tsx
'use client'

import { createPost } from '@/app/actions'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Post'}
    </button>
  )
}

export default function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Post title" required />
      <textarea name="content" placeholder="Content" required />
      <SubmitButton />
    </form>
  )
}
```

### Handling Response in Client Component
```typescript
// components/ContactForm.tsx
'use client'

import { submitContact } from '@/app/actions'
import { useState } from 'react'

export default function ContactForm() {
  const [message, setMessage] = useState('')
  
  async function handleSubmit(formData: FormData) {
    const result = await submitContact(formData)
    
    if (result.success) {
      setMessage('Thank you! We will contact you soon.')
    } else {
      setMessage('Error: ' + result.error)
    }
  }
  
  return (
    <div>
      <form action={handleSubmit}>
        <input name="name" required />
        <input name="email" type="email" required />
        <textarea name="message" required />
        <button type="submit">Send</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
```

## Validation

### Server-Side Validation
```typescript
// app/actions.ts
'use server'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const age = formData.get('age') as string
  
  // Validation
  const errors: Record<string, string> = {}
  
  if (!name || name.length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }
  
  if (!email || !email.includes('@')) {
    errors.email = 'Invalid email address'
  }
  
  const ageNum = parseInt(age, 10)
  if (isNaN(ageNum) || ageNum < 18) {
    errors.age = 'Must be at least 18 years old'
  }
  
  if (Object.keys(errors).length > 0) {
    return { success: false, errors }
  }
  
  // Save to database
  await db.insert('users', { name, email, age: ageNum })
  
  return { success: true }
}
```

### Using Zod for Validation
```typescript
// lib/schemas.ts
import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.coerce.number().min(18, 'Must be at least 18 years old'),
})
```
```typescript
// app/actions.ts
'use server'

import { userSchema } from '@/lib/schemas'

export async function createUser(formData: FormData) {
  // Convert FormData to object
  const data = Object.fromEntries(formData.entries())
  
  // Validate with Zod
  const result = userSchema.safeParse(data)
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    }
  }
  
  // Save validated data
  await db.insert('users', result.data)
  
  return { success: true }
}
```

### Displaying Validation Errors
```typescript
// components/SignupForm.tsx
'use client'

import { createUser } from '@/app/actions'
import { useState } from 'react'

export default function SignupForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  async function handleSubmit(formData: FormData) {
    const result = await createUser(formData)
    
    if (!result.success) {
      setErrors(result.errors)
    } else {
      setErrors({})
      alert('User created successfully!')
    }
  }
  
  return (
    <form action={handleSubmit}>
      <div>
        <input name="name" placeholder="Name" />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      
      <div>
        <input name="email" type="email" placeholder="Email" />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <input name="age" type="number" placeholder="Age" />
        {errors.age && <span className="error">{errors.age}</span>}
      </div>
      
      <button type="submit">Sign Up</button>
    </form>
  )
}
```

## Revalidation

### Revalidate Path

Revalidate specific route after mutation:
```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  // Save to database
  await db.insert('posts', { title, content })
  
  // Revalidate posts list page
  revalidatePath('/posts')
  
  // Revalidate with layout
  // revalidatePath('/posts', 'layout')
}
```

### Revalidate Tag

Revalidate all routes with specific tag:
```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] }
  }).then(r => r.json())
  
  return <div>{/* Render posts */}</div>
}
```
```typescript
// app/actions.ts
'use server'

import { revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  
  await db.insert('posts', { title })
  
  // Revalidate all routes tagged with 'posts'
  revalidateTag('posts')
}
```

### Redirect After Action
```typescript
// app/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  const post = await db.insert('posts', { title, content })
  
  // Revalidate and redirect
  revalidatePath('/posts')
  redirect(`/posts/${post.id}`)
}
```

## Authentication & Authorization

### Checking User Authentication
```typescript
// app/actions.ts
'use server'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  // Check if user is authenticated
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  // Get user ID from session
  const userId = session.user.id
  
  const title = formData.get('title') as string
  
  // Save post with user ID
  await db.insert('posts', { title, userId })
  
  return { success: true }
}
```

### Role-Based Authorization
```typescript
// app/actions.ts
'use server'

import { auth } from '@/lib/auth'

export async function deleteUser(userId: string) {
  const session = await auth()
  
  // Check if user is authenticated
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }
  
  // Check if user is admin
  if (session.user.role !== 'admin') {
    return { success: false, error: 'Forbidden: Admin access required' }
  }
  
  // Perform deletion
  await db.delete('users', { id: userId })
  
  return { success: true }
}
```

## Non-Form Server Actions

### Calling Server Action from Event Handler
```typescript
// app/actions.ts
'use server'

export async function likePost(postId: string) {
  await db.increment('posts', postId, 'likes')
  return { success: true }
}
```
```typescript
// components/LikeButton.tsx
'use client'

import { likePost } from '@/app/actions'
import { useState } from 'react'

export default function LikeButton({ postId }: { postId: string }) {
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(false)
  
  async function handleLike() {
    setLoading(true)
    
    const result = await likePost(postId)
    
    if (result.success) {
      setLikes(likes + 1)
    }
    
    setLoading(false)
  }
  
  return (
    <button onClick={handleLike} disabled={loading}>
      👍 {likes} {loading && '...'}
    </button>
  )
}
```

### Server Action with Parameters
```typescript
// app/actions.ts
'use server'

export async function updatePostStatus(postId: string, status: 'draft' | 'published') {
  await db.update('posts', { id: postId }, { status })
  return { success: true }
}
```
```typescript
// components/PostActions.tsx
'use client'

import { updatePostStatus } from '@/app/actions'

export default function PostActions({ postId }: { postId: string }) {
  return (
    <div>
      <button onClick={() => updatePostStatus(postId, 'draft')}>
        Save as Draft
      </button>
      <button onClick={() => updatePostStatus(postId, 'published')}>
        Publish
      </button>
    </div>
  )
}
```

## Loading States

### useFormStatus Hook

Track form submission status:
```typescript
// components/SubmitButton.tsx
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}
```

**Important:** `useFormStatus` must be in a separate component that's a child of the form.
```typescript
// components/CreatePostForm.tsx
'use client'

import { createPost } from '@/app/actions'
import { SubmitButton } from './SubmitButton'

export default function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      {/* SubmitButton uses useFormStatus */}
      <SubmitButton />
    </form>
  )
}
```

### useFormState Hook (React 19)

Manage form state with Server Actions:
```typescript
// app/actions.ts
'use server'

export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get('title') as string
  
  if (!title || title.length < 5) {
    return {
      success: false,
      message: 'Title must be at least 5 characters',
    }
  }
  
  await db.insert('posts', { title })
  
  return {
    success: true,
    message: 'Post created successfully!',
  }
}
```
```typescript
// components/CreatePostForm.tsx
'use client'

import { useFormState } from 'react-dom'
import { createPost } from '@/app/actions'

const initialState = {
  success: false,
  message: '',
}

export default function CreatePostForm() {
  const [state, formAction] = useFormState(createPost, initialState)
  
  return (
    <form action={formAction}>
      <input name="title" required />
      <button type="submit">Create</button>
      
      {state.message && (
        <p className={state.success ? 'success' : 'error'}>
          {state.message}
        </p>
      )}
    </form>
  )
}
```

## Optimistic Updates

### useOptimistic Hook

Update UI optimistically before server response:
```typescript
// components/TodoList.tsx
'use client'

import { useOptimistic } from 'react'
import { addTodo } from '@/app/actions'

type Todo = { id: string; text: string; completed: boolean }

export default function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: string) => [
      ...state,
      { id: Date.now().toString(), text: newTodo, completed: false }
    ]
  )
  
  async function handleSubmit(formData: FormData) {
    const text = formData.get('text') as string
    
    // Add optimistically
    addOptimisticTodo(text)
    
    // Send to server
    await addTodo(formData)
  }
  
  return (
    <div>
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
      
      <form action={handleSubmit}>
        <input name="text" required />
        <button type="submit">Add</button>
      </form>
    </div>
  )
}
```

## Error Handling

### Try-Catch in Server Action
```typescript
// app/actions.ts
'use server'

export async function createUser(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    
    // Attempt to save
    await db.insert('users', { name, email })
    
    return { success: true, message: 'User created' }
    
  } catch (error) {
    console.error('Failed to create user:', error)
    
    return {
      success: false,
      message: 'Failed to create user. Please try again.',
    }
  }
}
```

### Handling Unique Constraint Errors
```typescript
// app/actions.ts
'use server'

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string
  
  try {
    await db.insert('users', { email })
    return { success: true }
    
  } catch (error: any) {
    // Check for unique constraint violation
    if (error.code === '23505') { // PostgreSQL unique violation
      return {
        success: false,
        message: 'Email already exists',
      }
    }
    
    return {
      success: false,
      message: 'An error occurred',
    }
  }
}
```

## File Uploads

### Handling File Uploads
```typescript
// app/actions.ts
'use server'

export async function uploadAvatar(formData: FormData) {
  const file = formData.get('avatar') as File
  
  if (!file) {
    return { success: false, message: 'No file provided' }
  }
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { success: false, message: 'File must be an image' }
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { success: false, message: 'File too large (max 5MB)' }
  }
  
  // Convert to buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  // Save to filesystem or cloud storage
  const filename = `${Date.now()}-${file.name}`
  await fs.writeFile(`./uploads/${filename}`, buffer)
  
  return {
    success: true,
    filename,
    url: `/uploads/${filename}`,
  }
}
```
```typescript
// components/AvatarUpload.tsx
'use client'

import { uploadAvatar } from '@/app/actions'
import { useState } from 'react'

export default function AvatarUpload() {
  const [preview, setPreview] = useState<string | null>(null)
  
  async function handleSubmit(formData: FormData) {
    const result = await uploadAvatar(formData)
    
    if (result.success) {
      alert('Avatar uploaded successfully!')
    } else {
      alert(result.message)
    }
  }
  
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input
        type="file"
        name="avatar"
        accept="image/*"
        onChange={handleFileChange}
        required
      />
      
      {preview && (
        <img src={preview} alt="Preview" width={100} height={100} />
      )}
      
      <button type="submit">Upload</button>
    </form>
  )
}
```

## Common Patterns

### Pattern 1: CRUD Operations
```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

// Create
export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  await db.insert('posts', { title, content })
  revalidatePath('/posts')
  
  return { success: true }
}

// Read (in page, not action)
// export default async function PostsPage() {
//   const posts = await db.select('posts')
//   return <div>{/* render */}</div>
// }

// Update
export async function updatePost(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  await db.update('posts', { id }, { title, content })
  revalidatePath('/posts')
  revalidatePath(`/posts/${id}`)
  
  return { success: true }
}

// Delete
export async function deletePost(id: string) {
  await db.delete('posts', { id })
  revalidatePath('/posts')
  
  return { success: true }
}
```

### Pattern 2: Multi-Step Form
```typescript
// app/actions.ts
'use server'

export async function saveStep1(formData: FormData) {
  const name = formData.get('name') as string
  // Save to session or temporary storage
  return { success: true, step: 2 }
}

export async function saveStep2(formData: FormData) {
  const email = formData.get('email') as string
  // Save to session
  return { success: true, step: 3 }
}

export async function finalizeRegistration(formData: FormData) {
  // Get all data from session
  // Save to database
  // Clear session
  return { success: true, complete: true }
}
```

### Pattern 3: Batch Operations
```typescript
// app/actions.ts
'use server'

export async function bulkDeletePosts(postIds: string[]) {
  await db.deleteMany('posts', { id: { in: postIds } })
  revalidatePath('/posts')
  
  return { success: true, deleted: postIds.length }
}
```
```typescript
// components/PostManager.tsx
'use client'

import { bulkDeletePosts } from '@/app/actions'
import { useState } from 'react'

export default function PostManager({ posts }: { posts: any[] }) {
  const [selected, setSelected] = useState<string[]>([])
  
  async function handleBulkDelete() {
    if (selected.length === 0) return
    
    const result = await bulkDeletePosts(selected)
    
    if (result.success) {
      alert(`Deleted ${result.deleted} posts`)
      setSelected([])
    }
  }
  
  return (
    <div>
      {posts.map((post) => (
        <label key={post.id}>
          <input
            type="checkbox"
            checked={selected.includes(post.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelected([...selected, post.id])
              } else {
                setSelected(selected.filter((id) => id !== post.id))
              }
            }}
          />
          {post.title}
        </label>
      ))}
      
      <button onClick={handleBulkDelete} disabled={selected.length === 0}>
        Delete Selected ({selected.length})
      </button>
    </div>
  )
}
```

## Best Practices

### ✅ DO:

1. **Use Server Actions for mutations**
```typescript
   // ✅ Server Action for data mutation
   'use server'
   export async function createPost(formData: FormData) { }
```

2. **Validate all inputs**
```typescript
   // ✅ Always validate
   if (!title || title.length < 5) {
     return { success: false, error: 'Title too short' }
   }
```

3. **Revalidate after mutations**
```typescript
   // ✅ Revalidate to update UI
   revalidatePath('/posts')
```

4. **Return meaningful responses**
```typescript
   // ✅ Clear success/error responses
   return { success: true, message: 'Post created' }
```

5. **Use try-catch for error handling**
```typescript
   // ✅ Handle errors gracefully
   try {
     await db.insert(...)
   } catch (error) {
     return { success: false, error: 'Database error' }
   }
```

### ❌ DON'T:

1. **Don't use Server Actions for data fetching**
```typescript
   // ❌ Use Server Components for fetching
   'use server'
   export async function getPosts() { }
   
   // ✅ Fetch in Server Component instead
   export default async function PostsPage() {
     const posts = await db.select('posts')
   }
```

2. **Don't skip validation**
```typescript
   // ❌ No validation
   const title = formData.get('title')
   await db.insert('posts', { title })
   
   // ✅ Always validate
   if (!title || title.length < 5) {
     return { success: false, error: 'Invalid title' }
   }
```

3. **Don't forget to revalidate**
```typescript
   // ❌ No revalidation - UI won't update
   await db.insert('posts', { title })
   
   // ✅ Revalidate to update cache
   await db.insert('posts', { title })
   revalidatePath('/posts')
```

4. **Don't expose sensitive data**
```typescript
   // ❌ Exposing sensitive data
   return { success: true, dbError: error.stack }
   
   // ✅ Generic error message
   return { success: false, error: 'An error occurred' }
```

## Summary

Server Actions provide:
- 🔒 **Secure server-side mutations**
- 📝 **Progressive enhancement** (works without JS)
- 🚀 **No API routes needed**
- ✅ **Type-safe** with TypeScript
- 🔄 **Automatic revalidation**
- 📊 **Built-in form handling**
- 🎯 **Simple error handling**
- ⚡ **Optimistic updates** support

Use Server Actions for all form submissions and data mutations in your Next.js 16 applications.