import { fetchGraphql } from "@/lib/graphql";
import { LicensesQuery } from "@graphql";
import Link from "next/link";

export default async function LicensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await fetchGraphql<LicensesQuery>("Licenses.graphql");

  return (
    <section className="license-page">
      <h1 className="license-page__title">Font licenses</h1>

      <div className="license-page__licenses">
        <ul className="license-page__licenses__wrapper">
          {data.viewer.licenses?.map((license) => (
            <li className="license-page__license" key={license.id}>
              <Link
                href={`/licenses/${license.slug?.name}`}
                className="license-page__license__link"
              >
                <span className="license-page__license__name">
                  {license.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="license-page__text">{children}</div>
    </section>
  );
}
