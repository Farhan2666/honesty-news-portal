"use client";

import { useEffect, useState } from "react";
import { HiShieldCheck, HiX } from "react-icons/hi";

export default function VerifyPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem("honesty_token");
      const res = await fetch("/api/admin/news?status=all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setArticles(data.articles ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleVerify = async (articleId: string, skipAutoCheck: boolean = false) => {
    try {
      const token = localStorage.getItem("honesty_token");
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ articleId, skipAutoCheck }),
      });
      const data = await res.json();
      alert(`Status: ${data.status}${data.warning ? ` — ${data.warning}` : ""}`);
      fetchArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      VERIFIED: "bg-verified/10 text-verified border-verified/20",
      PENDING: "bg-yellow-50 text-yellow-600 border-yellow-200",
      FLAGGED: "bg-red-50 text-red-600 border-red-200",
      REJECTED: "bg-red-100 text-red-700 border-red-300",
    };
    return `px-2 py-0.5 rounded text-xs border ${colors[status] || "bg-gray-100 text-gray-600"}`;
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Memuat...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-[var(--font-serif)] text-navy">Verifikasi Artikel</h1>
        <button onClick={fetchArticles} className="text-sm text-navy hover:text-gold transition-colors">Refresh</button>
      </div>
      {articles.length === 0 ? (
        <p className="text-gray-400">Belum ada artikel.</p>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="bg-white border border-gray-100 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={statusBadge(article.verificationStatus)}>
                    {article.verificationStatus}
                  </span>
                  <span className="text-xs text-gray-400">{article.category}</span>
                </div>
                <h3 className="font-semibold text-sm text-navy truncate">{article.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {article.author?.name || article.authorName || "GNews"} • {new Date(article.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleVerify(article.id)} className="flex items-center gap-1 px-3 py-1.5 bg-verified text-white rounded text-xs hover:bg-verified/90 transition-colors">
                  <HiShieldCheck size={14} /> Verifikasi
                </button>
                <button onClick={() => handleVerify(article.id, true)} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors">
                  <HiX size={14} /> Manual
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
