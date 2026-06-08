import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { apiError } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(4001, parsed.error.errors[0].message);
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError(4002, "Email sudah terdaftar");
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    const token = signToken({ userId: user.id, role: user.role });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, preferences: {} },
    });
  } catch (error) {
    console.error("Register error:", error);
    return apiError(5000, "Internal server error", 500);
  }
}
