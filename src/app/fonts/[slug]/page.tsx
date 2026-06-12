import React from "react";
import { FontQuery, FontQueryVariables } from "@graphql";
import { fetchGraphql } from "@/lib/graphql";
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

export async function generateMetadata(props: FontProps): Promise<Metadata> {
  const { slug } = await props.params;
  const { viewer } = await getData(slug);
  const font = viewer.slug?.fontCollection;
  if (!font) notFound();

  return {
    ...font.pageMetadata,
    title: font.pageMetadata?.title ?? font.name,
    alternates: { canonical: `/fonts/${slug}` },
  };
}

export default async function Font(props: FontProps) {
  const { slug } = await props.params;
  const data = await getData(slug);
  const collection = data.viewer.slug?.fontCollection;
  if (!collection) notFound();

  return <FontDetail collection={collection} />;
}

export { fontParams as generateStaticParams } from "@/lib/static-params";
