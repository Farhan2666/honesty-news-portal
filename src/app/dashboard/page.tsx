"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiBookmark, HiClock, HiCog } from "react-icons/hi";

type BookmarkItem = {
  id: string;
  article: {
    id: string;
    slug: string;
    title: string;
    category: string;
    readingTime: number;
    publishedAt: string;
    author: { name: string };
  };
};

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/bookmarks", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setBookmarks(d.bookmarks ?? []))
      .catch(console.error);
  }, [token]);

  if (authLoading || !user) return null;

  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-[var(--font-serif)] text-navy mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                <span className="text-navy font-bold">{user.name[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <HiBookmark className="text-gold" size={24} />
              <p className="font-semibold text-sm">Bookmark</p>
            </div>
            <p className="text-2xl font-bold text-navy">{bookmarks.length}</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <HiClock className="text-gray-400" size={24} />
              <p className="font-semibold text-sm">Riwayat Baca</p>
            </div>
            <p className="text-2xl font-bold text-gray-300">—</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold font-[var(--font-serif)] text-navy mb-4">Bookmark Saya</h2>
          {bookmarks.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada bookmark. Mulai baca dan simpan artikel favorit Anda.</p>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bm) => (
                <Link key={bm.id} href={`/article/${bm.article.slug}`} className="block bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-navy">{bm.article.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{bm.article.category} • {bm.article.readingTime} menit</p>
                    </div>
                    <span className="text-xs text-gray-400">{bm.article.author.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
