export type UserRole = "GUEST" | "MEMBER" | "EDITOR" | "ADMIN" | "FACT_CHECKER";

export type VerificationStatus = "PENDING" | "VERIFIED" | "FLAGGED" | "REJECTED";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  preferences: Record<string, unknown>;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  category: string;
  verificationScore: number | null;
  verificationStatus: VerificationStatus;
  readingTime: number | null;
  publishedAt: string | null;
  author: { id: string; name: string };
  isBookmarked?: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};
