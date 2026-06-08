import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { apiError } from "@/lib/api-utils";
import { query } from "@/lib/db";

async function registerViaPrisma(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("EMAIL_EXISTS");
  const passwordHash = await hashPassword(password);
  return prisma.user.create({ data: { email, passwordHash, name } });
}

async function registerViaApi(email: string, password: string, name: string) {
  const existing = await query(`SELECT id FROM public.users WHERE email = '${email.replace(/'/g, "''")}' LIMIT 1`);
  if (existing.length > 0) throw new Error("EMAIL_EXISTS");
  const passwordHash = await hashPassword(password);
  const rows = await query(
    `INSERT INTO public.users (name, email, password, role) VALUES ('${name.replace(/'/g, "''")}', '${email.replace(/'/g, "''")}', '${passwordHash.replace(/'/g, "''")}', 'user') RETURNING id, name, email, role, created_at`
  );
  return rows[0];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(4001, parsed.error.errors[0].message);
    }

    const { email, password, name } = parsed.data;

    let user: Record<string, unknown>;
    try {
      user = await registerViaPrisma(email, password, name) as unknown as Record<string, unknown>;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "EMAIL_EXISTS") return apiError(4002, "Email sudah terdaftar");
      console.log("Prisma unavailable for register, falling back to Management API");
      user = await registerViaApi(email, password, name);
    }

    const token = signToken({ userId: user.id as string, role: (user.role as string) ?? "user" });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role ?? "user", preferences: {} },
    });
  } catch (error) {
    console.error("Register error:", error);
    return apiError(5000, "Internal server error", 500);
  }
}
