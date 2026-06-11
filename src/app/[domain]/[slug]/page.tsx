import FontdueHTML from "@/components/FontdueHTML";
import { fetchGraphql } from "@/lib/graphql";
import { PageQuery, PageQueryVariables } from "@graphql";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ domain: string; slug: string }>;
}

async function getPage(domain: string, slug: string) {
  const { viewer } = await fetchGraphql<PageQuery, PageQueryVariables>(
    domain,
    "Page.graphql",
    {
      slug,
    },
  );
  return viewer.slug?.page;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { domain, slug } = await params;
  const page = await getPage(domain, slug);
  if (!page) notFound();
  return {
    ...page.pageMetadata,
    title: page.pageMetadata?.title ?? page.title,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function Page({ params }: PageProps) {
  const { domain, slug } = await params;
  const page = await getPage(domain, slug);
  if (!page) notFound();

  return (
    <main className="page">
      <article className="markdown page__body">
        {page.text && <FontdueHTML html={page.text} />}
      </article>
    </main>
  );
}

// Nothing prerendered at build time; opts the route into static-on-demand
// rendering (see [domain]/layout.tsx).
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [];
}
