import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { query } from "@/lib/db";
import { fetchTopNews } from "@/lib/news-api";

async function fetchArticlesViaPrisma(category: string | null, page: number, limit: number, skip: number) {
  const where = category && category !== "all"
    ? { category }
    : {};

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: {
        id: true, slug: true, title: true, content: true, thumbnailUrl: true,
        category: true, verificationScore: true, verificationStatus: true,
        readingTime: true, publishedAt: true,
        source: true, sourceUrl: true, authorName: true,
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
             a.source, a.source_url, a.author_name,
             u.id as author_id, u.name as author_name_user
      FROM "articles" a
      LEFT JOIN "users" u ON u.id = a.author_id::uuid
      WHERE (a.verification_status = 'VERIFIED' OR a.source = 'gnews') ${catFilter}
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
    source: r.source, sourceUrl: r.source_url, authorName: r.author_name,
    author: r.author_id ? { id: r.author_id, name: r.author_name_user || "" } : null,
  }));
  const total = Number((countResult[0] as Record<string, unknown>)?.cnt ?? 0);
  return { articles, total };
}

function liveSlug(url: string, i: number): string {
  let hash = 0;
  for (let j = 0; j < url.length; j++) {
    hash = ((hash << 5) - hash) + url.charCodeAt(j);
    hash |= 0;
  }
  return `live-${Math.abs(hash).toString(36)}-${i}`;
}

async function fetchLiveNewsFallback(category: string | null, limit: number) {
  const rawArticles = await fetchTopNews(category || undefined, Math.min(limit, 20));
  const articles = rawArticles.map((raw, i) => {
    const slug = liveSlug(raw.url, i);
    return {
    id: slug,
    slug,
    title: raw.title,
    content: raw.content || raw.description || "",
    thumbnailUrl: raw.image,
    category: category || "umum",
    verificationScore: 0.5,
    verificationStatus: "PENDING" as const,
    readingTime: 3,
    publishedAt: raw.publishedAt,
    author: { id: "api", name: raw.source.name },
    };
  });
  return { articles, total: articles.length };
}

const CATEGORY_MAP_REVERSE: Record<string, string> = {
  umum: "general", dunia: "world", nasional: "nation",
  bisnis: "business", teknologi: "technology",
  hiburan: "entertainment", olahraga: "sports",
  sains: "science", kesehatan: "health",
};

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
    } catch (e1) {
      console.log("Prisma unavailable, trying Management API:", e1);
      try {
        result = await fetchArticlesViaApi(category, limit, skip);
      } catch (e2) {
        console.log("Management API unavailable, falling back to live news:", e2);
        const liveCategory = category && CATEGORY_MAP_REVERSE[category];
        result = await fetchLiveNewsFallback(liveCategory || null, limit);
      }
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
