import React from "react";
import { FontQuery, FontQueryVariables } from "@graphql";
import { fetchGraphql } from "@/lib/graphql";
import FontDetail from "@/components/FontDetail";
import { FontduePasswordProtectedError } from "fontdue-js/server";
import NodePasswordForm from "fontdue-js/NodePasswordForm";
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

  let data;
  try {
    data = await getData(slug);
  } catch (error) {
    // The collection is password-protected and the visitor hasn't unlocked it.
    // Render the password form instead of a 404: it exists, it's just gated.
    // NodePasswordForm submits the password, remembers the returned token, and
    // reloads so the collection then resolves.
    if (error instanceof FontduePasswordProtectedError) {
      return (
        <main className="page">
          <div className="page__body">
            <article className="markdown">
              <h1>Password required</h1>
              <p>
                This collection is password-protected. Enter the password to
                view it.
              </p>
            </article>
            <NodePasswordForm collectionSlug={slug} />
          </div>
        </main>
      );
    }
    throw error;
  }

  const collection = data.viewer.slug?.fontCollection;
  if (!collection) notFound();

  return <FontDetail collection={collection} />;
}

export { fontParams as generateStaticParams } from "@/lib/static-params";
