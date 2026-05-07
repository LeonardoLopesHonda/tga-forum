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

### Email Confirmation Flow
Supabase email confirmation is enabled. Signup does not produce a session immediately — the backend returns `202 Accepted` with `{ "pending_confirmation": true }`. The frontend modal transitions to a confirmation screen. When the user clicks the confirmation link, Supabase redirects to `/auth/callback` on the frontend, which exchanges the token for a session and calls `GET /users/me` to complete profile creation.

### Profile Self-Heal
`GET /users/me` is idempotent with respect to profile creation. If a valid JWT is presented but no `profiles` row exists, the endpoint creates the profile using the `username` from JWT `user_metadata`. If `user_metadata.username` is absent, the endpoint returns a `422` with a clear error. This self-heals accounts where signup completed in Supabase Auth but profile creation failed.

### Session Expiry
When any API request returns `401`, the frontend API client (`req()`) intercepts it centrally, calls `authStore.logout()`, and emits a persistent toast with a re-login action button. Individual components do not handle `401` themselves.

### Auth Gates
Private actions (create post, submit comment) are visible to all users. Clicking a private action while logged out opens the auth modal inline — the request is never sent to the backend. The only fully private route is `/create`, which redirects to `/` client-side if the user is not authenticated.

### Toast Actions
The toast system supports an optional `action: { label: string, onClick: () => void }` field. The toast component renders an action button when present and invokes the callback on click. The toast component has no knowledge of auth or routing — callers provide the behavior.
