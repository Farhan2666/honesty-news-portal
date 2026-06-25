import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTopNews, slugify, estimateReadingTime } from "@/lib/news-api";

const CRON_SECRET = process.env.CRON_SECRET;

const CATEGORY_MAP: Record<string, string> = {
  general: "umum", world: "dunia", nation: "nasional",
  business: "bisnis", technology: "teknologi",
  entertainment: "hiburan", sports: "olahraga",
  science: "sains", health: "kesehatan",
};

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let adminId: string | null = null;
  try {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    adminId = admin?.id ?? null;
  } catch { /* no admin found, skip author link */ }

  const categories = ["technology", "world", "business", "science", "health", "entertainment", "sports", "general"];
  let totalCreated = 0;

  for (const cat of categories) {
    try {
      const articles = await fetchTopNews(cat, 5, "id");
      for (const raw of articles) {
        if (!raw.title || !raw.content) continue;
        let slug = slugify(raw.title);
        const existing = await prisma.article.findUnique({ where: { slug } });
        if (existing) slug = `${slug}-${Date.now()}`;

        const sourceLine = `---\n*Sumber: ${raw.source.name} — [Baca artikel asli](${raw.url})*\n\n`;

        await prisma.article.create({
          data: {
            slug,
            title: raw.title.slice(0, 500),
            content: sourceLine + (raw.content || raw.description || ""),
            thumbnailUrl: raw.image,
            category: CATEGORY_MAP[cat] || "umum",
            verificationStatus: "PENDING",
            verificationScore: 0.1 + Math.random() * 0.3,
            readingTime: estimateReadingTime(raw.content || raw.description || ""),
            publishedAt: new Date(raw.publishedAt),
            ...(adminId ? { author: { connect: { id: adminId } } } : {}),
          },
        });
        totalCreated++;
      }
    } catch (e) {
      console.error(`Cron sync error for ${cat}:`, e);
    }
  }

  return NextResponse.json({ synced: true, created: totalCreated });
}
