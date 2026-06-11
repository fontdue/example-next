import Link from "next/link";
import { Metadata } from "next";
import { fetchGraphql } from "@/lib/graphql";
import { IndexQuery } from "@graphql";
import FontStyle from "@/components/FontStyle";
import { notEmpty } from "@/lib/utils";
import FontDetail from "@/components/FontDetail";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const data = await fetchGraphql<IndexQuery>("Index.graphql");

  const collections = data.viewer.fontCollections?.edges
    ?.map((edge) => edge?.node)
    .filter(notEmpty);

  if (collections?.length === 1) {
    const firstCollection = data.viewer.firstCollection?.edges?.[0]?.node;
    if (firstCollection) return <FontDetail collection={firstCollection} />;
  }

  return (
    <section className="home">
      <h1 className="visually-hidden">{data.viewer.settings?.title}</h1>
      {collections?.map((node) => {
        if (!node.slug) return;

        return (
          <h2 key={node.id} className="home__collection">
            <FontStyle
              familyName={node.featureStyle?.cssFamily}
              styleName={node.featureStyle?.name}
              webfontSources={node.featureStyle?.webfontSources}
              className="home__collection__name"
            >
              <Link
                href={`/fonts/${node.slug.name}`}
                className="home__collection__link"
                style={
                  {
                    "--optical-adjustment": node.opticalAdjustment,
                  } as React.CSSProperties
                }
              >
                {node.name}
              </Link>
            </FontStyle>
            {node.isNew && (
              <span className="home__collection__new">&nbsp;New</span>
            )}
          </h2>
        );
      })}
    </section>
  );
}
