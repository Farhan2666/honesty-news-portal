import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  try {
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
      id: r.id,
      slug: r.slug,
      title: r.title,
      content: r.content,
      thumbnailUrl: r.thumbnail_url,
      category: r.category,
      verificationScore: r.verification_score,
      verificationStatus: r.verification_status,
      readingTime: r.reading_time,
      publishedAt: r.published_at,
      author: r.author_id ? { id: r.author_id, name: r.author_name } : null,
    }));

    const total = Number((countResult[0] as Record<string, unknown>)?.cnt ?? 0);

    return NextResponse.json({
      articles,
      pagination: { page, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Fetch articles error:", error);
    return NextResponse.json({ code: 5000, message: "Internal server error" }, { status: 500 });
  }
}
