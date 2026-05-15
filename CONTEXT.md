# TGA-Forum Domain Context

## Glossary

### The Great Attractor (TGA)
The project name and brand. Named after the gravitational anomaly pulling the Milky Way — used as a metaphor for a community that draws people in.

### Forum
The product itself. A community discussion platform for space enthusiasts — covering astronomy, astrophysics, space sciences, and engineering. Explicitly excludes mysticism/astrology. Welcoming to engineers as a primary audience segment alongside hobbyist stargazers.

### Post
The root of a discussion thread. A user-authored piece of content with a title and body. Equivalent to a "thread" in traditional forum terminology — there is no separate Thread entity.

### Comment
A reply attached to a Post. Comments can nest (replies to replies), forming a tree structure. The depth of nesting is currently unbounded.

### Search
Full-text search over Posts (title + content) using Postgres `tsvector`/`tsquery`. No external search service. Implemented as a generated `tsvector` column on the `posts` table, queryable via a GIN index. Basic ILIKE and external services (Algolia, Meilisearch) are explicitly deferred.

### Soft Delete
The moderation mechanism for Posts and Comments. A `deleted_at` timestamp is set instead of removing the row. Soft-deleted Posts are hidden from feeds. Soft-deleted Comments render as "[deleted]" to preserve thread structure — replies are never orphaned. Hard deletes do not occur at the application level. Only the admin (author of TGA) can soft-delete any content; regular users can only delete their own.

### Reply
A Comment whose parent is another Comment (not the Post directly). Structurally identical to a Comment — distinguished only by having a non-null `parent_id`.

### Profile
A user's identity within TGA. Stores `username` and an optional `bio` (short free-text self-description). All fields beyond username are optional — privacy is respected. Verified roles and badges are deferred until community feedback justifies them. Linked 1:1 to a Supabase Auth user via UUID.

### Community Feedback Loop
The product development model: users request features, the author implements them, iterates with the community until satisfied. Features are community-driven, not roadmap-driven. Feature requests are made as Posts in a dedicated category — no separate Proposal entity.

### Upvote
A signal of quality cast by a User on a Post or Comment. A User can cast at most one Upvote per target — enforced by a unique constraint on `(user_id, post_id)` and `(user_id, comment_id)` in dedicated join tables (`post_upvotes`, `comment_upvotes`). The upvote count is derived, not stored as a column. Downvotes and reactions are deferred.

### Category
A label that classifies a Post by topic or purpose. A Post belongs to exactly one Category. The list is fixed and admin-curated — users cannot create categories. Tags are explicitly deferred until community demand justifies them.

**Canonical categories (seeded at migration time):**
1. General — catch-all discussion
2. Stargazing & Observing — telescopes, conditions, sighting reports
3. Astrophysics & Science — papers, theory, deep science
4. Space Engineering — rockets, spacecraft, instrumentation
5. News & Events — launches, discoveries, sky events
6. Feature Requests — community-driven product feedback

Each category has a stable `slug` (kebab-case, e.g. `stargazing-observing`) used in URLs and a hand-picked gradient stored as `color_from` / `color_to` hex columns. The DB is the single source of truth for palette — frontend composes the gradient (`linear-gradient(135deg, from, to)`) but does not own the colors. The list is fixed and admin-curated; `posts.category_id` is `NOT NULL` with `ON DELETE RESTRICT`. Pre-existing posts are backfilled to `General` rather than introducing an "Uncategorized" 7th category — `General` already is the catch-all. The seed runs idempotently on app boot (`INSERT ... ON CONFLICT (slug) DO NOTHING`).

**API surface:**
- `GET /api/v1/categories` returns the 6 rows for frontend pills + form selector. Cached module-level on the frontend with in-flight promise dedup (one fetch per page load).
- `GET /api/v1/posts?category=<slug>` filters by slug (not id). Filter is applied as a WHERE clause before cursor pagination — cursor shape (`created_at, post_id`) is unchanged.
- `POST /api/v1/posts` requires `category_id`. Service layer verifies the id exists and returns `400` with a clear message on miss; the DB FK is a backstop.
- Post responses embed the full category object (`{id, slug, name, color_from, color_to}`) rather than just `category_id`, so cards render immediately without waiting on the categories fetch.

