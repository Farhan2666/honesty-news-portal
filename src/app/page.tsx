import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { NewsFeed } from "@/components/home/news-feed";
import { NewsletterSection } from "@/components/home/newsletter";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <NewsFeed />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
