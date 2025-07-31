import React from "react";
import {
  LicensePathsQuery,
  LicenseQuery,
  LicenseQueryVariables,
} from "@graphql";
import { fetchGraphql } from "@/lib/graphql";
import { notEmpty } from "@/lib/utils";
import { notFound } from "next/navigation";
import FontdueHTML from "@/components/FontdueHTML";
import { Metadata } from "next";

interface FontProps {
  params: Promise<{ slug: string }>;
}

async function getData(slug: string) {
  return fetchGraphql<LicenseQuery, LicenseQueryVariables>("License.graphql", {
    slug,
  });
}

export async function generateMetadata({
  params,
}: FontProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getData(slug);
  const license = data.viewer.slug?.license;
  if (!license) return {};
  return {
    title: `${license.name} license`,
  };
}

export default async function Font({ params }: FontProps) {
  const { slug } = await params;
  const data = await getData(slug);

  const license = data.viewer.slug?.license;
  if (!license) notFound();

  return (
    <article className="markdown">
      <FontdueHTML html={license.text} />
    </article>
  );
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const data = await fetchGraphql<LicensePathsQuery>("LicensePaths.graphql");
  const slugs =
    data.viewer.licenses
      ?.map((license) => license.slug?.name)
      .filter(notEmpty) ?? [];

  return slugs.map((slug) => ({ slug }));
}
