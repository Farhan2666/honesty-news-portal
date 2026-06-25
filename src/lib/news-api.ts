export type NewsSource = "gnews" | "manual";

export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}

interface GNewsResponse {
  totalArticles: number;
  articles: {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string | null;
    publishedAt: string;
    source: { name: string; url: string };
  }[];
}

const GNEWS_BASE = "https://gnews.io/api/v4";

function getApiKey(): string {
  const key = process.env.GNEWS_API_KEY;
  if (!key) throw new Error("GNEWS_API_KEY environment variable not set");
  return key;
}

export async function fetchTopNews(
  category?: string,
  max: number = 10,
  lang: string = "id"
): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    apikey: getApiKey(),
    lang,
    max: String(max),
  });
  if (category) params.set("category", category);

  const res = await fetch(`${GNEWS_BASE}/top-headlines?${params}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("GNews API error:", res.status, text);
    throw new Error(`GNews API failed (${res.status})`);
  }

  const data: GNewsResponse = await res.json();
  return data.articles;
}

export async function searchNews(
  query: string,
  max: number = 10,
  lang: string = "id"
): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    apikey: getApiKey(),
    q: query,
    lang,
    max: String(max),
  });

  const res = await fetch(`${GNEWS_BASE}/search?${params}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("GNews search error:", res.status, text);
    throw new Error(`GNews search failed (${res.status})`);
  }

  const data: GNewsResponse = await res.json();
  return data.articles;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200) || `news-${Date.now()}`;
}

export function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
