type ClassValue =
    | string
    | number
    | null
    | undefined
    | false
    | ClassValue[]
    | Record<string, unknown>;

/**
 * Joins class names.
 *
 * Deliberately not `clsx` + `tailwind-merge`: the primitives in
 * `src/components/ui` pick classes from variant lookup maps rather than
 * concatenating overridable strings, so conflicting utilities never meet.
 * `tailwind-merge` would also need `extendTailwindMerge` kept in lockstep
 * with our custom `--text-*` scale, and a stale config silently drops
 * classes — a worse failure than not merging at all.
 */
export function cn(...inputs: ClassValue[]): string {
    const out: string[] = [];

    const walk = (value: ClassValue) => {
        if (!value) return;
        if (typeof value === "string" || typeof value === "number") {
            out.push(String(value));
        } else if (Array.isArray(value)) {
            value.forEach(walk);
        } else {
            for (const key in value) {
                if (value[key]) out.push(key);
            }
        }
    };

    inputs.forEach(walk);
    return out.join(" ");
}
