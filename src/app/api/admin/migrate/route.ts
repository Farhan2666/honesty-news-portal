import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer admin-migrate-2026`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "articles" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT NOT NULL UNIQUE,
      "title" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "thumbnail_url" TEXT,
      "category" TEXT NOT NULL DEFAULT 'general',
      "verification_score" DOUBLE PRECISION DEFAULT 0,
      "verification_status" TEXT NOT NULL DEFAULT 'PENDING',
      "reading_time" INTEGER,
      "published_at" TIMESTAMPTZ,
      "source" TEXT DEFAULT 'manual',
      "source_url" TEXT,
      "source_id" TEXT,
      "author_name" TEXT,
      "author_id" TEXT,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "password_hash" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'USER',
      "avatar_url" TEXT,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "verifications" (
      "id" TEXT PRIMARY KEY,
      "article_id" TEXT NOT NULL UNIQUE REFERENCES "articles"("id"),
      "api_response" JSONB,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "confidence" DOUBLE PRECISION DEFAULT 0,
      "checked_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "bookmarks" (
      "id" TEXT PRIMARY KEY,
      "user_id" TEXT NOT NULL REFERENCES "users"("id"),
      "article_id" TEXT NOT NULL REFERENCES "articles"("id"),
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE("user_id", "article_id")
    )`);

    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "responses" (
      "id" TEXT PRIMARY KEY,
      "article_id" TEXT NOT NULL REFERENCES "articles"("id"),
      "user_id" TEXT REFERENCES "users"("id"),
      "type" TEXT NOT NULL DEFAULT 'COMMENT',
      "content" TEXT NOT NULL,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "articles_category_idx" ON "articles"("category");
      CREATE INDEX IF NOT EXISTS "articles_published_at_idx" ON "articles"("published_at");
      CREATE INDEX IF NOT EXISTS "articles_verification_status_idx" ON "articles"("verification_status");
      CREATE INDEX IF NOT EXISTS "bookmarks_user_id_idx" ON "bookmarks"("user_id");
      CREATE INDEX IF NOT EXISTS "bookmarks_article_id_idx" ON "bookmarks"("article_id");
      CREATE INDEX IF NOT EXISTS "responses_article_id_idx" ON "responses"("article_id");
    `);

    await prisma.$disconnect();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
