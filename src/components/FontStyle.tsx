"use client";

import React, { useRef } from "react";
import useFont from "fontdue-js/useFont";
import useFitText from "@/lib/useFitText";

interface FontSource {
  url: string | null;
  format: string | null;
}

interface FontStyle_props {
  familyName: string | null | undefined;
  styleName: string | null | undefined;
  webfontSources?: (FontSource | null)[] | null;
  style?: React.CSSProperties;
  /**
   * Shrink the text to fit its container's width. Sets `--fit` (0–1) on the
   * span; see `useFitText` for the CSS this expects.
   */
  fit?: boolean;
  children: React.ReactNode;
}

export default function FontStyle({
  familyName,
  styleName,
  webfontSources,
  style: styleProp,
  fit = false,
  children,
  ...rest
}: FontStyle_props & React.HTMLAttributes<HTMLSpanElement>) {
  const { style, loaded } = useFont({
    fontFamily: `${familyName} ${styleName}`,
    webfontSources,
  });
  const ref = useRef<HTMLSpanElement>(null);
  // Re-fit once the webfont swaps in for the fallback.
  useFitText(ref, fit, loaded);

  return (
    <span ref={ref} style={{ ...style, ...styleProp }} {...rest}>
      {children}
    </span>
  );
}
