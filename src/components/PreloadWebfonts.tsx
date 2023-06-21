"use client";
import ReactDOM from "react-dom";

interface FontStyleCSS {
  cssFamily: string | null;
  name: string | null;
  webfontSources:
    | ({
        url: string | null;
        format: string | null;
      } | null)[]
    | null;
}

const createFontFaceStyle = ({
  cssFamily,
  name,
  webfontSources,
}: FontStyleCSS): string => {
  const source = webfontSources?.find((source) => source?.format === "woff2");
  if (!source) return "";

  return `
    @font-face {
      font-family: "${cssFamily} ${name}";
      src: url(${source.url}) format(${source.format});
      font-weight: 400;
      font-style: normal;
    }
  `;
};

export default function PreloadWebfonts({
  style,
}: {
  style: FontStyleCSS | null | undefined;
}) {
  if (!style) return null;
  const source = style.webfontSources?.find(
    (source) => source?.format === "woff2"
  );
  if (source?.url) {
    ReactDOM.preload(source.url, { as: "font" });
  }
  return (
    <style
      type="text/css"
      dangerouslySetInnerHTML={{
        __html: createFontFaceStyle(style),
      }}
    />
  );
}
