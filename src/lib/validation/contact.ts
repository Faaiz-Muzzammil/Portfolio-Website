import { z } from "zod";

/**
 * One schema, imported by both `sections/Contact.tsx` (via zodResolver) and
 * `app/api/contact/route.ts`. The server re-parses — a client-side parse is
 * a convenience, never a trust boundary.
 *
 * zod is v3 here: `z.string().email()`, not the v4 `z.email()`.
 */
/* THREE FIELDS, AND `topic` IS NOT ONE OF THEM ANY MORE.
   It was a required select — four options, one of which was "Something
   else" — and it earned none of what it cost. Every answer it could
   give is the first line of the message anyway, so it bought no
   information; it was required, so it was a fourth thing to get past
   before writing; and being required meant it could fail validation,
   which is a form telling someone their message is wrong when the
   message is fine. The subject line of the mail it sends is built from
   the name now. */
export const contactSchema = z.object({
    name: z.string().trim().min(2, "Please enter your name").max(80),
    email: z.string().trim().email("Enter a valid email address").max(160),
    message: z
        .string()
        .trim()
        .min(20, "A little more detail, please — at least 20 characters")
        .max(4000, "That's over 4000 characters"),
    // Bots fill hidden fields; humans can't see this one.
    // No `.default()` here — it would make the inferred input and output
    // types differ, which react-hook-form's resolver typing rejects.
    honeypot: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/* A `CONTACT_TOPICS` list lived here, feeding the topic select. It went
   with the field — see the note above. */
