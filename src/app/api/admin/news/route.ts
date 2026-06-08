import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { articleSchema } from "@/lib/validations";
import { authenticateRequest, apiError } from "@/lib/api-utils";
import { query } from "@/lib/db";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
}

export async function GET(request: Request) {
  const auth = authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    return apiError(403, "Forbidden", 403);
  }

  try {
    let articles;
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const where = status && status !== "all"
        ? { verificationStatus: status as any }
        : {};
      articles = await prisma.article.findMany({
        where,
        select: {
          id: true, slug: true, title: true, category: true,
          verificationStatus: true, verificationScore: true,
          publishedAt: true, createdAt: true,
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      console.log("Prisma unavailable for admin GET, falling back to Management API");
      const rows = await query(`
        SELECT a.id, a.slug, a.title, a.category, a.verification_status,
               a.verification_score, a.published_at, a.created_at,
               u.id as author_id, u.name as author_name
        FROM "articles" a
        LEFT JOIN "users" u ON u.id = a.author_id::uuid
        ORDER BY a.created_at DESC
      `);
      articles = rows.map((r: Record<string, unknown>) => ({
        id: r.id, slug: r.slug, title: r.title, category: r.category,
        verificationStatus: r.verification_status,
        verificationScore: r.verification_score,
        publishedAt: r.published_at, createdAt: r.created_at,
        author: r.author_id ? { id: r.author_id, name: r.author_name } : null,
      }));
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Admin fetch error:", error);
    return apiError(5000, "Internal server error", 500);
  }
}

export async function POST(request: Request) {
  const auth = authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    return apiError(403, "Forbidden", 403);
  }

  try {
    const body = await request.json();
    const parsed = articleSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(4001, parsed.error.errors[0].message);
    }

    const { title, content, category, thumbnailUrl } = parsed.data;
    const slug = generateSlug(title);
    const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

    let article;
    try {
      article = await prisma.article.create({
        data: {
          slug, title, content, category,
          thumbnailUrl: thumbnailUrl || null,
          readingTime,
          authorId: user.userId,
          verificationStatus: "PENDING",
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: "ARTICLE_CREATE",
          metadata: { articleId: article.id, title },
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        },
      });
    } catch {
      console.log("Prisma unavailable for admin POST, falling back to Management API");
      const rows = await query(`
        INSERT INTO "articles" (slug, title, content, category, thumbnail_url, reading_time, author_id, verification_status, published_at, created_at, updated_at)
        VALUES ('${slug.replace(/'/g, "''")}',
                '${title.replace(/'/g, "''")}',
                '${content.replace(/'/g, "''")}',
                '${category.replace(/'/g, "''")}',
                ${thumbnailUrl ? `'${thumbnailUrl.replace(/'/g, "''")}'` : "NULL"},
                ${readingTime},
                '${user.userId.replace(/'/g, "''")}',
                'PENDING',
                NOW(), NOW(), NOW()
        ) RETURNING id, slug, title, category, verification_status;
      `);
      article = rows[0];
    }

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error("Create article error:", error);
    return apiError(5000, "Internal server error", 500);
  }
}
