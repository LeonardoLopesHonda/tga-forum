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
