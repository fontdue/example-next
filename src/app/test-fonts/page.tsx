import FontdueHTML from "@/components/FontdueHTML";
import { fetchGraphql } from "@/lib/graphql";
import { PageQuery, PageQueryVariables } from "@graphql";
import TestFontsForm from "fontdue-js/TestFontsForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test fonts",
};

export default async function CustomerLoginPage() {
  const data = await fetchGraphql<PageQuery, PageQueryVariables>(
    "Page.graphql",
    { slug: "test-fonts" }
  );

  const page = data.viewer.slug?.page;

  return (
    <main className="page">
      <div className="page__body">
        <article className="markdown">
          {page?.text ? <FontdueHTML html={page.text} /> : null}
        </article>

        <TestFontsForm />
      </div>
    </main>
  );
}
