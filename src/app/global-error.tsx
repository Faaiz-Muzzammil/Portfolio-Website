"use client";

/* The last line of defence: an error in the root layout itself, where
   `error.tsx` cannot help because the layout it renders inside is the
   thing that failed. No stylesheet, fonts or providers can be assumed
   here, so it is deliberately plain and styles itself inline. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "system-ui, sans-serif",
                    background: "#fff",
                    color: "#000",
                    padding: 24,
                }}
            >
                <main style={{ maxWidth: 480 }}>
                    <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>Something went wrong.</h1>
                    <p style={{ margin: "0 0 24px", lineHeight: 1.5 }}>
                        The site failed to load. Try again, or come back in a moment.
                    </p>
                    <button
                        type="button"
                        onClick={reset}
                        style={{
                            font: "inherit",
                            padding: "10px 20px",
                            border: "1px solid #000",
                            background: "#000",
                            color: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        Try again
                    </button>
                </main>
            </body>
        </html>
    );
}
