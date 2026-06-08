import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  try {
    const where = category && category !== "all" ? { category, verificationStatus: "VERIFIED" as const } : { verificationStatus: "VERIFIED" as const };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          content: true,
          thumbnailUrl: true,
          category: true,
          verificationScore: true,
          verificationStatus: true,
          readingTime: true,
          publishedAt: true,
          author: { select: { id: true, name: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: { page, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Fetch articles error:", error);
    return NextResponse.json({ code: 5000, message: "Internal server error" }, { status: 500 });
  }
}
