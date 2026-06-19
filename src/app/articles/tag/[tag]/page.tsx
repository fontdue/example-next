import { Metadata } from "next";
import ArticlesIndex from "@/components/ArticlesIndex";

interface ArticlesProps {
  params: Promise<{ tag: string }>;
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
  const { tag } = await props.params;

  return <ArticlesIndex tag={decodeURIComponent(tag)} />;
}

export { articleTagParams as generateStaticParams } from "@/lib/static-params";
