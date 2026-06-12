import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { FontdueEndpoint } from "fontdue-js/next";
import { currentFontdueEndpoint } from "fontdue-js/next";

const getStaticQuery = async (queryName: string) => {
  let query = await fs.readFile(
    path.resolve(process.cwd(), "src", "queries", queryName),
    "utf8",
  );

  return query;
};

const fetchGraphql = async <Q, V = void>(
  queryName: string,
  variables?: V | void,
  // Defaults to the NEXT_PUBLIC_FONTDUE_URL site.
  endpoint: FontdueEndpoint = currentFontdueEndpoint(),
): Promise<Q> => {
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

  // The Fontdue server 404s when the requested host doesn't resolve to a
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