**Frontend conventions:**
- Feed filter: horizontal pill row above `PostFeed`. Selected category lives in the URL (`?category=<slug>`) — shareable, back-button friendly. Changing the filter resets cursor + post list.
- Post card + post detail show a clickable gradient badge. Clicking from anywhere navigates to `/?category=<slug>` (global filtered feed). Profile pages render the badge but do not get a filter row — profile is identity, not taxonomy.
- Create form uses a native `<select>` (not pills) — form input, not navigation. Accepts `?category=<slug>` query to pre-fill from empty-state CTAs.
- Empty filtered feed renders a friendly message + "Be the first to post" CTA that deep-links to `/create?category=<slug>`.
- New API slice: `lib/api/categories.ts` exposing `list()` and `Category` type, matching the per-domain slice convention.

### Email Confirmation Flow
Supabase email confirmation is enabled. Signup does not produce a session immediately — the backend returns `202 Accepted` with `{ "pending_confirmation": true }`. The frontend modal transitions to a confirmation screen. When the user clicks the confirmation link, Supabase redirects to `/auth/callback` on the frontend, which exchanges the token for a session and calls `GET /users/me` to complete profile creation.

The post-confirmation landing URL is **declared by the frontend** at signup time, not hardcoded server-side. The frontend sends `email_redirect_to: ${window.location.origin}/auth/callback` in the signup body; the backend validates the URL's origin against `ALLOWED_ORIGINS` (closing the open-redirect hole) and forwards it to Supabase as `options.email_redirect_to` (the snake_case key the Python `supabase_auth` client expects — `emailRedirectTo` is silently ignored). This keeps the backend ignorant of frontend URLs while preventing arbitrary redirects.

### Profile Self-Heal
`GET /users/me` is idempotent with respect to profile creation. If a valid JWT is presented but no `profiles` row exists, the endpoint creates the profile using the `username` from JWT `user_metadata`. If `user_metadata.username` is absent, the endpoint returns a `422` with a clear error. This self-heals accounts where signup completed in Supabase Auth but profile creation failed.

### Session Expiry
When any API request returns `401`, the frontend API client (`req()`) intercepts it centrally, calls `authStore.logout()`, and emits a persistent toast with a re-login action button. Individual components do not handle `401` themselves.

### Auth Gates
Private actions (create post, submit comment) are visible to all users. Clicking a private action while logged out opens the auth modal inline — the request is never sent to the backend. The only fully private route is `/create`, which redirects to `/` client-side if the user is not authenticated.

### Toast Actions
The toast system supports an optional `action: { label: string, onClick: () => void }` field. The toast component renders an action button when present and invokes the callback on click. The toast component has no knowledge of auth or routing — callers provide the behavior.

## Frontend Architecture

These conventions are load-bearing — preserve them in future work.

### API Domain Slices
Network calls live in `frontend/lib/api/<slice>.ts`, one file per backend domain:
- `http.ts` — internal: `req<T>()`, `getToken/storeToken/removeToken`, base URL. Not imported by components.
- `auth.ts` — `login`, `register`, `logout`, `isLoggedIn`
- `posts.ts` — `list`, `get`, `create`, `remove` + `PostPublic`
- `comments.ts` — `list`, `create`, `reply`, `remove` + `CommentPublic`
- `users.ts` — `me`, `getProfile`, `updateBio` + `UserPublic`, `ProfilePublic`
- `ai.ts` — `assistPost` + `AiAssistResponse`

**Conventions:**
- Components import per-slice: `import * as posts from '@/lib/api/posts'`.
- When the slice name shadows a local variable (e.g. `const [posts, setPosts] = useState(...)`), alias the import: `import * as postsApi from '@/lib/api/posts'`.
- `delete` is a JS reserved word — name the deletion function `remove`.
- Adding a new backend domain means a new slice file, not appending to an existing one. There is no aggregating `lib/api.ts`.

### Auth Store (Single-Owner Modal)
`frontend/lib/auth-store.ts` is the only owner of auth state, including the auth modal's open/closed state. Components must not hold their own `authOpen` state — they call `authStore.openModal()` / `authStore.closeModal()`.

