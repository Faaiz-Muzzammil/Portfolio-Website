import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const isProd = process.env.NODE_ENV === "production";

/* Every IPv4 address this machine answers on, read at boot so it follows
   the network rather than being pinned to today's DHCP lease. */
const LAN_HOSTS = Object.values(networkInterfaces())
  .flat()
  .filter((n) => n && n.family === "IPv4" && !n.internal)
  .map((n) => n!.address);

/* ============================================================
   SECURITY HEADERS
   ------------------------------------------------------------
   WHAT THESE DO NOT DO, SAID FIRST SO NOBODY EXPECTS IT.

   None of this hides the source or protects the images, and no
   configuration can. The browser downloads the JavaScript in
   order to run it and decodes the images in order to paint
   them; `view-source:`, the Network panel, `curl` and "Save
   Page As" all retrieve exactly what was sent. Right-click
   blockers, devtools traps and `user-select: none` are removed
   by turning JavaScript off, and in the meantime they break
   keyboard copy, screen readers and anyone trying to quote a
   line — a real cost paid by real visitors to inconvenience
   nobody. Watermarking is the only genuine answer to image
   theft, and it is a design decision rather than a header.

   WHAT THESE DO. They stop a *different* attacker: someone who
   gets a foothold in the page and tries to escalate it.

     CSP        The main one. Even with `'unsafe-inline'` — Next
                emits inline hydration scripts and this page has
                its own font gate — an injected `<script src>`
                pointing anywhere off-origin is refused, which is
                how injected code usually phones home. `object-src
                'none'` kills plugin embeds, `base-uri 'self'`
                stops a `<base>` tag rewriting every relative URL
                on the page, and `form-action 'self'` stops the
                contact form being repointed at someone else's
                collector.

                `data:` in `img-src`
                is the grain and haze, which are inline SVG.

                `'unsafe-eval'` is dev-only. Next's dev overlay
                needs it; production does not.

     frame-*    `frame-ancestors 'none'` plus `X-Frame-Options`
                for older agents. Nobody can put this site in an
                iframe and overlay it, which is the actual attack
                on a page with a contact form on it.

     Permissions-Policy
                The one worth reading. It denies microphone, camera,
                geolocation, payment and the rest outright.

     HSTS       Only in production, and only sent over HTTPS
                anyway. `preload` is deliberately omitted: it is
                effectively irreversible and needs a conscious
                submission to the browser preload list, not a
                header someone flipped on.
   ============================================================ */
/* TWO DIRECTIVES ARE PRODUCTION-ONLY, AND BOTH FOR THE SAME REASON:
   they assume HTTPS, and the dev server is plain HTTP on localhost.

   `upgrade-insecure-requests` IS THE ONE THAT BIT. It rewrites every
   subresource request on the page to `https://`. In production that is
   free — everything is already HTTPS. Against `http://localhost:3000`
   it rewrites the stylesheet, the fonts and the images to an `https`
   origin the dev server does not serve, so all of them fail while the
   already-parsed HTML keeps rendering. What that looks like is the
   site with no CSS at all, which is exactly what it did.

   `connect-src` needs the dev websocket for the same class of reason:
   hot reload connects to `ws://localhost`, and `'self'` does not cover
   the `ws:` scheme. Production has no HMR socket, so it stays strict
   there.

   Everything else is identical across both, which is the point — the
   policy that ships is the policy that was exercised in development,
   minus two directives that cannot apply locally. */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  /* Speed Insights serves its script same-origin from /_vercel in
     production, but in dev it pulls a debug build off its own CDN — so
     that host is allowed in dev and nowhere else. */
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval' https://va.vercel-scripts.com"}`,
  `connect-src 'self'${isProd ? "" : " ws: wss:"}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  /* A window this site opens, or that opens it, gets no handle on the
     other — closes the tabnabbing and cross-window leak class outright,
     including for links that forget `rel="noopener"`. */
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  {
    key: "Permissions-Policy",
    value: [
      "microphone=()",
      "camera=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
      /* `interest-cohort` was FLoC, which Chrome retired; it now only
         logs "Unrecognized feature" on every load. Topics is its
         successor and the one that actually opts out. */
      "browsing-topics=()",
    ].join(", "),
  },
  ...(isProd
    ? [
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains",
      },
    ]
    : []),
];

const nextConfig: NextConfig = {
  /* config options here */

  /* THE WORKSPACE ROOT, PINNED, BECAUSE IT WAS BEING INFERRED WRONGLY.
     There is a stray package-lock.json in C:\Users\lenovo, and with two
     lockfiles in the ancestry Turbopack picked the one further up — so it
     announced "inferred your workspace root ... selected the directory of
     C:\Users\lenovo" on every dev boot and every build. That is not purely
     cosmetic: the root is the base that module resolution and output file
     tracing are taken relative to, so the OG fonts traced below were being
     resolved against a directory that is not the project. Pinning it to
     this file's own directory makes the root the project, whatever happens
     to sit above it on disk. */
  turbopack: {
    root: __dirname,
  },

  /* `next dev` refuses its own scripts and HMR socket to any host but
     localhost. Opening the "Network:" URL it prints — or the site on a
     phone over Wi-Fi — therefore got the HTML without the JS: nothing
     hydrated, and every section that fades in on scroll stayed at
     opacity 0. This machine's own LAN addresses are trusted, in dev only. */
  allowedDevOrigins: isProd ? undefined : LAN_HOSTS,

  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  /* Source maps stay off in production. This is the default and it is
     stated explicitly because it is the one setting that genuinely
     affects how readable the shipped bundle is — turning it on to debug
     a production issue and forgetting to turn it back off publishes the
     original sources, comments and all. */
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      /* The API answers one visitor about one submission. Nothing in
         between — a CDN, a shared proxy — should keep a copy, and a
         crawler that finds the URL has nothing to index there. */
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },

  /* The share cards set their headlines in the site's real display face,
     which means reading two .ttf files off disk at render time. Every
     route that draws one is prerendered, so in practice that read happens
     during `next build`, where the repository is obviously present — but
     file tracing only follows imports, and a `readFile` on a path built
     at runtime is invisible to it. Without this entry a route that later
     became dynamic would deploy without its fonts and throw on the first
     request. Cheap insurance; the three files are 235KB total. */
  outputFileTracingIncludes: {
    "/opengraph-image": ["./src/app/_og/fonts/**", "./public/portrait.jpeg"],
    "/projects/[slug]/opengraph-image": ["./src/app/_og/fonts/**"],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    /* Every image is a local file that changes only on deploy, so the
       optimizer's output can be kept for a month rather than regenerated
       every minute. */
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  experimental: {
    // Only packages that are actually installed — the previous list named
    // date-fns, clsx and tailwind-merge, none of which are dependencies.
    //
    // @phosphor-icons/react was the omission that mattered. It is the icon
    // set this site actually uses, and every client component that reaches
    // for it — the nav and the contact form — imports from
    // the package root, which is a barrel re-exporting well over a thousand
    // components. Without this the whole barrel is walked at build time and,
    // in dev, shipped. Server components already dodge it by importing from
    // `/dist/ssr` directly; the client ones could not.
    optimizePackageImports: [
      '@phosphor-icons/react',
      '@number-flow/react',
      'lucide-react',
      'framer-motion',
      '@icons-pack/react-simple-icons',
    ],
  },
};

export default nextConfig;
