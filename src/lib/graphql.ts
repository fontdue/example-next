import path from "path";
import { notFound } from "next/navigation";
import { createFontdueFetch, FontdueNotFoundError } from "fontdue-js/server";
import { processImport } from "@graphql-tools/import";
import { print } from "graphql";

const getStaticQuery = async (queryName: string) => {
  // Resolve any `#import` statements so the query sent to the server is
  // self-contained — shared fragments live once in fragments.graphql.
  const document = processImport(
    path.resolve(process.cwd(), "src", "queries", queryName),
    process.cwd(),
  );

  return print(document);
};

const fetchGraphql = async <Q, V = void>(
  queryName: string,
  variables?: V,
): Promise<Q> => {
  const query = await getStaticQuery(queryName);

  // One transport for every fetch: createFontdueFetch targets the site and,
  // while an admin is previewing, carries the token that reveals hidden fonts.
  const fetchFontdue = createFontdueFetch();

  try {
    return await fetchFontdue<Q, V>(queryName, query, variables);
  } catch (error) {
    // The Fontdue server 404s when the requested host doesn't resolve to a
    // site — surface that as the page's 404 rather than an error.
    if (error instanceof FontdueNotFoundError) notFound();
    throw error;
  }
};

export { fetchGraphql, getStaticQuery };
