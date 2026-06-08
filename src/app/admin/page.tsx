"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiPencil, HiShieldCheck, HiDocumentText } from "react-icons/hi";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, flagged: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("honesty_token");
        const res = await fetch("/api/admin/news", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const articles = data.articles ?? [];
        setStats({
          total: articles.length,
          pending: articles.filter((a: any) => a.verificationStatus === "PENDING").length,
          verified: articles.filter((a: any) => a.verificationStatus === "VERIFIED").length,
          flagged: articles.filter((a: any) => a.verificationStatus === "FLAGGED").length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold font-[var(--font-serif)] text-navy mb-6">Dashboard Admin</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <HiDocumentText className="text-gray-400 mb-2" size={24} />
          <p className="text-2xl font-bold text-navy">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Artikel</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <HiShieldCheck className="text-yellow-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-navy">{stats.pending}</p>
          <p className="text-xs text-gray-500">Pending Verifikasi</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <HiShieldCheck className="text-verified mb-2" size={24} />
          <p className="text-2xl font-bold text-navy">{stats.verified}</p>
          <p className="text-xs text-gray-500">Terverifikasi</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <HiShieldCheck className="text-red-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-navy">{stats.flagged}</p>
          <p className="text-xs text-gray-500">Diflag</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/admin/create" className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded text-sm hover:bg-navy/90 transition-colors">
          <HiPencil size={16} /> Buat Artikel Baru
        </Link>
        <Link href="/admin/verify" className="flex items-center gap-2 px-4 py-2 border border-navy text-navy rounded text-sm hover:bg-navy/5 transition-colors">
          <HiShieldCheck size={16} /> Verifikasi Artikel
        </Link>
      </div>
    </div>
  );
}
