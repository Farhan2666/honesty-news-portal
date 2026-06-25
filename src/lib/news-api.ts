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

interface FreeNewsResponse {
  status: string;
  totalResults: number;
  articles: {
    source: { id: string | null; name: string };
    author: string | null;
    title: string;
    description: string;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string;
  }[];
}

const GNEWS_BASE = "https://gnews.io/api/v4";
const FREE_NEWS_BASE = "https://saurav.tech/NewsAPI";

const CATEGORY_MAP_FREE: Record<string, string> = {
  general: "general",
  world: "general",
  nation: "general",
  business: "business",
  technology: "technology",
  entertainment: "entertainment",
  sports: "sports",
  science: "science",
  health: "health",
};

function getApiKey(): string | null {
  return process.env.GNEWS_API_KEY || null;
}

async function fetchFromGNews(
  category?: string,
  max: number = 10,
  lang: string = "id"
): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    apikey: getApiKey()!,
    lang,
    max: String(max),
  });
  if (category) params.set("category", category);

  const res = await fetch(`${GNEWS_BASE}/top-headlines?${params}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GNews API failed (${res.status}): ${text}`);
  }

  const data: GNewsResponse = await res.json();
  return data.articles;
}

async function fetchFromFreeNews(
  category?: string,
  max: number = 10,
  country: string = "us"
): Promise<NewsArticle[]> {
  const cat = CATEGORY_MAP_FREE[category || "general"] || "general";
  const res = await fetch(`${FREE_NEWS_BASE}/top-headlines/category/${cat}/${country}.json`, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`FreeNews API failed (${res.status})`);
  }

  const data: FreeNewsResponse = await res.json();
  return data.articles.slice(0, max).map((a) => ({
    title: a.title,
    description: a.description || "",
    content: a.content || a.description || "",
    url: a.url,
    image: a.urlToImage,
    publishedAt: a.publishedAt,
    source: { name: a.source.name, url: a.url },
  }));
}

export async function fetchTopNews(
  category?: string,
  max: number = 10,
  lang: string = "id"
): Promise<NewsArticle[]> {
  if (getApiKey()) {
    try {
      return await fetchFromGNews(category, max, lang);
    } catch (e) {
      console.warn("GNews failed, falling back to FreeNews:", e);
    }
  }
  return await fetchFromFreeNews(category, max);
}

export async function searchNews(
  query: string,
  max: number = 10,
  lang: string = "id"
): Promise<NewsArticle[]> {
  if (getApiKey()) {
    try {
      const params = new URLSearchParams({
        apikey: getApiKey()!,
        q: query,
        lang,
        max: String(max),
      });
      const res = await fetch(`${GNEWS_BASE}/search?${params}`, {
        next: { revalidate: 300 },
      });
      if (res.ok) {
        const data: GNewsResponse = await res.json();
        return data.articles;
      }
    } catch (e) {
      console.warn("GNews search failed, falling back:", e);
    }
  }
  return await fetchFromFreeNews(undefined, max);
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
