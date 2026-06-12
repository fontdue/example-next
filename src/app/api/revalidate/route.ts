// Fontdue's deploy hook calls this when the site's content changes, purging
// every cached page and GraphQL response so the next request re-renders.
export { POST } from "fontdue-js/next/revalidate";
