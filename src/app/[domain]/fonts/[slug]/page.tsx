import React from "react";
import { FontQuery, FontQueryVariables } from "@graphql";
import { fetchGraphql } from "@/lib/graphql";
import FontDetail from "@/components/FontDetail";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface FontProps {
  params: Promise<{ domain: string; slug: string }>;
}

async function getData(domain: string, slug: string) {
  return fetchGraphql<FontQuery, FontQueryVariables>(domain, "Font.graphql", {
    slug,
  });
}

export async function generateMetadata({
  params,
}: FontProps): Promise<Metadata> {
  const { domain, slug } = await params;
  const { viewer } = await getData(domain, slug);
  const font = viewer.slug?.fontCollection;
  if (!font) notFound();

  return {
    ...font.pageMetadata,
    title: font.pageMetadata?.title ?? font.name,
    alternates: { canonical: `/fonts/${slug}` },
  };
}

export default async function Font({ params }: FontProps) {
  const { domain, slug } = await params;
  const data = await getData(domain, slug);
  const collection = data.viewer.slug?.fontCollection;
  if (!collection) notFound();

  return <FontDetail collection={collection} />;
}

// Nothing prerendered at build time; opts the route into static-on-demand
// rendering (see [domain]/layout.tsx).
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [];
}
