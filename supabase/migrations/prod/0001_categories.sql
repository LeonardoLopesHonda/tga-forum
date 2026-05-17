-- prod/0001_categories.sql
-- Adds Categories to Posts in a live database (no schema reset).
--
-- Unlike local/0001_categories.sql, this variant assumes:
--   - `post`, `comment`, `profiles` already exist with data.
--   - `post_with_username` and `comment_with_username` already exist as real views.
--   - No `categories` table yet, no `post.category_id` column yet.
--
-- This migration:
--   1. Creates `categories` table and seeds 6 canonical rows.
--   2. Adds `post.category_id` as nullable, backfills existing rows to General,
--      then adds the FK. Column stays nullable (matches the ORM).
--   3. Drops and recreates `post_with_username` to include `category_id`.

BEGIN;

CREATE TABLE categories (
  category_id BIGSERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  color_from  TEXT NOT NULL,
  color_to    TEXT NOT NULL
);

INSERT INTO categories (slug, name, color_from, color_to) VALUES
  ('general',              'General',                '#5A4A3A', '#A09070'),
  ('stargazing-observing', 'Stargazing & Observing', '#1E3A8A', '#6366F1'),
  ('astrophysics-science', 'Astrophysics & Science', '#4C1D95', '#C026D3'),
  ('space-engineering',    'Space Engineering',      '#475569', '#F97316'),
  ('news-events',          'News & Events',          '#B91C1C', '#FBBF24'),
  ('feature-requests',     'Feature Requests',       '#D4A843', '#EDD07A');

ALTER TABLE post ADD COLUMN category_id BIGINT;

UPDATE post
SET    category_id = (SELECT category_id FROM categories WHERE slug = 'general')
WHERE  category_id IS NULL;

ALTER TABLE post
  ADD CONSTRAINT post_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
  ON DELETE RESTRICT;

DROP VIEW post_with_username;
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

COMMIT;
