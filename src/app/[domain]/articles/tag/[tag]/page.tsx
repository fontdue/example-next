import { Metadata } from "next";
import ArticlesIndex from "@/components/ArticlesIndex";

interface ArticlesProps {
  params: Promise<{ domain: string; tag: string }>;
}

export async function generateMetadata({
  params,
}: ArticlesProps): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: "Articles",
    alternates: { canonical: `/articles/tag/${tag}` },
  };
}

export default async function Articles(props: ArticlesProps) {
  const { domain, tag } = await props.params;

  return <ArticlesIndex domain={domain} tag={decodeURIComponent(tag)} />;
}

// Nothing prerendered at build time; opts the route into static-on-demand
// rendering (see [domain]/layout.tsx).
export async function generateStaticParams(): Promise<{ tag: string }[]> {
  return [];
}
