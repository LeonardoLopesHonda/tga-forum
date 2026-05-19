# TGA-Forum Roadmap

Status index for product features and infrastructure work. Authoritative source for "what's happening and what's next." Per-feature design lives in `CONTEXT.md`; per-feature execution lives in the linked GitHub issue.

**Statuses:** `idea` (no design yet) → `designed` (grilled, decisions locked, no code) → `in-progress` (work started) → `shipped`. Rows in `idea` with `(parked)` are intentionally on hold — scope will be redesigned before they're picked up.

**Maintenance rule:** when starting, advancing, or finishing a row, update this file in the same commit as the code change. New features land as new rows. Closing a GitHub issue moves its row to `shipped` (or removes it if abandoned).

## Features


| Feature           | Status        | Issue | Summary                                                                                       | Last touched |
| ----------------- | ------------- | ----- | --------------------------------------------------------------------------------------------- | ------------ |
| Profile fields    | in-progress   | #9    | `display_name`, `avatar_url`, `location`, `links` (max 3, no labels). Backend + bucket done; frontend pending. | 2026-05-19   |
| Profile interests | designed      | #10   | M2M, curated seed + user write-ins distinguished by `is_curated`. Own API surface; follows #9.    | 2026-05-18   |
| Follows           | idea          | #11   | Asymmetric, public follow graph — foundation for a future personalised feed                   | 2026-05-15   |
| Groups            | idea (parked) | —     | Communities with shared feed. Scope deliberately undefined — revisit after Follows ships.     | 2026-05-15   |
| Group chat        | idea (parked) | —     | Realtime, group-scoped messaging. Scope undefined.                                            | 2026-05-15   |
| Upvotes           | idea          | #2    | Quality signal on Posts/Comments, one-per-user-per-target. Deferred behind the priority list. | —            |
| Admin soft-delete | idea          | #4    | Admin can soft-delete any Post/Comment; renders as `[deleted]` to preserve thread structure.  | —            |
| Full-text search  | idea          | #5    | Postgres `tsvector` over Post title + content, GIN index, no external search service.         | —            |


## Tech debt / infra


| Item                                    | Status | Issue | Summary                                                                                       | Last touched |
| --------------------------------------- | ------ | ----- | --------------------------------------------------------------------------------------------- | ------------ |
| Test fixture: `post_with_username` view | idea   | #8    | SQLite `create_all` builds the view's name as a regular empty table; tests can't exercise it. | 2026-05-15   |


## Shipped


| Feature      | Issue | Summary                                                                                       | Shipped    |
| ------------ | ----- | --------------------------------------------------------------------------------------------- | ---------- |
| Categories          | #1    | 6 fixed admin-curated categories, slug URLs, DB-owned gradient palette (`color_from`/`_to`).  | 2026-05-16 |
| Edit post UI        | #6    | `/post/[id]/edit` route + dual-mode `CreatePostClient` + Edit on detail.                      | 2026-05-15 |
| Supabase migrations | #7    | Single Supabase-CLI managed migration history; prod baselined via `migration repair`.         | 2026-05-18 |


