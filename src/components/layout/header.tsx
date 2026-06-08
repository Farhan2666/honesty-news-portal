"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

export function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold font-[var(--font-serif)] text-navy tracking-tight">HONESTY</span>
          <span className="hidden sm:inline text-xs uppercase tracking-widest text-gold font-semibold">News</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-navy transition-colors">Home</Link>
          <Link href="/?category=politik" className="text-sm font-medium text-gray-700 hover:text-navy transition-colors">Politik</Link>
          <Link href="/?category=teknologi" className="text-sm font-medium text-gray-700 hover:text-navy transition-colors">Teknologi</Link>
          <Link href="/?category=lifestyle" className="text-sm font-medium text-gray-700 hover:text-navy transition-colors">Lifestyle</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user && ["ADMIN", "EDITOR"].includes(user.role.toUpperCase()) ? (
                <Link href="/admin" className="hidden sm:inline text-sm px-3 py-1.5 rounded bg-navy text-white hover:bg-navy/90 transition-colors">
                  Admin
                </Link>
              ) : null}
              <Link href="/dashboard" className="hidden sm:inline text-sm text-gray-700 hover:text-navy">
                {user.name}
              </Link>
              <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-700 hover:text-navy transition-colors">Masuk</Link>
              <Link href="/register" className="text-sm px-4 py-1.5 rounded bg-navy text-white hover:bg-navy/90 transition-colors">Daftar</Link>
            </>
          )}
          <button className="md:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/?category=politik" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Politik</Link>
          <Link href="/?category=teknologi" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Teknologi</Link>
          <Link href="/?category=lifestyle" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Lifestyle</Link>
        </div>
      )}
    </header>
  );
}
