-- 0001_categories.sql
-- Seeds categories and replaces view-shaped tables with real views.
--
-- Preconditions (handled by `Base.metadata.create_all()` on backend startup):
--   - `categories` table exists (empty).
--   - `post.category_id` column exists with NOT NULL + FK to categories.
--   - `post_with_username` and `comment_with_username` exist as view-shaped
--     empty tables (the SQLAlchemy ORM declares them on `Base`).
--
-- This migration does the two things `create_all()` cannot:
--   1. Seed the 6 canonical category rows.
--   2. Replace the view-shaped tables with real views over `post`/`comment`.

BEGIN;

INSERT INTO categories (slug, name, color_from, color_to) VALUES
  ('general',              'General',                '#5A4A3A', '#A09070'),
  ('stargazing-observing', 'Stargazing & Observing', '#1E3A8A', '#6366F1'),
  ('astrophysics-science', 'Astrophysics & Science', '#4C1D95', '#C026D3'),
  ('space-engineering',    'Space Engineering',      '#475569', '#F97316'),
  ('news-events',          'News & Events',          '#B91C1C', '#FBBF24'),
  ('feature-requests',     'Feature Requests',       '#D4A843', '#EDD07A');

DROP TABLE post_with_username;
CREATE VIEW public.post_with_username
WITH (security_invoker = on) AS
SELECT
  p.post_id,
  p.title,
  p.content,
  p.created_at,
  p.updated_at,
  p.user_id,
  p.category_id,
  pr.username
FROM post p
JOIN profiles pr ON pr.id = p.user_id;

DROP TABLE comment_with_username;
CREATE VIEW public.comment_with_username AS
SELECT
  c.comment_id,
  c.content,
  c.created_at,
  c.updated_at,
  c.parent_id,
  c.post_id,
  c.user_id,
  pr.username
FROM comment c
JOIN profiles pr ON pr.id = c.user_id;

COMMIT;
