"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(email, password, name);
    setLoading(false);
    if (result.ok) {
      router.push("/");
    } else {
      setError(result.error || "Registrasi gagal");
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-[var(--font-serif)] text-navy">Daftar</h1>
            <p className="text-sm text-gray-500 mt-1">Bergabung dengan HONESTY</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm" />
              <p className="text-xs text-gray-400 mt-1">Minimal 8 karakter</p>
            </div>
            <button type="submit" disabled={loading} className="w-full px-4 py-2.5 bg-navy text-white font-medium rounded hover:bg-navy/90 transition-colors disabled:opacity-50">
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-navy font-semibold hover:text-gold transition-colors">Masuk</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
