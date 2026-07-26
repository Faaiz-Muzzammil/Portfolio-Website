import { z } from "zod";

/**
 * One schema, imported by both `sections/Contact.tsx` (via zodResolver) and
 * `app/api/contact/route.ts`. The server re-parses — a client-side parse is
 * a convenience, never a trust boundary.
 *
 * zod is v3 here: `z.string().email()`, not the v4 `z.email()`.
 */
export const contactSchema = z.object({
    name: z.string().trim().min(2, "Please enter your name").max(80),
    email: z.string().trim().email("Enter a valid email address").max(160),
    topic: z.string().min(1, "Pick a topic"),
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

export const CONTACT_TOPICS = [
    { value: "", label: "What's this about?" },
    { value: "Role", label: "A role — full-time or internship" },
    { value: "Freelance", label: "Freelance or contract work" },
    { value: "Collaboration", label: "Collaboration or open source" },
    { value: "Other", label: "Something else" },
] as const;
