import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { fontdueEndpoint, isValidDomain } from "./tenant";

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
  // The domain comes from the request host (via the next.config rewrites);
  // reject anything that isn't a plain hostname before it can reach the
  // GraphQL fetch. 404 rather than throw: stray paths that reach the
  // catch-all route directly (e.g. /_next/webpack-hmr in dev) land here with
  // their first segment as the "domain".
  if (!isValidDomain(domain)) {
    notFound();
  }

  const query = await getStaticQuery(queryName);
  const { origin, headers } = fontdueEndpoint(domain);
  const response = await fetch(`${origin}/graphql?query=${queryName}`, {
    method: "POST",
    body: JSON.stringify({ query, variables }),
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    // Cached explicitly (Next 15 no longer caches fetch by default) and
    // tagged per tenant so /api/revalidate can purge one site at a time.
    cache: "force-cache",
    next: {
      tags: ["graphql", `graphql:${domain}`],
    },
  });

  // The Fontdue server 404s when the forwarded host doesn't resolve to a
  // tenant — surface that as the page's 404 rather than an error.
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
