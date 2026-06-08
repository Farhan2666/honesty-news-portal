import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { apiError } from "@/lib/api-utils";
import { query } from "@/lib/db";

async function loginViaPrisma(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("NOT_FOUND");
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new Error("WRONG_PASSWORD");
  return user;
}

async function loginViaApi(email: string, password: string) {
  const rows = await query(
    `SELECT id, name, email, password, role FROM public.users WHERE email = '${email.replace(/'/g, "''")}' LIMIT 1`
  );
  if (rows.length === 0) throw new Error("NOT_FOUND");
  const user = rows[0] as Record<string, unknown>;
  try {
    const valid = await comparePassword(password, user.password as string);
    if (!valid) throw new Error("WRONG_PASSWORD");
  } catch {
    // plain text fallback (for users created via Management API)
    if (user.password !== password) throw new Error("WRONG_PASSWORD");
  }
  return user;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(4001, parsed.error.errors[0].message);
    }

    const { email, password } = parsed.data;

    let user: Record<string, unknown>;
    try {
      user = await loginViaPrisma(email, password) as unknown as Record<string, unknown>;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "NOT_FOUND") return apiError(4003, "Email atau password salah");
      if (msg === "WRONG_PASSWORD") return apiError(4003, "Email atau password salah");
      console.log("Prisma unavailable for login, falling back to Management API");
      user = await loginViaApi(email, password);
    }

    const token = signToken({ userId: user.id as string, role: (user.role as string) ?? "user" });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role ?? "user", preferences: {} },
    });
  } catch (error) {
    console.error("Login error:", error);
    return apiError(5000, "Internal server error", 500);
  }
}
