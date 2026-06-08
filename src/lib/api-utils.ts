import { NextResponse } from "next/server";
import { verifyToken, type JwtPayload } from "@/lib/auth";

export type AuthenticatedRequest = Request & { user: JwtPayload };

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export function authenticateRequest(request: Request): { user: JwtPayload } | NextResponse {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = verifyToken(token);
    return { user };
  } catch {
    return NextResponse.json({ code: 401, message: "Token expired or invalid" }, { status: 401 });
  }
}

export function requireRole(user: JwtPayload, roles: string[]): NextResponse | null {
  if (!roles.includes(user.role)) {
    return NextResponse.json({ code: 403, message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function apiError(code: number, message: string, status: number = 400) {
  return NextResponse.json({ code, message }, { status });
}
