import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { apiError } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(4001, parsed.error.errors[0].message);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return apiError(4003, "Email atau password salah");
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return apiError(4003, "Email atau password salah");
    }

    const token = signToken({ userId: user.id, role: user.role });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, preferences: user.preferences ?? {} },
    });
  } catch (error) {
    console.error("Login error:", error);
    return apiError(5000, "Internal server error", 500);
  }
}
