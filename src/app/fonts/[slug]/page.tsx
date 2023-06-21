import React from "react";
import { FontPathsQuery, FontQuery, FontQueryVariables } from "@graphql";
import { fetchGraphql } from "@/lib/graphql";
import { notEmpty } from "@/lib/utils";
import FontDetail from "@/components/FontDetail";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface FontProps {
  params: { slug: string };
}

async function getData({ params }: FontProps) {
  return fetchGraphql<FontQuery, FontQueryVariables>("Font.graphql", {
    slug: params.slug,
  });
}

export async function generateMetadata(props: FontProps): Promise<Metadata> {
  const { viewer } = await getData(props);
  const font = viewer.slug?.fontCollection;
  if (!font) return {};

  return {
    ...font.pageMetadata,
    title: font.pageMetadata?.title ?? font.name,
  };
}

export default async function Font(props: FontProps) {
  const data = await getData(props);
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
