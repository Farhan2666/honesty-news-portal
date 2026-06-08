DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('GUEST', 'MEMBER', 'EDITOR', 'ADMIN', 'FACT_CHECKER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VerificationStatus') THEN
    CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FLAGGED', 'REJECTED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "users" ("id" TEXT NOT NULL, "email" TEXT NOT NULL, "password_hash" TEXT NOT NULL, "name" TEXT NOT NULL, "role" "UserRole" NOT NULL DEFAULT 'MEMBER', "preferences" JSONB DEFAULT '{}', "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "users_pkey" ON "users"("id");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "articles" ("id" TEXT NOT NULL, "slug" TEXT NOT NULL, "title" TEXT NOT NULL, "content" TEXT NOT NULL, "thumbnail_url" TEXT, "category" TEXT NOT NULL, "verification_score" DOUBLE PRECISION, "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING', "reading_time" INTEGER, "published_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, "author_id" TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "articles_pkey" ON "articles"("id");
CREATE UNIQUE INDEX IF NOT EXISTS "articles_slug_key" ON "articles"("slug");
CREATE INDEX IF NOT EXISTS "articles_verification_status_idx" ON "articles"("verification_status");
CREATE INDEX IF NOT EXISTS "articles_category_idx" ON "articles"("category");
CREATE INDEX IF NOT EXISTS "articles_published_at_idx" ON "articles"("published_at");

CREATE TABLE IF NOT EXISTS "verifications" ("id" TEXT NOT NULL, "article_id" TEXT NOT NULL, "api_response" JSONB, "is_manual_check" BOOLEAN NOT NULL DEFAULT false, "reviewer_id" TEXT, "score" DOUBLE PRECISION, "notes" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "verifications_pkey" ON "verifications"("id");
CREATE UNIQUE INDEX IF NOT EXISTS "verifications_article_id_key" ON "verifications"("article_id");

CREATE TABLE IF NOT EXISTS "bookmarks" ("id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "article_id" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX IF NOT EXISTS "bookmarks_pkey" ON "bookmarks"("id");
CREATE UNIQUE INDEX IF NOT EXISTS "bookmarks_user_id_article_id_key" ON "bookmarks"("user_id", "article_id");

CREATE TABLE IF NOT EXISTS "categories" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "categories_pkey" ON "categories"("id");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");

CREATE TABLE IF NOT EXISTS "audit_logs" ("id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "action" TEXT NOT NULL, "metadata" JSONB, "ip_address" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX IF NOT EXISTS "audit_logs_pkey" ON "audit_logs"("id");
