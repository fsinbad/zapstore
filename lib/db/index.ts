import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

// For query purposes (used in API routes)
const queryClient = postgres(connectionString, {
  max: 5,                // keep pool small — Supabase free tier has a 15-connection limit
  idle_timeout: 20,      // release idle connections after 20s (before Supabase pooler drops them)
  connect_timeout: 10,   // fail fast if connection can't be established in 10s
  max_lifetime: 1800,    // recycle connections every 30min to avoid stale sockets
})
export const db = drizzle(queryClient, { schema })

// For migrations (used by drizzle-kit)
export const migrationClient = postgres(connectionString, { max: 1 })
