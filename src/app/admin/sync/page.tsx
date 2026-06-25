"use client";

import { useState } from "react";
import { HiRefresh, HiCheck, HiExclamation, HiEye } from "react-icons/hi";

const CATEGORIES = [
  { value: "", label: "Semua Kategori" },
  { value: "general", label: "Umum" },
  { value: "world", label: "Dunia" },
  { value: "nation", label: "Nasional" },
  { value: "business", label: "Bisnis" },
  { value: "technology", label: "Teknologi" },
  { value: "entertainment", label: "Hiburan" },
  { value: "sports", label: "Olahraga" },
  { value: "science", label: "Sains" },
  { value: "health", label: "Kesehatan" },
];

export default function SyncPage() {
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [max, setMax] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    synced: boolean;
    created: number;
    skipped: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<any[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const token = localStorage.getItem("honesty_token");
      const res = await fetch("/api/news/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: category || undefined,
          query: query || undefined,
          max,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal sync");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreview(null);
    try {
      const params = new URLSearchParams({ max: String(max) });
      if (category) params.set("category", category);
      if (query) params.set("q", query);

      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();
      setPreview(data.articles ?? []);
    } catch {
      setError("Gagal mengambil pratinjau");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold font-[var(--font-serif)] text-navy mb-6">
        Sinkronisasi Berita dari API
      </h1>

      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Kata Kunci (opsional)</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh: pemilu, AI, sepakbola"
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Jumlah Artikel</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              min={1}
              max={50}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            disabled={previewLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <HiEye size={16} />
            {previewLoading ? "Memuat..." : "Pratinjau"}
          </button>
          <button
            onClick={handleSync}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded text-sm hover:bg-navy/90 transition-colors disabled:opacity-50"
          >
            <HiRefresh size={16} />
            {loading ? "Menyinkronkan..." : "Sync ke Database"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2 text-red-700 text-sm">
          <HiExclamation size={18} />
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
            <HiCheck size={20} />
            Sinkronisasi Berhasil
          </div>
          <div className="text-sm text-green-600 space-y-1">
            <p>Total dari API: {result.total}</p>
            <p>Artikel baru disimpan: {result.created}</p>
            <p>Diskip (duplikat/kosong): {result.skipped}</p>
          </div>
        </div>
      )}

      {preview && (
        <div>
          <h2 className="text-lg font-bold font-[var(--font-serif)] text-navy mb-4">
            Pratinjau Berita ({preview.length})
          </h2>
          <div className="space-y-3">
            {preview.map((article, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-lg p-4 flex gap-4">
                {article.image && (
                  <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                    <img src={article.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-navy line-clamp-2">{article.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{article.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {article.source} • {new Date(article.publishedAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
