import FontdueHTML from "@/components/FontdueHTML";
import { fetchGraphql } from "@/lib/graphql";
import { PageQuery, PageQueryVariables } from "@graphql";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPage(slug: string) {
  const { viewer } = await fetchGraphql<PageQuery, PageQueryVariables>(
    "Page.graphql",
    {
      slug,
    },
  );
  return viewer.slug?.page;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await getPage(slug);
  if (!page) notFound();
  return {
    ...page.pageMetadata,
    title: page.pageMetadata?.title ?? page.title,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function Page(props: PageProps) {
  const { slug } = await props.params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <main className="page">
      <article className="markdown page__body">
        {page.text && <FontdueHTML html={page.text} />}
      </article>
    </main>
  );
}

export { pageParams as generateStaticParams } from "@/lib/static-params";
