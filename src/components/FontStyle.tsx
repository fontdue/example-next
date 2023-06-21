"use client";

import React from "react";
import useFontStyle from "fontdue-js/useFontStyle";

interface FontStyle_props {
  familyName: string | null | undefined;
  styleName: string | null | undefined;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function FontStyle({
  familyName,
  styleName,
  style: styleProp,
  children,
  ...rest
}: FontStyle_props & React.HTMLAttributes<HTMLSpanElement>) {
  const { style } = useFontStyle({
    fontFamily: `${familyName} ${styleName}`,
    fontWeight: "400",
    fontStyle: "normal",
  });

  return (
    <span style={{ ...style, ...styleProp }} {...rest}>
      {children}
    </span>
  );
}
