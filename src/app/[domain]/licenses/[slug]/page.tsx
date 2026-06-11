import React from "react";
import { LicenseQuery, LicenseQueryVariables } from "@graphql";
import { fetchGraphql } from "@/lib/graphql";
import { notFound, redirect } from "next/navigation";
import FontdueHTML from "@/components/FontdueHTML";
import { Metadata } from "next";

interface LicenseProps {
  params: Promise<{ domain: string; slug: string }>;
}

async function getData(domain: string, slug: string) {
  return fetchGraphql<LicenseQuery, LicenseQueryVariables>(
    domain,
    "License.graphql",
    {
      slug,
    },
  );
}

export async function generateMetadata({
  params,
}: LicenseProps): Promise<Metadata> {
  const { domain, slug } = await params;
  const data = await getData(domain, slug);
  const license = data.viewer.slug?.license;
  if (!license) notFound();
  return {
    title: `${license.name} license`,
    alternates: { canonical: `/licenses/${slug}` },
  };
}

export default async function License({ params }: LicenseProps) {
  const { domain, slug } = await params;
  const data = await getData(domain, slug);

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

// Nothing prerendered at build time; opts the route into static-on-demand
// rendering (see [domain]/layout.tsx).
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [];
}
