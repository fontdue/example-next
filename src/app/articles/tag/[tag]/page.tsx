import { Metadata } from "next";
import { fetchGraphql } from "@/lib/graphql";
import ArticlesIndex from "@/components/ArticlesIndex";
import { ArticleTagsQuery } from "@graphql";
import { notEmpty } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Articles",
};

interface ArticlesProps {
  params: Promise<{ tag: string }>;
}

export default async function Articles(props: ArticlesProps) {
  const params = await props.params;

  const {
    tag
  } = params;

  return <ArticlesIndex tag={decodeURIComponent(tag)} />;
}

export async function generateStaticParams(): Promise<{ tag: string }[]> {
  const data = await fetchGraphql<ArticleTagsQuery>("ArticleTags.graphql");

  return (
    data.viewer.articlesTags?.filter(notEmpty).map((tag) => ({ tag })) ?? []
  );
}
