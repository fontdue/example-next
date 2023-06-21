import { promises as fs } from 'fs';
import path from 'path';

const ENDPOINT = `${process.env.NEXT_PUBLIC_FONTDUE_URL}/graphql`;


const getStaticQuery = async (queryName: string) => {
  let query = await fs.readFile(
    path.resolve(process.cwd(), 'src', 'queries', queryName),
    'utf8'
  );



  return query;
};
const fetchGraphql = async <Q, V = void>(
  queryName: string,
  variables: V | void
): Promise<Q> => {
  const query = await getStaticQuery(queryName);
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
    headers: {
      'content-type': 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new Error('Fontdue request failed');
  }

  const json = await response.json();

  const errorMessage = json.errors?.[0]?.message;
  if (errorMessage) {
    throw new Error(`Fontdue graphql request error: ${errorMessage}`);
  }

  return json.data;
};

export { fetchGraphql, getStaticQuery };
