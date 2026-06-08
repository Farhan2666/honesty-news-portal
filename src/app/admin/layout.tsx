"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { HiHome, HiPencil, HiShieldCheck, HiChartBar, HiArrowLeft } from "react-icons/hi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !["ADMIN", "EDITOR", "FACT_CHECKER"].includes(user.role.toUpperCase()))) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-navy border-t-transparent rounded-full" /></div>;
  if (!user || !["ADMIN", "EDITOR", "FACT_CHECKER"].includes(user.role.toUpperCase())) return null;

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: HiChartBar },
    { href: "/admin/create", label: "Buat Artikel", icon: HiPencil },
    { href: "/admin/verify", label: "Verifikasi", icon: HiShieldCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/60 hover:text-white transition-colors"><HiArrowLeft size={20} /></Link>
            <Link href="/admin" className="font-bold font-[var(--font-serif)] text-lg">HONESTY Admin</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/60">{user.name} ({user.role})</span>
            <Link href="/" className="text-xs text-white/60 hover:text-white">Lihat Situs</Link>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <nav className="w-56 bg-white border-r border-gray-100 hidden md:block">
          <div className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${isActive ? "bg-navy/10 text-navy font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
