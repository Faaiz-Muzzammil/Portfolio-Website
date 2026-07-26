---
name: Backend Architecture & API Expert
description: Best practices for building scalable, secure, and robust backend systems in Next.js.
---

# Backend Architecture & API Expert

## Next.js Server Actions vs API Routes
- **Server Actions**: Use for mutations (POST/PUT/DELETE) triggered by UI events. Direct RPC style.
- **Route Handlers (`app/api/...`)**: Use for webhooks, public APIs, or complex streaming responses.

## Database Pattern (Prisma/Postgres)
- **Singleton Pattern**: Ensure only one PrismaClient instance exists in dev (hot reload fix).
- **Pagination**: Always implement cursor-based pagination for large data sets.
- **Indexing**: explicitly define `@index` in `schema.prisma` for fields queried often.

## Error Handling
- **Centralized Handling**: Use a `safeAction` wrapper for Server Actions to catch errors and return structured `{ success: boolean, error?: string }` responses.
- **HTTP Codes**: Return strict 401/403/404/500 status codes in Route Handlers.

## Validation (Zod)
- **Input Validation**: NEVER trust client input. Validate every Server Action argument with Zod schema.
```typescript
const schema = z.object({ email: z.string().email() });
const result = schema.safeParse(data);
if (!result.success) throw new Error("Invalid Input");
```

## Caching Strategy
- **Request Memoization**: `fetch` calls are deduped automatically.
- **unstable_cache**: Use for expensive DB queries that can be cached by tag.
- **Revalidation**: Use `revalidatePath` or `revalidateTag` intelligently. Do not purge the whole cache.
