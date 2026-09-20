import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

// Every field a user can submit is validated server-side with zod — never
// trust client-side validation alone, since it's trivial to bypass by
// calling the API directly. Strings that get rendered back to other users
// are also passed through DOMPurify to strip any HTML/script content
// (defense against stored XSS).

export function clean(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

export const productSubmissionSchema = z.object({
  name: z.string().min(2).max(80).transform(clean),
  description: z.string().min(10).max(280).transform(clean),
  url: z.string().url().max(300),
  handle: z.string().max(50).optional().transform((v) => (v ? clean(v) : v)),
  categorySlug: z.string().min(1).max(50),
  bidCents: z
    .number()
    .int()
    .min(500, "Minimum bid is $5.00")
    .max(10_000_000, "Bid is too large"),
});

export type ProductSubmission = z.infer<typeof productSubmissionSchema>;
