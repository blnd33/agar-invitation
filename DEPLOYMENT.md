# Production deployment

This folder contains the approved Agar & Renas design, copied from the reviewed source commit `bfcf86dfa5606d7f32c4728b3c151a2e28930673`.

## Build

Use Node.js 24 and npm. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS subdomain in the hosting provider's build environment (or in a local `.env.local` file), then run:

```sh
npm ci
npm test
npm run build
```

The static website is generated in `out/`. Upload the contents of that folder to the subdomain's web root, or configure a Git-connected static host to run `npm run build` and publish `out`.

The final URL is embedded at build time in the sharing metadata, so rebuild after changing it. No application server or database is required.

## GitHub and subdomain

The source repository is https://github.com/blnd33/agar-invitation. Hosting and the full subdomain will be selected separately. Use the DNS record supplied by the chosen host and enable HTTPS for the exact subdomain.

Build output, dependencies, local environment files, and preview QA files are excluded from Git. The original Sites project configuration and Git history are not included in this independent copy.

## Event and artwork

Event details are in `lib/event.ts`. The calendar end time remains provisional at 10:00 PM and is disclosed to guests. Font licensing and asset notes are in `README.md` and `assets/fonts/LICENSE-AgetyaButterfly.txt`.
