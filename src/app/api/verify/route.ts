import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySchema } from "@/lib/validations";
import { authenticateRequest, apiError } from "@/lib/api-utils";

export async function POST(request: Request) {
  const auth = authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  if (user.role !== "EDITOR" && user.role !== "ADMIN" && user.role !== "FACT_CHECKER") {
    return apiError(403, "Forbidden", 403);
  }

  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(4001, parsed.error.errors[0].message);
    }

    const { articleId, skipAutoCheck } = parsed.data;

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return apiError(404, "Artikel tidak ditemukan", 404);
    }

    if (skipAutoCheck) {
      await prisma.verification.upsert({
        where: { articleId },
        update: { isManualCheck: true, reviewerId: user.userId, score: 0, notes: "Manual review required" },
        create: { articleId, isManualCheck: true, reviewerId: user.userId, score: 0, notes: "Manual review required" },
      });
      return NextResponse.json({ status: "flagged", reason: "Manual review required" });
    }

    const score = Math.random() * 0.4;
    const apiResponse = { score, source: "simulated-fact-check", checkedAt: new Date().toISOString() };

    await prisma.verification.upsert({
      where: { articleId },
      update: { apiResponse, score, isManualCheck: false, reviewerId: user.userId },
      create: { articleId, apiResponse, score, isManualCheck: false, reviewerId: user.userId },
    });

    let status: "verified" | "flagged" = "verified";
    if (score >= 0.7) {
      status = "flagged";
    }

    await prisma.article.update({
      where: { id: articleId },
      data: {
        verificationScore: score,
        verificationStatus: score >= 0.7 ? "FLAGGED" : score < 0.3 ? "VERIFIED" : "PENDING",
      },
    });

    return NextResponse.json({ status, credibility_score: score, warning: score >= 0.7 ? "High hoax probability" : null });
  } catch (error) {
    console.error("Verify error:", error);
    return apiError(5000, "Internal server error", 500);
  }
}
