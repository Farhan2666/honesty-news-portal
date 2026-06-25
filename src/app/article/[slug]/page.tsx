"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/context/auth-context";
import { HiBookmark, HiSpeakerphone, HiVolumeOff } from "react-icons/hi";
import type { Article } from "@/types";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/articles/${slug}`);
        const data = await res.json();
        setArticle(data.article);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug]);

  const toggleBookmark = async () => {
    if (!token || !article) return;
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ articleId: article.id }),
    });
    const data = await res.json();
    setBookmarked(data.bookmarked);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-64 bg-gray-100 rounded" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-400 text-lg">Artikel tidak ditemukan.</p>
        </main>
        <Footer />
      </>
    );
  }

  const isVerified = article.verificationStatus === "VERIFIED";

  return (
    <>
      <Header />
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{article.category}</span>
              {isVerified && (
                <span className="bg-verified/10 text-verified text-xs px-2 py-0.5 rounded flex items-center gap-1 border border-verified/20">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                  Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold font-[var(--font-serif)] text-navy leading-tight mb-3">
              {article.title}
            </h1>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>Oleh <strong className="text-gray-700">{article.author?.name || "HONESTY"}</strong></span>
                <span>{article.readingTime} menit baca</span>
              </div>
              <div className="flex items-center gap-2">
                {user && (
                  <button onClick={toggleBookmark} className={`p-2 rounded transition-colors ${bookmarked ? "text-gold" : "text-gray-400 hover:text-gray-600"}`}>
                    <HiBookmark size={20} />
                  </button>
                )}
                <button onClick={() => setAudioOn(!audioOn)} className="p-2 rounded text-gray-400 hover:text-gray-600 transition-colors">
                  {audioOn ? <HiSpeakerphone size={20} /> : <HiVolumeOff size={20} />}
                </button>
              </div>
            </div>
          </div>

          {article.thumbnailUrl && (
            <div className="aspect-[16/9] bg-soft-grey rounded-lg overflow-hidden mb-8">
              <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          {audioOn && (
            <div className="bg-soft-grey rounded-lg p-4 mb-6 flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-1 bg-gold rounded-full animate-bounce" style={{ height: `${12 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-sm text-gray-600">Audio narration (simulated) — playing...</span>
              <button onClick={() => setAudioOn(false)} className="ml-auto text-xs text-gray-500 hover:text-red-500">Stop</button>
            </div>
          )}

          <div className="prose prose-gray max-w-none">
            {article.content.split("\n").map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed text-gray-700 mb-4">{paragraph}</p>
            ))}
          </div>

          {isVerified && (
            <div className="mt-8 p-4 rounded-lg border bg-verified/5 border-verified/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-verified" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                <span className="font-semibold text-sm text-verified">Konten Terverifikasi</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Artikel ini telah melalui proses verifikasi dan dinyatakan aman dari hoaks.
              </p>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
