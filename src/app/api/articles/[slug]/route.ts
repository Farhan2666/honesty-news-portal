import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true } },
        verification: { select: { score: true, apiResponse: true, notes: true, isManualCheck: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ code: 404, message: "Artikel tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Fetch article error:", error);
    return NextResponse.json({ code: 5000, message: "Internal server error" }, { status: 500 });
  }
}
