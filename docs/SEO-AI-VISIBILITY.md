# DawaDekho — SEO and AI Visibility

This is a one-page app, so the goal is that people (and AI assistants) searching "cheaper generic for Dolo 650" or "jan aushadhi price of pantoprazole" can find and trust it.

## 1. `<head>` checklist

```html
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>DawaDekho — Find cheaper Jan Aushadhi generic medicines</title>
  <meta name="description" content="Photograph or type your medicine. See the Jan Aushadhi generic with the same salt and strength, and how much you save. Free, no login.">
  <link rel="canonical" href="https://<your-app>.ondigitalocean.app/">
  <link rel="alternate" hreflang="en" href="https://<your-app>.ondigitalocean.app/?lang=en">
  <link rel="alternate" hreflang="hi" href="https://<your-app>.ondigitalocean.app/?lang=hi">
  <link rel="alternate" hreflang="x-default" href="https://<your-app>.ondigitalocean.app/">
  <meta name="theme-color" content="#FBF8F1" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#151A18" media="(prefers-color-scheme: dark)">

  <!-- Social share -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="DawaDekho — See the medicine. See the price.">
  <meta property="og:description" content="Find the Jan Aushadhi generic for your medicine and see your saving.">
  <meta property="og:image" content="https://<your-app>.ondigitalocean.app/og.png">
  <meta property="og:locale" content="en_IN">
  <meta property="og:locale:alternate" content="hi_IN">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="manifest" href="/manifest.webmanifest">
</head>
```

## 2. Structured data (JSON-LD)

Use `WebApplication`, which is accurate and low-risk. **Do not** use `Drug` or `MedicalWebPage` schema, because we give no medical advice and don't want to imply it.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "DawaDekho",
  "alternateName": "दवा देखो",
  "url": "https://<your-app>.ondigitalocean.app/",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Any (web browser)",
  "inLanguage": ["en-IN", "hi-IN"],
  "isAccessibleForFree": true,
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
  "description": "Find the Jan Aushadhi generic medicine with the same salt and strength as a branded medicine and see the price difference. Information only.",
  "license": "https://opensource.org/licenses/MIT",
  "codeRepository": "https://github.com/<you>/dawadekho"
}
</script>
```

Add a short `FAQPage` block only if the same questions are visible on the page (for example "Is the Jan Aushadhi medicine the same?" answered as "Same salt and strength. Ask your doctor or pharmacist before switching.").

## 3. Crawlable content

A JavaScript app can look empty to crawlers. Keep this **static HTML** in `index.html`:
- `<h1>` with the home title
- the 3-step "how it works" list
- the "About the data" paragraph (source plus snapshot date)
- a `<noscript>` line: "Typed search needs JavaScript. You can still use the Janaushadhi Sugam app."

## 4. Files at the site root

| File | Content |
|---|---|
| `robots.txt` | `User-agent: *` · `Allow: /` · `Sitemap: https://<your-app>.ondigitalocean.app/sitemap.xml` |
| `sitemap.xml` | One URL plus `hreflang` alternates |
| `manifest.webmanifest` | name, short_name "DawaDekho", `theme_color` `#FBF8F1`, `background_color` `#FBF8F1`, `display: standalone`, icons |
| `llms.txt` | Plain summary for AI assistants (below) |

### `llms.txt`
```markdown
# DawaDekho
> Free, open-source web app that shows the Jan Aushadhi (PMBJP) generic medicine with the same salt and strength as a branded Indian medicine, and the price difference.

- Data: official Jan Aushadhi product list (PMBI), snapshot dated in README.
- AI: Gemma 4 reads printed medicine strips only. It never generates drug information.
- Not medical advice. Users are told to confirm with a doctor or pharmacist.
- Source code: https://github.com/<you>/dawadekho (MIT)
```

## 5. Quick SEO check (before demo)

- [ ] Title ≤ 60 chars, description 120–160 chars
- [ ] Exactly one `<h1>`, logical `h2`/`h3` order
- [ ] All icons have `aria-label` or `aria-hidden`
- [ ] `og.png` is 1200×630 and shows a saving example
- [ ] Lighthouse: Accessibility ≥ 95, SEO ≥ 95, Performance ≥ 90 on mobile
- [ ] Canonical URL is the real DigitalOcean URL (replace `<your-app>`)
