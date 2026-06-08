import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, apiError } from "@/lib/api-utils";

export async function POST(request: Request) {
  const auth = authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { articleId } = await request.json();
  if (!articleId) return apiError(4001, "articleId required");

  try {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_articleId: { userId: auth.user.userId, articleId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    }

    await prisma.bookmark.create({
      data: { userId: auth.user.userId, articleId },
    });
    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    console.error("Bookmark error:", error);
    return apiError(5000, "Internal server error", 500);
  }
}

export async function GET(request: Request) {
  const auth = authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: auth.user.userId },
      include: {
        article: {
          select: {
            id: true,
            slug: true,
            title: true,
            thumbnailUrl: true,
            category: true,
            readingTime: true,
            publishedAt: true,
            verificationStatus: true,
            author: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookmarks });
  } catch {
    return apiError(5000, "Internal server error", 500);
  }
}
