import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { query } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    let article;

    try {
      article = await prisma.article.findUnique({
        where: { slug },
        include: {
          author: { select: { id: true, name: true } },
          verification: { select: { score: true, apiResponse: true, notes: true, isManualCheck: true } },
        },
      });
    } catch {
      console.log("Prisma unavailable, falling back to Management API for article detail");
      const rows = await query(`
        SELECT a.*, u.id as author_id, u.name as author_name
        FROM "articles" a
        LEFT JOIN "users" u ON u.id = a.author_id::uuid
        WHERE a.slug = '${slug.replace(/'/g, "''")}'
        LIMIT 1
      `);

      if (rows.length === 0) {
        return NextResponse.json({ code: 404, message: "Artikel tidak ditemukan" }, { status: 404 });
      }

      const r = rows[0] as Record<string, unknown>;
      article = {
        id: r.id, slug: r.slug, title: r.title, content: r.content,
        thumbnailUrl: r.thumbnail_url, category: r.category,
        verificationScore: r.verification_score,
        verificationStatus: r.verification_status,
        readingTime: r.reading_time, publishedAt: r.published_at,
        createdAt: r.created_at, updatedAt: r.updated_at,
        author: r.author_id ? { id: r.author_id, name: r.author_name } : null,
      };

      const verRows = await query(`
        SELECT score, api_response, notes, is_manual_check
        FROM "verifications"
        WHERE article_id = '${String(r.id).replace(/'/g, "''")}'
        LIMIT 1
      `);
      if (verRows.length > 0) {
        const v = verRows[0] as Record<string, unknown>;
        (article as Record<string, unknown>).verification = {
          score: v.score, apiResponse: v.api_response,
          notes: v.notes, isManualCheck: v.is_manual_check,
        };
      }
    }

    if (!article) {
      return NextResponse.json({ code: 404, message: "Artikel tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Fetch article error:", error);
    return NextResponse.json({ code: 5000, message: "Internal server error" }, { status: 500 });
  }
}
