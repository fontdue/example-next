import React, { cache } from "react";
import { FontQuery, FontQueryVariables } from "@graphql";
import { fetchGraphql } from "@/lib/graphql";
import FontDetail from "@/components/FontDetail";
import { FontduePasswordProtectedError } from "fontdue-js/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface FontProps {
  params: Promise<{ slug: string }>;
}

// Wrapped in React.cache so generateMetadata and the page share a single
// request — they both look the collection up by slug, and this dedupes that
// into one round trip instead of two.
const getData = cache(async (slug: string) =>
  fetchGraphql<FontQuery, FontQueryVariables>("Font.graphql", { slug }),
);

// Resolve the collection for a slug, 404ing when it doesn't exist. Returns a
// promise the page can start early and pass down without awaiting, so the
// collection query runs alongside the embedded testers' queries. For a
// password-protected collection the promise fails with
// FontduePasswordProtectedError, which FontDetail catches and renders as the
// password form.
async function loadCollection(slug: string) {
  const { viewer } = await getData(slug);
  const collection = viewer.slug?.fontCollection;
  if (!collection) notFound();
  return collection;
}

export async function generateMetadata(props: FontProps): Promise<Metadata> {
  const { slug } = await props.params;

  let data;
  try {
    data = await getData(slug);
  } catch (error) {
    // A locked collection still has a real URL — don't 404 it, just give the
    // password page a generic title.
    if (error instanceof FontduePasswordProtectedError) {
      return {
        title: "Password required",
        alternates: { canonical: `/fonts/${slug}` },
      };
    }
    throw error;
  }

  const font = data.viewer.slug?.fontCollection;
  if (!font) notFound();

  return {
    ...font.pageMetadata,
    title: font.pageMetadata?.title ?? font.name,
    alternates: { canonical: `/fonts/${slug}` },
  };
}

export default async function Font(props: FontProps) {
  const { slug } = await props.params;

  // Start the collection query but don't await it here: passing the promise
  // (and the slug) into FontDetail lets it fetch in parallel with the testers,
  // which preload by slug. Awaiting here would serialize the two.
  return <FontDetail collection={loadCollection(slug)} collectionSlug={slug} />;
}

export { fontParams as generateStaticParams } from "@/lib/static-params";
