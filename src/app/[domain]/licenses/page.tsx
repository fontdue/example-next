import Image from "next/image";
import Link from "next/link";
import FontdueHTML from "@/components/FontdueHTML";
import { fetchGraphql } from "@/lib/graphql";
import { LicensesQuery, PageQuery, PageQueryVariables } from "@graphql";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Licenses",
  alternates: { canonical: "/licenses" },
};

export default async function LicensesPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const [pageData, licensesData] = await Promise.all([
    fetchGraphql<PageQuery, PageQueryVariables>(domain, "Page.graphql", {
      slug: "licenses",
    }),
    fetchGraphql<LicensesQuery>(domain, "Licenses.graphql"),
  ]);

  const page = pageData.viewer.slug?.page;
  const licenses = licensesData.viewer.licenses ?? [];

  return (
    <main className="page licenses-page">
      {page?.text && (
        <article className="markdown page__body">
          <FontdueHTML html={page.text} />
        </article>
      )}

      <ul className="licenses-page__list">
        {licenses.map((license) => {
          const contents = (
            <>
              {license.pdf?.thumbnailUrl ? (
                <Image
                  className="licenses-page__license__thumbnail"
                  src={license.pdf.thumbnailUrl}
                  alt=""
                  width={1275}
                  height={1650}
                  sizes="(min-width: 1000px) 200px, 30vw"
                />
              ) : (
                <span className="licenses-page__license__thumbnail licenses-page__license__thumbnail--empty" />
              )}
              <span className="licenses-page__license__name">
                {license.name}
              </span>
            </>
          );

          return (
            <li className="licenses-page__license" key={license.id}>
              {license.pdf?.url ? (
                <a
                  className="licenses-page__license__link"
                  href={license.pdf.url}
                >
                  {contents}
                </a>
              ) : (
                <Link
                  className="licenses-page__license__link"
                  href={`/licenses/${license.slug?.name}`}
                >
                  {contents}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
