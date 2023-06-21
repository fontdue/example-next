import FontdueHTML from "@/components/FontdueHTML";
import { fetchGraphql } from "@/lib/graphql";
import { notEmpty } from "@/lib/utils";
import { PagePathsQuery, PageQuery, PageQueryVariables } from "@graphql";
import { notFound } from "next/navigation";

interface PageProps {
  params: { slug: string };
}

async function getPage({ params }: PageProps) {
  const { viewer } = await fetchGraphql<PageQuery, PageQueryVariables>(
    "Page.graphql",
    {
      slug: params.slug,
    }
  );
  return viewer.slug?.page;
}

export async function generateMetadata(props: PageProps) {
  const page = await getPage(props);
  if (!page) return {};
  return {
    ...page.pageMetadata,
    title: page.pageMetadata?.title ?? page.title,
  };
}

export default async function Page(props: PageProps) {
  const page = await getPage(props);
  if (!page) notFound();

  return (
    <main className="page">
      <article className="markdown page__body">
        {page.text && <FontdueHTML html={page.text} />}
      </article>
    </main>
  );
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const data = await fetchGraphql<PagePathsQuery>("PagePaths.graphql");
  const slugs =
    data.viewer.pages?.edges
      ?.map((edge) => edge?.node?.slug?.name)
      .filter(notEmpty) ?? [];

  return slugs.map((slug) => ({ slug }));
}
