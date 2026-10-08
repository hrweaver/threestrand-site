#!/usr/bin/env node
/**
 * Regenerate the branded /privacy and /terms pages on anchorph.one from the CANONICAL
 * legal docs in ~/anchor-legal (PRIVACY.md / TERMS.md). anchor-legal stays the source of
 * truth — edit the markdown there, then re-run this to refresh the site pages.
 *
 *   node build-legal.js
 *
 * Uses markdown-it (found in the anchor functions deps) for a verbatim md -> html render:
 * no smart-quote/typographer rewriting, so the legal text is unchanged.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

// find markdown-it without adding a dependency to this static repo
const MD_CANDIDATES = [
  path.join(os.homedir(), 'anchor/functions/node_modules/markdown-it'),
  'markdown-it',
];
let MarkdownIt;
for (const c of MD_CANDIDATES) { try { MarkdownIt = require(c); break; } catch (_) {} }
if (!MarkdownIt) { console.error('markdown-it not found; npm i markdown-it or run from a repo that has it'); process.exit(1); }

const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
const LEGAL = path.join(os.homedir(), 'anchor-legal');
const SITE = __dirname;

const page = (title, bodyHtml, analytics = true) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Anchor</title>
<meta name="robots" content="all">
<meta name="description" content="${title} for Anchor by Anchor Digital LLC.">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="64x64" href="/assets/favicon-64.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=Spline+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0A0B10; --ink:#EDEFF7; --muted:#B7BCD0; --faint:#5B6178;
    --accent:#7C8FE8; --accent-ink:#A9B5F6; --line:#23273A; --panel:#12141C;
    --font-d:"Bricolage Grotesque",system-ui,sans-serif;
    --font-b:"Spline Sans",system-ui,sans-serif;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:var(--bg);color:var(--muted);font-family:var(--font-b);
       line-height:1.7;-webkit-font-smoothing:antialiased;min-height:100svh;
       display:flex;flex-direction:column}
  .topbar{position:sticky;top:0;z-index:10;background:rgba(10,11,16,.82);
          backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
  .topbar .home{display:inline-block;padding:16px 22px}
  .wordmark{height:26px;display:block}
  main.doc{flex:1;width:100%;max-width:760px;margin:0 auto;padding:clamp(28px,5vw,56px) 22px 8px}
  main.doc h1{font-family:var(--font-d);font-weight:700;color:var(--ink);
     font-size:clamp(1.9rem,4vw,2.5rem);letter-spacing:-.02em;line-height:1.12;margin:0 0 .3em}
  main.doc h2{font-family:var(--font-d);font-weight:600;color:var(--ink);
     font-size:clamp(1.25rem,2.6vw,1.5rem);letter-spacing:-.01em;
     margin:2.4em 0 .6em;padding-top:1.2em;border-top:1px solid var(--line)}
  main.doc h3{font-family:var(--font-d);font-weight:600;color:var(--ink);
     font-size:1.08rem;margin:1.8em 0 .4em}
  main.doc p{margin:0 0 1.05em}
  main.doc a{color:var(--accent-ink);text-decoration:underline;text-underline-offset:2px;
     text-decoration-color:rgba(169,181,246,.4)}
  main.doc a:hover{text-decoration-color:var(--accent-ink)}
  main.doc strong{color:var(--ink);font-weight:600}
  main.doc ul,main.doc ol{margin:0 0 1.05em;padding-left:1.4em}
  main.doc li{margin:.3em 0}
  main.doc li::marker{color:var(--faint)}
  main.doc hr{border:0;border-top:1px solid var(--line);margin:2.2em 0}
  main.doc blockquote{margin:1.2em 0;padding:.2em 0 .2em 1.1em;border-left:3px solid var(--line);color:var(--faint)}
  main.doc code{font-family:ui-monospace,Menlo,monospace;font-size:.9em;
     background:var(--panel);border:1px solid var(--line);border-radius:5px;padding:.1em .4em}
  main.doc table{width:100%;border-collapse:collapse;margin:1.2em 0;font-size:.95rem;display:block;overflow-x:auto}
  main.doc th,main.doc td{border:1px solid var(--line);padding:.55em .7em;text-align:left;vertical-align:top}
  main.doc th{color:var(--ink);background:var(--panel);font-weight:600}
  main.doc>p:first-of-type strong{color:var(--accent-ink)}
  footer{border-top:1px solid var(--line);margin-top:40px;padding:22px;color:var(--faint);
         font-size:.8rem;display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
  footer a{color:var(--faint);text-decoration:none}
  footer a:hover{color:var(--muted)}
</style>
</head>
<body>
<header class="topbar"><a href="/" class="home"><img class="wordmark" src="/assets/wordmark.png" alt="Anchor"></a></header>
<main class="doc">
${bodyHtml}
</main>
<footer>
  <span>&copy; 2026 ANCHOR DIGITAL LLC</span>
  <a href="/privacy/">Privacy</a>
  <a href="/terms/">Terms</a>
  <a href="https://github.com/hrweaver/anchor-legal/blob/main/SUPPORT.md">Support</a>
  <a href="mailto:support@anchorph.one">support@anchorph.one</a>
</footer>
${analytics ? ANALYTICS : ''}</body>
</html>
`;

// Cookieless pageview beacon. Omitted from the kids policy on purpose (see below).
const ANALYTICS = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "4c4a9b1961654700a74a862cc3b00bfd"}'></script>`;

const docs = [
  { src: 'PRIVACY.md', out: 'privacy', title: 'Privacy Policy' },
  { src: 'TERMS.md', out: 'terms', title: 'Terms of Service' },
  // Anchor Kids has its OWN policy — the adult one above disclaims collecting data from
  // under-18s, which directly contradicts the kids apps. This is the URL submitted to Play
  // for com.anchorapp.kids and com.anchorapp.kidsmanager.
  // Play requires a reachable account-deletion URL for any app that allows account creation.
  // ACCOUNT_DELETION.md is the adult app's and is deliberately NOT built here.
];
for (const d of docs) {
  const mdSrc = fs.readFileSync(path.join(LEGAL, d.src), 'utf8');
  const html = page(d.title, md.render(mdSrc), d.analytics !== false);
  const dir = path.join(SITE, d.out);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log(`wrote ${d.out}/index.html  (from anchor-legal/${d.src})`);
}
