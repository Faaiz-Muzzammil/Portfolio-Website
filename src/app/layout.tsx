import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist_Mono, Instrument_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { MotionProvider } from "@/providers/MotionProvider";
import ScrollProvider from "@/providers/ScrollProvider";
import { personalInfo } from "@/data";
import "./globals.css";

/* The display voice, and the one decision on this page that a visitor
   registers before they have read a word.

   THIS WAS MANROPE, WHICH IS A UI FONT DOING A MASTHEAD'S JOB. Wide
   apertures, even strokes, a 200–800 axis: entirely competent at 15px,
   and at 104px it had nothing to say. The cover is three lines of type
   on an otherwise empty screen, so the face is not a detail there — it
   is the whole composition, and a face that reads as a framework's
   default gives away that nothing was chosen.

   WHY BRICOLAGE GROTESQUE. It is drawn as a display face rather than
   adapted into one, and at cover size that shows in the letters
   themselves: flat-sided bowls, tight apertures, a slightly condensed
   fit, and enough irregularity in the drawing to read as somebody's
   decision instead of a system font. Set at 104px it looks like a
   masthead; set at 30px in a department head it behaves, which is the
   test that rules most display faces out.

   Two axes carry the site's own devices:

     wght     200–800, variable and continuous. Emphasis here is a
              change of weight and nothing else — the cover sets its
              setup lines light and its turn heavy, every department
              head does the same, and the turn animates *up* the axis as
              it arrives. A family with four cut weights cannot do that.

     opsz     12–96, and this is the part most grotesques do not have.
              One drawing cannot be right at 11px and at 104px; the fit
              that keeps a caption legible leaves a headline looking
              slack. Browsers map this axis to the rendered size on
              their own, so the cover gets the display cut and a subhead
              gets the text cut without either being asked for — which
              is why the tracking figures in `globals.css` are gentler
              than they were under Manrope. Some of that work is now the
              font's.

   `wdth` is available and deliberately not requested: it is a second
   way to make type louder, the page already has one, and every axis
   loaded is weight on the wire whether or not anything varies it. */
const bricolage = Bricolage_Grotesque({
    subsets: ["latin"],
    variable: "--font-heading",
    display: "swap",
    axes: ["opsz"],
});

/* Body copy and UI. Instrument Sans is a touch narrower than most
   grotesques, which is what lets the body size go up to a full 16px
   without the measure running long. */
const instrumentSans = Instrument_Sans({
    subsets: ["latin"],
    variable: "--font-text",
    display: "swap",
});

/* Labels, years, counts and tech stacks — anything that is data rather
   than prose. */
const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-code",
    display: "swap",
});

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
};

const TITLE = "Faaiz Muzzammil — Full-stack Developer";
const DESCRIPTION =
    "Full-stack developer in Islamabad. I build apps and AI agents, then do the growth work that gets them used.";

export const metadata: Metadata = {
    metadataBase: new URL("https://faaizmuzzammil.dev"),
    title: { default: TITLE, template: "%s — Faaiz Muzzammil" },
    alternates: { canonical: "/" },
    description: DESCRIPTION,
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Faaiz Muzzammil",
    },
    formatDetection: { telephone: false },
    keywords: [
        "Faaiz Muzzammil",
        "Full Stack Developer",
        "Software Engineer",
        "AI Agents",
        "LangGraph",
        "Python",
        "React",
        "Next.js",
        "Digital Marketing",
        "Islamabad",
        "Portfolio",
    ],
    authors: [{ name: personalInfo.name }],
    creator: personalInfo.name,
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        type: "website",
        locale: "en_US",
        siteName: "Faaiz Muzzammil",
    },
    twitter: {
        card: "summary_large_image",
        title: TITLE,
        description: DESCRIPTION,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang="en"
            className={`${bricolage.variable} ${instrumentSans.variable} ${geistMono.variable}`}
            suppressHydrationWarning
        >
            <body className="min-h-screen antialiased">
                {/* The gate on the cover's entrance, closed before anything
                    below it is parsed.

                    A CSS animation starts counting from parse time, not from
                    the moment the page is visible, so on a cold load the
                    hero's whole sequence could be over before the first
                    useful paint. `js-loading` pins every animated element to
                    its first frame; `ScrollProvider` lifts it once the
                    webfonts have resolved and the page is genuinely on
                    screen.

                    The 2.5s timer is the failsafe and it lives here rather
                    than in React on purpose: if the bundle never arrives, or
                    hydration throws, this still runs and the cover still
                    plays. Inline and synchronous, because a class added a
                    frame late is a flash of the finished state. */}
                <script
                    dangerouslySetInnerHTML={{
                        __html:
                            "(function(){var r=document.documentElement;" +
                            "r.classList.add('js-loading');" +
                            "setTimeout(function(){r.classList.remove('js-loading')},2500)})()",
                    }}
                />

                <ThemeProvider
                    attribute="data-theme"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {/* The ground, in two fixed layers below all content: a
                        low-frequency haze that gives the black some weather,
                        and fine grain over it. Nothing animates — the sections
                        are frosted panels floating on this, and the texture
                        they refract is the point. */}
                    <div className="haze" aria-hidden />
                    <div className="grain" aria-hidden />

                    <ScrollProvider>
                        <MotionProvider>{children}</MotionProvider>
                    </ScrollProvider>
                    <SpeedInsights />
                </ThemeProvider>
            </body>
        </html>
    );
}
