import { promises as fs } from "fs";
import path from "path";
import {
  ArticlePathsQuery,
  ArticleTagsQuery,
  FontPathsQuery,
  LicensePathsQuery,
  PagePathsQuery,
} from "@graphql";
import { fetchGraphql } from "@/lib/graphql";
import { notEmpty } from "@/lib/utils";

// Build-time route params: every font, article, page and license is
// prerendered at build and revalidated by the deploy hook.

export async function fontParams(): Promise<{ slug: string }[]> {
  const data = await fetchGraphql<FontPathsQuery>("FontPaths.graphql");
  const slugs =
    data.viewer.fontCollections?.edges
      ?.map((edge) => edge?.node?.slug?.name)
      .filter(notEmpty) ?? [];

  return slugs.map((slug) => ({ slug }));
}

export async function articleParams(): Promise<{ slug: string }[]> {
  const data = await fetchGraphql<ArticlePathsQuery>("ArticlePaths.graphql");
  const slugs =
    data.viewer.articles?.edges
      ?.map((edge) => edge?.node?.slug?.name)
      .filter(notEmpty) ?? [];

  return slugs.map((slug) => ({ slug }));
}

export async function articleTagParams(): Promise<{ tag: string }[]> {
  const data = await fetchGraphql<ArticleTagsQuery>("ArticleTags.graphql");

  return (
    data.viewer.articlesTags?.filter(notEmpty).map((tag) => ({ tag })) ?? []
  );
}

export async function pageParams(): Promise<{ slug: string }[]> {
  // A page slug that collides with a named route (articles, licenses, …)
  // is served by the named route, so don't claim it for [slug].
  const dirs = (
    await fs.readdir(path.resolve(process.cwd(), "src", "app"), {
      withFileTypes: true,
    })
  )
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name);

  const data = await fetchGraphql<PagePathsQuery>("PagePaths.graphql");
  const slugs =
    data.viewer.pages?.edges
      ?.map((edge) => edge?.node?.slug?.name)
      .filter(notEmpty)
      .filter((slug) => !dirs.includes(slug)) ?? [];

  return slugs.map((slug) => ({ slug }));
}

export async function licenseParams(): Promise<{ slug: string }[]> {
  const data = await fetchGraphql<LicensePathsQuery>("LicensePaths.graphql");
  const slugs =
    data.viewer.licenses
      ?.map((license) => license.slug?.name)
      .filter(notEmpty) ?? [];

  return slugs.map((slug) => ({ slug }));
}
