import { withFontdue } from "fontdue-js/next/config";

// withFontdue installs everything the storefront needs — the rewrites that
// route requests to the right Fontdue site, image settings, and metadata
// workarounds — driven by NEXT_PUBLIC_FONTDUE_URL (see .env.local).
// Anything in here composes with it like a normal Next config.
export default withFontdue({
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
});
