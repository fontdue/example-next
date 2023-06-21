import FontdueHTML from "@/components/FontdueHTML";
import { fetchGraphql } from "@/lib/graphql";
import { PageQuery, PageQueryVariables } from "@graphql";
import CustomerLoginForm from "fontdue-js/CustomerLoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer login",
};

export default async function CustomerLoginPage() {
  const data = await fetchGraphql<PageQuery, PageQueryVariables>(
    "Page.graphql",
    { slug: "customer-login" }
  );

  const page = data.viewer.slug?.page;

  return (
    <main className="page">
      <div className="page__body">
        <article className="markdown">
          {page?.text ? (
            <FontdueHTML html={page.text} />
          ) : (
            <p>
              Enter your email below and we’ll send you a link to login and view
              your order details.
            </p>
          )}
        </article>

        <CustomerLoginForm />
      </div>
    </main>
  );
}
