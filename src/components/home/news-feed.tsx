"use client";

import { useState, useEffect } from "react";
import { NewsCard } from "@/components/home/news-card";
import type { Article } from "@/types";

export function NewsFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { slug: "all", name: "Semua" },
    { slug: "politik", name: "Politik" },
    { slug: "teknologi", name: "Teknologi" },
    { slug: "lifestyle", name: "Lifestyle" },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category") || "all";
    setActiveCategory(cat);
  }, []);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ category: activeCategory });
        const res = await fetch(`/api/articles?${params}`);
        const data = await res.json();
        setArticles(data.articles ?? []);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [activeCategory]);

  return (
    <section id="news-feed" className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold font-[var(--font-serif)] text-navy">Berita Terbaru</h2>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.slug
                ? "bg-navy text-white"
                : "bg-soft-grey text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-[16/9] bg-gray-100" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Belum ada berita di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
