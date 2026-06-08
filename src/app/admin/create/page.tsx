"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiCheck } from "react-icons/hi";

export default function CreateArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", category: "politik", thumbnailUrl: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("honesty_token");
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal membuat artikel");
      } else {
        router.push("/admin");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold font-[var(--font-serif)] text-navy mb-6">Buat Artikel Baru</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
        {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            maxLength={120}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">{form.title.length}/120 karakter</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
          >
            <option value="politik">Politik</option>
            <option value="teknologi">Teknologi</option>
            <option value="lifestyle">Lifestyle</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Thumbnail (opsional)</label>
          <input
            type="url"
            value={form.thumbnailUrl}
            onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
            minLength={200}
            rows={12}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">{form.content.length} karakter (min 200)</p>
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white font-medium rounded hover:bg-navy/90 transition-colors disabled:opacity-50">
          {loading ? "Menyimpan..." : <><HiCheck size={18} /> Publikasikan</>}
        </button>
      </form>
    </div>
  );
}
