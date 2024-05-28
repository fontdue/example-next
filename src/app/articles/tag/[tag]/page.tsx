import { Metadata } from "next";
import { fetchGraphql } from "@/lib/graphql";
import ArticlesIndex from "@/components/ArticlesIndex";
import { ArticleTagsQuery } from "@graphql";
import { notEmpty } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Articles",
};

interface ArticlesProps {
  params: { tag: string };
}

export default async function Articles({ params: { tag } }: ArticlesProps) {
  return <ArticlesIndex tag={decodeURIComponent(tag)} />;
}

export async function generateStaticParams(): Promise<{ tag: string }[]> {
  const data = await fetchGraphql<ArticleTagsQuery>("ArticleTags.graphql");

  return (
    data.viewer.articlesTags?.filter(notEmpty).map((tag) => ({ tag })) ?? []
  );
}
