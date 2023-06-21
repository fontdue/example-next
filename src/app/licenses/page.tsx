import FontdueHTML from "@/components/FontdueHTML";
import { fetchGraphql } from "@/lib/graphql";
import { PageQuery, PageQueryVariables } from "@graphql";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Licenses",
};

export default async function LicensesPage() {
  const pageData = await fetchGraphql<PageQuery, PageQueryVariables>(
    "Page.graphql",
    { slug: "licenses" }
  );

  const page = pageData.viewer.slug?.page;

  return (
    <article className="markdown">
      {page?.text ? <FontdueHTML html={page.text} /> : null}
    </article>
  );
}
