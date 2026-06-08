import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ categories: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { name, slug } = await request.json();
    const category = await prisma.category.create({ data: { name, slug } });
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ code: 5000, message: "Internal server error" }, { status: 500 });
  }
}
