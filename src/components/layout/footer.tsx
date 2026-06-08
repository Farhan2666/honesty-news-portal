import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold font-[var(--font-serif)] mb-2">HONESTY</h3>
            <p className="text-sm text-gray-400 max-w-md">
              Portal berita terverifikasi dengan komitmen kejujuran, kejelasan, dan integritas. 
              Bebas clickbait, 100% fakta terverifikasi.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold mb-3">Navigasi</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="/" className="block hover:text-white transition-colors">Home</Link>
              <Link href="/?category=politik" className="block hover:text-white transition-colors">Politik</Link>
              <Link href="/?category=teknologi" className="block hover:text-white transition-colors">Teknologi</Link>
              <Link href="/?category=lifestyle" className="block hover:text-white transition-colors">Lifestyle</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold mb-3">Info</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="/tentang" className="block hover:text-white transition-colors">Tentang</Link>
              <Link href="/kebijakan-privasi" className="block hover:text-white transition-colors">Kebijakan Privasi</Link>
              <Link href="/kontak" className="block hover:text-white transition-colors">Kontak</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} HONESTY News Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
