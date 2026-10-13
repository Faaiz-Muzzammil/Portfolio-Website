import { z } from "zod";

/**
 * One schema, imported by both `sections/Contact.tsx` (via zodResolver) and
 * `app/api/contact/route.ts`. The server re-parses — a client-side parse is
 * a convenience, never a trust boundary.
 *
 * zod is v3 here: `z.string().email()`, not the v4 `z.email()`.
 */
/* `topic` IS NOT A FIELD ANY MORE.
   It was a required select — four options, one of which was "Something
   else" — and it earned none of what it cost. Every answer it could
   give is the first line of the message anyway, so it bought no
   information; it was required, so it was a fourth thing to get past
   before writing; and being required meant it could fail validation,
   which is a form telling someone their message is wrong when the
   message is fine. */
/* One set of ceilings, read by the schema and by the fields' own
   `maxLength`, so the browser stops typing exactly where validation
   would have refused it. */
export const CONTACT_LIMITS = {
    name: 80,
    email: 160,
    subject: 120,
    message: 4000,
} as const;

export const contactSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Please enter your name")
        .max(CONTACT_LIMITS.name, `Keep your name under ${CONTACT_LIMITS.name} characters`)
        .regex(/\p{L}/u, "Your name needs at least one letter"),
    email: z
        .string()
        .trim()
        .min(1, "Enter your email so I can reply")
        .email("That doesn't look like an email address — check for typos")
        .max(CONTACT_LIMITS.email, `Keep your email under ${CONTACT_LIMITS.email} characters`),
    /* Optional and free text — not the select that was removed. When it is
       filled it becomes the mail's subject line, which is the one place a
       sentence from the visitor is worth more than "Message from <name>". */
    subject: z
        .string()
        .trim()
        .max(CONTACT_LIMITS.subject, `Keep the subject under ${CONTACT_LIMITS.subject} characters`)
        .optional(),
    /* The floor was 20 characters, which refused "Are you free in March?" —
       a real question, complete as written. 10 still stops "hi". */
    message: z
        .string()
        .trim()
        .min(10, "A little more detail, please — at least 10 characters")
        .max(CONTACT_LIMITS.message, `That's over ${CONTACT_LIMITS.message} characters`),
    // Bots fill hidden fields; humans can't see this one.
    // No `.default()` here — it would make the inferred input and output
    // types differ, which react-hook-form's resolver typing rejects.
    //
    // NOT `.max(0)`. That made a filled trap a validation error, so the
    // route answered 400 naming `honeypot` as the bad field — telling the
    // bot exactly which input to leave blank, and never reaching the
    // route's quiet fake-success. Any short string passes here; the route
    // is what treats a non-empty one as a bot.
    honeypot: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/* A `CONTACT_TOPICS` list lived here, feeding the topic select. It went
   with the field — see the note above. */
