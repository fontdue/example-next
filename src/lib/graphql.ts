import path from "path";
import { processImport } from "@graphql-tools/import";
import { print } from "graphql";

const ENDPOINT = `${process.env.NEXT_PUBLIC_FONTDUE_URL}/graphql`;

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
  variables: V | void,
): Promise<Q> => {
  const query = await getStaticQuery(queryName);
  const response = await fetch(`${ENDPOINT}?query=${queryName}`, {
    method: "POST",
    body: JSON.stringify({ query, variables }),
    headers: {
      "content-type": "application/json",
    },
    next: {
      tags: ["graphql"],
    },
  });

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
