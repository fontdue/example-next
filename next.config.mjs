import { withFontdue } from "fontdue-js/next/config";

// withFontdue installs everything the storefront needs — the rewrites that
// route requests to the right Fontdue site, image settings, and metadata
// workarounds — driven by NEXT_PUBLIC_FONTDUE_URL (see .env.local).
// Anything in here composes with it like a normal Next config.
export default withFontdue({
  // Emit a self-contained server bundle (`.next/standalone`) so the app can
  // run as `node server.js` on any Node host. Harmless on Vercel.
  output: "standalone",
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
});
