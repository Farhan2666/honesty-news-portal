import { NextResponse } from "next/server";
import { fetchTopNews, searchNews } from "@/lib/news-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const query = searchParams.get("q") || undefined;
  const max = parseInt(searchParams.get("max") ?? "10");

  try {
    const articles = query
      ? await searchNews(query, Math.min(max, 50))
      : await fetchTopNews(category, Math.min(max, 50));

    return NextResponse.json({
      articles: articles.map((a) => ({
        title: a.title,
        description: a.description,
        content: a.content,
        url: a.url,
        image: a.image,
        publishedAt: a.publishedAt,
        source: a.source.name,
      })),
    });
  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json(
      { code: 5000, message: "Gagal mengambil berita" },
      { status: 500 }
    );
  }
}
