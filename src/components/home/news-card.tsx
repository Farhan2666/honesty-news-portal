import Link from "next/link";
import type { Article } from "@/types";

export function NewsCard({ article }: { article: Article }) {
  const score = article.verificationScore ?? 0;
  const isVerified = article.verificationStatus === "VERIFIED";

  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <article className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        <div className="aspect-[16/9] bg-soft-grey relative overflow-hidden">
          {article.thumbnailUrl ? (
            <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl font-bold font-[var(--font-serif)]">
              H
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            {isVerified && (
              <span className="bg-verified text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                Verified
              </span>
            )}
            {article.verificationStatus === "FLAGGED" && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">Flagged</span>
            )}
            <span className="bg-navy/80 text-white text-xs px-2 py-0.5 rounded">{article.category}</span>
          </div>
        </div>
        <div className="p-4">
          <h2 className="font-[var(--font-serif)] font-bold text-lg leading-snug text-navy group-hover:text-gold transition-colors line-clamp-2 mb-2">
            {article.title}
          </h2>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.content.slice(0, 120)}...</p>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{article.author.name}</span>
            <span>{article.readingTime} menit baca</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
