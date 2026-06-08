import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { articleSchema } from "@/lib/validations";
import { authenticateRequest, apiError } from "@/lib/api-utils";

export async function GET(request: Request) {
  const auth = authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    return apiError(403, "Forbidden", 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = status && status !== "all"
      ? { verificationStatus: status as any }
      : {};

    const articles = await prisma.article.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        verificationStatus: true,
        verificationScore: true,
        publishedAt: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

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

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

    const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

    const article = await prisma.article.create({
      data: {
        slug,
        title,
        content,
        category,
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

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error("Create article error:", error);
    return apiError(5000, "Internal server error", 500);
  }
}
