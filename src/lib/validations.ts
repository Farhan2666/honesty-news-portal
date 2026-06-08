import { z } from "zod";

const CLICKBAIT_PATTERN = /^(viral|heboh|mengerikan|gila|luar biasa|fakta|breaking news)\b/i;

export const registerSchema = z.object({
  email: z.string().email("Email tidak valid").refine(
    (email) => !email.endsWith("@tempmail.com"),
    "Email disposable tidak diizinkan"
  ),
  password: z.string().min(8, "Password minimal 8 karakter"),
  name: z.string().min(2, "Nama minimal 2 karakter").max(50),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const articleSchema = z.object({
  title: z
    .string()
    .min(10, "Judul minimal 10 karakter")
    .max(120, "Judul maksimal 120 karakter")
    .refine((val) => !CLICKBAIT_PATTERN.test(val), "Judul mengandung kata sensasional"),
  content: z.string().min(200, "Konten minimal 200 karakter"),
  category: z.string().min(1, "Kategori wajib diisi"),
  thumbnailUrl: z.string().url("URL thumbnail tidak valid").optional().or(z.literal("")),
});

export const verifySchema = z.object({
  articleId: z.string().min(1),
  skipAutoCheck: z.boolean().default(false),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