`AppShell.tsx` is the **sole render site** for `<AuthModal>`. Pages and feature components do not mount their own modal.

### Hooks (Concentrated Complexity)
- `useAuth()` — returns `{ user, token, modalOpen, ready, isLoggedIn }`. Replaces the init+subscribe+cleanup boilerplate that used to be copied across components. **Always** use this hook to read auth state in client components.
- `useField(initial, validate?)` — form field with blur-based validation. Returns `{ value, error, isValid, onChange, onBlur, reset, props }`. Spread the **`.props`** subset onto an `<input>`/`<textarea>` — it contains only DOM-safe attributes (`value`, `onChange`, `onBlur`). Spreading the whole object leaks `isValid`/`error`/`reset` as DOM attributes and trips React warnings. Use `validators` (`required`, `minLength`, `maxLength`, `username`, `email`, `compose`) for common rules.
- `useAsyncData(fetcher, deps)` — async fetch with `{ status, data, error, reload }`. Use for read-only loads where retry/reload matters.

If you find yourself writing `useEffect(() => authStore.subscribe(...))` or hand-rolling touched/error state, stop — use the hook.

### React Context for Recursive / Deeply-Shared Props
When the same handful of props would be drilled through a recursive or deeply-nested tree, lift them into a context defined alongside the component. Existing example: `app/post/[id]/components/CommentContext.tsx` carries `replyingTo`, `currentUserId`, `onReply`, `onSubmitReply`, `onDelete` so `CommentNode` can recurse without prop drilling.

Do not reach for context prematurely — only when prop drilling crosses ≥3 levels or a recursive boundary.

### Optimistic Updates with Rollback
Mutations that affect a visible list (comments, replies) apply optimistically with a temporary `optimistic-<n>` id, then either swap in the server response or **roll back and toast on failure**. Silent failures are not acceptable. See `CommentSection.tsx` for the canonical pattern.

### Component Splits
Client components above ~200 lines should be split by concern, colocated under a `components/` subdirectory of their route. Existing example: `app/post/[id]/components/{CommentContext,CommentNode,CommentSection}.tsx` extracted from a 335-line `PostDetailClient`.

### Cursor Pagination
Post list endpoints (`GET /posts`, `GET /users/{username}/posts`) speak the same cursor shape: query params `limit` (default 10, max 50) and the optional pair `(before, before_id)` representing the `(created_at, post_id)` of the last item on the previous page. Response is `{ items: PostPublic[], next_cursor: { before, before_id } | null }`.

Ordering is `(created_at DESC, post_id DESC)`. The two-column cursor ensures posts inserted between page fetches never skip or duplicate across the cursor boundary — a single `created_at` cursor would break on same-timestamp inserts (seed data, bulk imports).

Implementation idiom (backend): fetch `limit + 1` rows; if we got more than `limit`, return the first `limit` and build `next_cursor` from the last returned item; otherwise return everything and set `next_cursor = null`. Saves the extra "is there more" round trip.

Frontend UX is a **Load more** button — explicit user action, no infinite scroll. On failure the toast surfaces the error and the cursor is **not** advanced, so the user can retry without losing pagination state. Initial loads render `Shimmer` skeletons; subsequent loads only affect the button state to avoid reflowing the list.

### AI Assist on /create
`POST /ai/post-assist` accepts `{ title?, content? }` and returns `{ title?, content? }`. Behavior depends on which fields were sent:

- **Title only** → backend generates content. Frontend auto-applies it.
- **Content only** → backend suggests a title. Frontend auto-applies it.
- **Both** → backend refines both fields. Frontend renders each refinement as a **`SuggestionChip`** with Accept/Dismiss, never auto-overwriting the user's text. A chip is suppressed when the model returns the same string the user already had — unchanged fields don't pester.

The "auto-apply on empty field / chip on filled field" split is the contract: the user only sees a decision UI when their own work would be overwritten. `SuggestionChip` lives inline in `CreatePostClient.tsx` — colocated, not yet reused. Lift it to `app/components/` if a second flow needs the same pattern.
