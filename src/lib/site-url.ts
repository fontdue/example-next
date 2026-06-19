// The site's canonical URL comes from the Fontdue admin (Settings →
// Website settings). Absolute URLs — sitemap entries, the robots.txt
// sitemap pointer — need it, and NEXT_PUBLIC_FONTDUE_URL is not a
// substitute: the Fontdue API often lives on a different host (e.g.
// store.example.com) than the site itself (www.example.com).
export function requireSiteUrl(url: string | null | undefined): string {
  if (!url) {
    throw new Error(
      "Site URL is not set: enter your site's URL in the Fontdue admin under Settings → Website settings.",
    );
  }
  return url;
}
