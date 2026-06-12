import FontdueProvider from "fontdue-js/FontdueProvider";
import StoreModal from "fontdue-js/StoreModal";
import CartButton from "fontdue-js/CartButton";
import parse from "html-react-parser";
import { Metadata } from "next";
import "fontdue-js/fontdue.css";
import Image from "next/image";
import "../../styles/main.scss";
import { RootLayoutQuery } from "@graphql";
import { fetchGraphql } from "@/lib/graphql";
import { fallbackSiteUrl } from "fontdue-js/next";
import ActiveLink from "@/components/ActiveLink";
import PreloadWebfonts from "@/components/PreloadWebfonts";
import FontdueHTML from "@/components/FontdueHTML";

function styleFamilyName(
  style:
    | {
        cssFamily: string | null;
        name: string | null;
      }
    | null
    | undefined,
) {
  if (!style) return null;
  return `"${style.cssFamily} ${style.name}"`;
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

// No domains are prerendered at build time (they aren't known then), but
// providing generateStaticParams opts every route under [domain] into
// static-on-demand rendering: each tenant page is generated on first request
// and cached until /api/revalidate purges it.
export async function generateStaticParams(): Promise<{ domain: string }[]> {
  return [];
}

// fontdue-js's internal server-side preloads call fetch without a cache
// option, which Next 15 treats as no-store and would downgrade every
// on-demand render to fully dynamic (no page caching). Default them to
// cached; they carry the "graphql" tag so revalidation still purges them.
export const fetchCache = "default-cache";

async function getData(domain: string) {
  return fetchGraphql<RootLayoutQuery>(domain, "RootLayout.graphql");
}

export async function generateMetadata({
  params,
}: Omit<LayoutProps, "children">): Promise<Metadata> {
  const { domain } = await params;
  const { viewer } = await getData(domain);

  return {
    metadataBase: new URL(viewer.url ?? fallbackSiteUrl(domain)),
    title: {
      template: `%s | ${viewer.settings?.title}`,
      default: viewer.settings?.title ?? "",
    },
    description: viewer.settings?.description,
  };
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { domain } = await params;
  const { viewer } = await getData(domain);

  const pages = viewer.pages?.edges?.map((edge) => edge!.node!);

  const moreThanOneCollection =
    (viewer.fontCollections?.edges?.length ?? 0) > 1;

  return (
    <html lang="en">
      <head>
        {parse(viewer.settings?.faviconMarkup ?? "", { trim: true })}
        {parse(viewer.settings?.htmlHead ?? "", { trim: true })}
      </head>
      <body>
        <PreloadWebfonts style={viewer.settings?.uiFontStyle} />
        <style
          type="text/css"
          dangerouslySetInnerHTML={{
            __html: `body { font-family: ${styleFamilyName(
              viewer.settings?.uiFontStyle,
            )}, -apple-system,"Segoe UI",Roboto,"Helvetica Neue",sans-serif; }`,
          }}
        />

        <FontdueProvider
          // No url/serverConfig needed: fontdue-js's server-side fetches use
          // the per-render config that fetchGraphql has already set (it runs
          // before anything renders, on every page), and the browser falls
          // back to the page's own origin in multi-tenant mode or
          // NEXT_PUBLIC_FONTDUE_URL in single-tenant forks. Passing it as a
          // prop would also expose the internal proxy headers in dev-mode
          // RSC debug payloads.
          config={{
            typeTester: { selectable: true, variableAxesPosition: "auto" },
          }}
        >
          <nav className="nav" data-border="true">
            <div className="nav__links">
              <div className="nav__item" data-label="home">
                {viewer.logo ? (
                  <ActiveLink href="/" className="nav__link">
                    <Image
                      src={viewer.logo.url}
                      alt="Logo"
                      width={(viewer.logo.meta.width ?? 100) / 2}
                      height={(viewer.logo.meta.height ?? 100) / 2}
                      priority
                    />
                  </ActiveLink>
                ) : (
                  <h1>
                    <ActiveLink href="/" className="nav__link">
                      {viewer.settings?.title}
                    </ActiveLink>
                  </h1>
                )}
              </div>
              {moreThanOneCollection && (
                <ActiveLink className="nav__link" href="/">
                  Fonts
                </ActiveLink>
              )}
              {pages?.map((node) => (
                <ActiveLink
                  href={`/${node.slug?.name}`}
                  className="nav__link"
                  key={node.id}
                >
                  {node.title}
                </ActiveLink>
              ))}
            </div>

            <div className="nav__item" data-label="login">
              <ActiveLink className="nav__link" href="/customer-login">
                Log in
              </ActiveLink>
            </div>
            <div className="nav__item" data-label="cart">
              <CartButton buttonStyle="icon" />
            </div>
          </nav>

          <main className="main">{children}</main>

          <footer className="footer">
            <div className="footer__copyright">
              <FontdueHTML html={viewer.settings?.footerText} />
            </div>
          </footer>

          <StoreModal />
        </FontdueProvider>
      </body>
    </html>
  );
}
