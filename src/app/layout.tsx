import FontdueProvider from "fontdue-js/FontdueProvider";
import StoreModal from "fontdue-js/StoreModal";
import CartButton from "fontdue-js/CartButton";
import parse from "html-react-parser";
import { Metadata } from "next";
import "fontdue-js/fontdue.css";
import Image from "next/image";
import "@/styles/main.scss";
import { RootLayoutQuery } from "@graphql";
import { fetchGraphql } from "@/lib/graphql";
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
}

async function getData() {
  return fetchGraphql<RootLayoutQuery>("RootLayout.graphql");
}

export async function generateMetadata(): Promise<Metadata> {
  const { viewer } = await getData();

  return {
    // The canonical site URL set in the Fontdue admin (Settings → Website
    // settings). The store API host is usually not the site's public host,
    // so there is deliberately no env-var fallback.
    metadataBase: viewer.url ? new URL(viewer.url) : null,
    title: {
      template: `%s | ${viewer.settings?.title}`,
      default: viewer.settings?.title ?? "",
    },
    description: viewer.settings?.description,
  };
}

export default async function RootLayout(props: LayoutProps) {
  const { children } = props;
  const { viewer } = await getData();

  const pages = viewer.pages?.edges?.map((edge) => edge!.node!);
  const footerPages = viewer.footer?.edges?.map((edge) => edge!.node!);

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
          // No url prop needed: fontdue-js reads NEXT_PUBLIC_FONTDUE_URL.
          config={{
            typeTester: {
              selectable: true,
              variableAxesPosition: "auto",
              size: { min: 16, max: 400 },
            },
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
              <ActiveLink className="nav__link" href="/">
                {moreThanOneCollection ? "Fonts" : "Home"}
              </ActiveLink>
              {pages
                ?.filter((node) => node.slug?.name !== "customer-login")
                .map((node) => (
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
            {footerPages && footerPages.length > 0 && (
              <div className="footer__links">
                {footerPages.map((node) => (
                  <ActiveLink
                    href={`/${node.slug?.name}`}
                    className="footer__link"
                    key={node.id}
                  >
                    {node.title}
                  </ActiveLink>
                ))}
              </div>
            )}
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
