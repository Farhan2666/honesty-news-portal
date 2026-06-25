import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, requireRole } from "@/lib/api-utils";
import { fetchTopNews, searchNews, slugify, estimateReadingTime } from "@/lib/news-api";

const CATEGORY_MAP: Record<string, string> = {
  general: "umum",
  world: "dunia",
  nation: "nasional",
  business: "bisnis",
  technology: "teknologi",
  entertainment: "hiburan",
  sports: "olahraga",
  science: "sains",
  health: "kesehatan",
};

export async function POST(request: Request) {
  const auth = authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const roleCheck = requireRole(auth.user, ["ADMIN", "EDITOR"]);
  if (roleCheck) return roleCheck;

  try {
    const body = await request.json().catch(() => ({}));
    const category = body.category as string | undefined;
    const q = body.query as string | undefined;
    const max = Math.min(body.max ?? 10, 50);

    const rawArticles = q
      ? await searchNews(q, max)
      : await fetchTopNews(category, max);

    let created = 0;
    let skipped = 0;

    for (const raw of rawArticles) {
      if (!raw.title || !raw.content) {
        skipped++;
        continue;
      }

      let slug = slugify(raw.title);
      const existing = await prisma.article.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      const categorySlug = CATEGORY_MAP[category ?? "general"] || "umum";
      const sourceLine = `---\n*Sumber: ${raw.source.name} — [Baca artikel asli](${raw.url})*\n\n`;

      await prisma.article.create({
        data: {
          slug,
          title: raw.title.slice(0, 500),
          content: sourceLine + (raw.content || raw.description || ""),
          thumbnailUrl: raw.image,
          category: categorySlug,
          verificationStatus: "PENDING",
          verificationScore: 0.1 + Math.random() * 0.3,
          readingTime: estimateReadingTime(raw.content || raw.description || ""),
          publishedAt: new Date(raw.publishedAt),
          author: {
            connect: { id: auth.user.userId },
          },
        },
      });
      created++;
    }

    return NextResponse.json({
      synced: true,
      created,
      skipped,
      total: rawArticles.length,
    });
  } catch (error) {
    console.error("News sync error:", error);
    return NextResponse.json(
      { code: 5000, message: "Gagal sinkronisasi berita" },
      { status: 500 }
    );
  }
}
