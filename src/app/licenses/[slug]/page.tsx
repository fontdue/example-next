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

interface FontProps {
  params: { slug: string };
}

async function getData({ params }: FontProps) {
  return fetchGraphql<LicenseQuery, LicenseQueryVariables>("License.graphql", {
    slug: params.slug,
  });
}

export async function generateMetadata(props: FontProps) {
  const data = await getData(props);
  const license = data.viewer.slug?.license;
  if (!license) return {};
  return {
    title: `${license.name} license`,
  };
}

export default async function Font(props: FontProps) {
  const data = await getData(props);

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
