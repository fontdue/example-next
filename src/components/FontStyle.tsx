"use client";

import React from "react";
import useFont from "fontdue-js/useFont";

interface FontSource {
  url: string | null;
  format: string | null;
}

interface FontStyle_props {
  familyName: string | null | undefined;
  styleName: string | null | undefined;
  webfontSources?: (FontSource | null)[] | null;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function FontStyle({
  familyName,
  styleName,
  webfontSources,
  style: styleProp,
  children,
  ...rest
}: FontStyle_props & React.HTMLAttributes<HTMLSpanElement>) {
  const { style } = useFont({
    fontFamily: `${familyName} ${styleName}`,
    webfontSources,
  });

  return (
    <span style={{ ...style, ...styleProp }} {...rest}>
      {children}
    </span>
  );
}
