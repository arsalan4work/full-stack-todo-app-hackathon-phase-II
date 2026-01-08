import { createAuthClient } from "better-auth/react"

export const auth = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "",
  headers: {
    "x-better-auth-secret": process.env.NEXT_PUBLIC_BETTER_AUTH_SECRET || "",
  },
});r 