export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-[#002a5c]">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gold rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs text-gold font-medium mb-4">
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            Verified News Platform
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-[var(--font-serif)] text-white leading-tight mb-4">
            Truth, Clarity,{" "}
            <span className="text-gold">Integrity.</span>
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-xl mb-6">
            Portal berita terverifikasi tanpa clickbait. Kami menyajikan fakta, bukan sensasi. 
            Baca berita yang bisa dipercaya.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#news-feed" className="px-6 py-2.5 bg-gold text-navy font-semibold rounded hover:bg-gold/90 transition-colors">
              Mulai Baca
            </a>
            <a href="/register" className="px-6 py-2.5 border border-white/30 text-white rounded hover:bg-white/10 transition-colors">
              Daftar Sekarang
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
