"use client";

import { useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="bg-soft-grey py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold font-[var(--font-serif)] text-navy mb-2">
          Dapatkan Berita Terverifikasi
        </h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Langganan newsletter kami dan dapatkan berita terpercaya langsung di email Anda.
        </p>
        {subscribed ? (
          <p className="text-verified font-medium">Terima kasih! Anda telah berlangganan.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@anda.com"
              required
              className="flex-1 px-4 py-2.5 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
            />
            <button type="submit" className="px-6 py-2.5 bg-navy text-white font-medium rounded hover:bg-navy/90 transition-colors text-sm whitespace-nowrap">
              Berlangganan
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
