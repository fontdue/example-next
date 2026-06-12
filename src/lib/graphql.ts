import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { configureFontdueRender } from "fontdue-js/next";

const getStaticQuery = async (queryName: string) => {
  let query = await fs.readFile(
    path.resolve(process.cwd(), "src", "queries", queryName),
    "utf8",
  );

  return query;
};

const fetchGraphql = async <Q, V = void>(
  domain: string,
  queryName: string,
  variables: V | void,
): Promise<Q> => {
  // The domain comes from the request host (via the rewrites installed by
  // withFontdue in next.config.mjs). configureFontdueRender rejects anything
  // that isn't a plain hostname and points fontdue-js's own server-side
  // fetches at this site's endpoint for the rest of the render pass — every
  // page calls fetchGraphql before rendering any Fontdue component. 404
  // rather than throw on a bad domain: stray paths that reach the catch-all
  // route directly (e.g. /_next/webpack-hmr in dev) land here with their
  // first segment as the "domain".
  const endpoint = configureFontdueRender(domain);
  if (!endpoint) notFound();

  const query = await getStaticQuery(queryName);
  const response = await fetch(
    `${endpoint.origin}/graphql?query=${queryName}`,
    {
      method: "POST",
      body: JSON.stringify({ query, variables }),
      headers: {
        "content-type": "application/json",
        ...endpoint.headers,
      },
      // Cached explicitly (Next 15 no longer caches fetch by default) and
      // tagged per site so /api/revalidate can purge one site at a time.
      cache: "force-cache",
      next: {
        tags: endpoint.tags,
      },
    },
  );

  // The Fontdue server 404s when the forwarded host doesn't resolve to a
  // site — surface that as the page's 404 rather than an error.
  if (response.status === 404) notFound();

  if (response.status !== 200) {
    throw new Error("Fontdue request failed");
  }

  const json = await response.json();

  const errorMessage = json.errors?.[0]?.message;
  if (errorMessage) {
    throw new Error(`Fontdue graphql request error: ${errorMessage}`);
  }

  return json.data;
};

export { fetchGraphql, getStaticQuery };
