# Agar & Renas · Engagement invitation

Independent production copy of the approved design. See [DEPLOYMENT.md](DEPLOYMENT.md) for GitHub and subdomain setup. Set `NEXT_PUBLIC_SITE_URL` to the final subdomain before building.

A complete mobile-first Next.js / TypeScript invitation with Tailwind CSS, Motion, and Lucide icons. Four consecutive states share a persistent watercolor background: full-screen sealed gatefold → monogram → names → invitation.

## Run

```sh
npm install
npm run build
npm run dev
```

The build prepares optimized artwork and the social preview, then statically prerenders the app to `out/`. Run `npm test` for timezone/countdown/calendar checks and `npm run typecheck` for TypeScript validation.

## Host configuration

Edit `lib/event.ts` for the event, location and deployed site URL. The confirmed start is **December 2, 2026 at 19:00 Asia/Baghdad**, equivalent to **16:00 UTC**. The calendar end is provisionally **22:00 Baghdad time**, disclosed in the calendar chooser; update it when the hosts confirm. Update the calendar description when the end is confirmed.

Maps uses the exact host-supplied location **RXX6+8X6, Duhok, Duhok Governorate, Iraq** through the official Google Maps search URL; no coordinates were inferred.

## Artwork and approved logo

The host supplied the real calligraphic logo during implementation. `public/couple-logo-original.jpeg` preserves that attachment; `public/couple-logo-source.png` preserves its first transparent purple cleanup. The current `public/couple-logo-two-tone-source.png` pairs a deep purple upright stroke with a softer lavender intertwined stroke and is used throughout the invitation, icon, and social preview. The host subsequently supplied `agar.jpeg` as botanical inspiration. `public/eucalyptus-corner-source.png` and `public/botanical-leaves-source.png` are original transparent botanical assets inspired by its sage eucalyptus and lavender sprigs. The opening screen fills the viewport with two paper panels joined by the real logo wax stamp. Tapping the stamp opens the panels outward like doors, carrying the seal with the left panel to reveal the logo. The event details are retained. Four detailed raster leaf/flower sprites replace the former SVG falling shapes. `npm run build` regenerates the optimized assets and the 1200 × 630 Open Graph JPEG.

## Music and accessibility

The sound button starts an original soft synthesized instrumental after an explicit guest interaction. It fades between muted and playing, persists across sections, and suspends when the tab is hidden. No third-party recording or network audio is needed. The interface supports keyboard navigation, an accessible native calendar dialog, visible focus, reduced motion, and zero countdown after the event begins. Decorative petals are noninteractive, rendered behind content and paused in hidden tabs.

## Sharing

Title, description, and Open Graph tags are prerendered in HTML so crawlers do not need JavaScript. `public/og-image.jpg` is the social preview. A private hosting deployment is suitable for host review; guest sharing and WhatsApp previews require a publicly accessible deployment. Set the final public `siteUrl` before rebuilding for another host.




## Requested display typeface and realistic details

The names, cover heading and social preview use **Agetya Butterfly Demo Regular** by Yoga Letter. The original, unmodified font is embedded through `next/font/local` from `assets/fonts/AgetyaButterfly-Regular.ttf`. Its included FFP licence explicitly permits embedding in a personal/family website; the complete licence is stored beside the font in `LICENSE-AgetyaButterfly.txt`. Source: https://www.1001fonts.com/agetya-butterfly-demo-font.html . This is the personal-use demo edition, not the paid full family. Commercial reuse needs the designer's permission.

The logo wreath uses `eucalyptus-wreath.webp`, generated in a photographic botanical style. Inspired by the supplied video, the cover now uses raised floral paper artwork (`embossed-botanical.webp`), a slow hinged opening, and an oval textured wax seal attached to the left door. The seal carries the real two-tone logo and moves with the door. A double arched frame surrounds the interior scenes, with stacked names transitioning into the event sheet. The video remains a local reference and is not deployed.


The on-page ampersand uses Cormorant Garamond Italic because the Agetya demo does not contain that glyph. Its larger size and optical vertical offset center it between the stacked names.
