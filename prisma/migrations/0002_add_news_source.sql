ALTER TABLE "articles"
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS author_name TEXT;

ALTER TABLE "articles"
  ALTER COLUMN author_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS articles_source_idx ON "articles" (source);
