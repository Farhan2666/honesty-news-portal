import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/api-utils";

export async function GET(request: Request) {
  const auth = authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  try {
    const where = action ? { action } : {};

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ logs: [] });
  }
}
