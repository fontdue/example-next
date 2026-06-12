import React from "react";
import { LicenseQuery, LicenseQueryVariables } from "@graphql";
import { fetchGraphql } from "@/lib/graphql";
import { notFound, redirect } from "next/navigation";
import FontdueHTML from "@/components/FontdueHTML";
import { Metadata } from "next";

interface LicenseProps {
  params: Promise<{ slug: string }>;
}

async function getData(slug: string) {
  return fetchGraphql<LicenseQuery, LicenseQueryVariables>("License.graphql", {
    slug,
  });
}

export async function generateMetadata(props: LicenseProps): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getData(slug);
  const license = data.viewer.slug?.license;
  if (!license) notFound();
  return {
    title: `${license.name} license`,
    alternates: { canonical: `/licenses/${slug}` },
  };
}

export default async function License(props: LicenseProps) {
  const { slug } = await props.params;
  const data = await getData(slug);

  const license = data.viewer.slug?.license;
  if (!license) notFound();

  // Licenses with an uploaded PDF are served as the PDF itself; the license
  // text only backs licenses without one.
  if (license.pdf?.url) redirect(license.pdf.url);

  return (
    <main className="page">
      <article className="markdown page__body">
        <FontdueHTML html={license.text} />
      </article>
    </main>
  );
}

export { licenseParams as generateStaticParams } from "@/lib/static-params";
