import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { query } from "@/lib/db";

async function fetchArticlesViaPrisma(category: string | null, page: number, limit: number, skip: number) {
  const where = category && category !== "all"
    ? { category, verificationStatus: "VERIFIED" as const }
    : { verificationStatus: "VERIFIED" as const };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: {
        id: true, slug: true, title: true, content: true, thumbnailUrl: true,
        category: true, verificationScore: true, verificationStatus: true,
        readingTime: true, publishedAt: true,
        author: { select: { id: true, name: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip, take: limit,
    }),
    prisma.article.count({ where }),
  ]);
  return { articles, total };
}

async function fetchArticlesViaApi(category: string | null, limit: number, skip: number) {
  const catFilter = category && category !== "all" ? `AND "category" = '${category.replace(/'/g, "''")}'` : "";

  const [rows, countResult] = await Promise.all([
    query(`
      SELECT a.id, a.slug, a.title, a.content, a.thumbnail_url, a.category,
             a.verification_score, a.verification_status, a.reading_time, a.published_at,
             u.id as author_id, u.name as author_name
      FROM "articles" a
      LEFT JOIN "users" u ON u.id = a.author_id::uuid
      WHERE a.verification_status = 'VERIFIED' ${catFilter}
      ORDER BY a.published_at DESC
      LIMIT ${limit} OFFSET ${skip}
    `),
    query(`SELECT COUNT(*) as cnt FROM "articles" WHERE verification_status = 'VERIFIED' ${catFilter}`),
  ]);

  const articles = rows.map((r: Record<string, unknown>) => ({
    id: r.id, slug: r.slug, title: r.title, content: r.content,
    thumbnailUrl: r.thumbnail_url, category: r.category,
    verificationScore: r.verification_score, verificationStatus: r.verification_status,
    readingTime: r.reading_time, publishedAt: r.published_at,
    author: r.author_id ? { id: r.author_id, name: r.author_name } : null,
  }));
  const total = Number((countResult[0] as Record<string, unknown>)?.cnt ?? 0);
  return { articles, total };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  try {
    let result;
    try {
      result = await fetchArticlesViaPrisma(category, page, limit, skip);
    } catch {
      console.log("Prisma unavailable, falling back to Management API");
      result = await fetchArticlesViaApi(category, limit, skip);
    }

    return NextResponse.json({
      articles: result.articles,
      pagination: { page, total: result.total, totalPages: Math.ceil(result.total / limit) },
    });
  } catch (error) {
    console.error("Fetch articles error:", error);
    return NextResponse.json({ code: 5000, message: "Internal server error" }, { status: 500 });
  }
}
