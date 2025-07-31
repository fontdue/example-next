import React from "react";
import { FontPathsQuery, FontQuery, FontQueryVariables } from "@graphql";
import { fetchGraphql } from "@/lib/graphql";
import { notEmpty } from "@/lib/utils";
import FontDetail from "@/components/FontDetail";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface FontProps {
  params: Promise<{ slug: string }>;
}

async function getData(slug: string) {
  return fetchGraphql<FontQuery, FontQueryVariables>("Font.graphql", {
    slug,
  });
}

export async function generateMetadata({
  params,
}: FontProps): Promise<Metadata> {
  const { slug } = await params;
  const { viewer } = await getData(slug);
  const font = viewer.slug?.fontCollection;
  if (!font) return {};

  return {
    ...font.pageMetadata,
    title: font.pageMetadata?.title ?? font.name,
  };
}

export default async function Font({ params }: FontProps) {
  const { slug } = await params;
  const data = await getData(slug);
  const collection = data.viewer.slug?.fontCollection;
  if (!collection) notFound();

  return <FontDetail collection={collection} />;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const data = await fetchGraphql<FontPathsQuery>("FontPaths.graphql");
  const slugs =
    data.viewer.fontCollections?.edges
      ?.map((edge) => edge?.node?.slug?.name)
      .filter(notEmpty) ?? [];

  return slugs.map((slug) => ({ slug }));
}
