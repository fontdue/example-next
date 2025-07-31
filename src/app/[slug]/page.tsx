import fs from "fs/promises";
import path from "path";
import FontdueHTML from "@/components/FontdueHTML";
import { fetchGraphql } from "@/lib/graphql";
import { notEmpty } from "@/lib/utils";
import { PagePathsQuery, PageQuery, PageQueryVariables } from "@graphql";
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    ...page.pageMetadata,
    title: page.pageMetadata?.title ?? page.title,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
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

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  // Solves an issue with Next.js when these [slug]/page.js clash with named
  // name/page.js routes
  const dirs = (
    await fs.readdir(path.resolve(__dirname, ".."), { withFileTypes: true })
  )
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name);

  const data = await fetchGraphql<PagePathsQuery>("PagePaths.graphql");
  const slugs =
    data.viewer.pages?.edges
      ?.map((edge) => edge?.node?.slug?.name)
      .filter(notEmpty)
      .filter((slug) => !dirs.includes(slug)) ?? [];

  return slugs.map((slug) => ({ slug }));
}
