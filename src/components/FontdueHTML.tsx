import React, { useMemo } from "react";
import parse, { attributesToProps, Text } from "html-react-parser";
import { kebabToCamel } from "../lib/utils";
import TestFontsForm from "fontdue-js/TestFontsForm";
import NewsletterSignup from "fontdue-js/NewsletterSignup";
import CharacterViewer from "fontdue-js/CharacterViewer";
import TypeTesters from "fontdue-js/TypeTesters";
import FeatureTesters from "fontdue-js/FeatureTesters";
import TypeTester from "fontdue-js/TypeTester";
import BuyButton from "fontdue-js/BuyButton";
import CartButton from "fontdue-js/CartButton";

type Attrs = {
  [key: string]: string;
};
type Props = {
  [key: string]: string | boolean;
};

const attrsToProps = (attrs: Attrs): Props => {
  return Object.keys(attrs).reduce((acc, key) => {
    let val: string | boolean = attrs[key];
    if (val === "") val = true;
    acc[kebabToCamel(key)] = val;
    return acc;
  }, {} as Props);
};

interface FontdueHTML_props {
  html: string | undefined | null;
}

export default function FontdueHTML({ html }: FontdueHTML_props) {
  const content = useMemo(() => {
    // Body images come through as bare <img> tags. The first one is often the
    // only one above the fold, so it keeps loading eagerly and the rest wait
    // until they are scrolled near, instead of every visitor fetching all of
    // them up front.
    let imageCount = 0;
    return parse(html ?? "", {
      replace: (domNode) => {
        // Body copy sometimes arrives as a run of text with no paragraph
        // around it. The reading measure is set on the children of the
        // article, and a bare run of text is not one of them, so it is
        // wrapped to keep it from running the full width of the column.
        if (
          domNode instanceof Text &&
          domNode.parent === null &&
          domNode.data.trim() !== ""
        ) {
          return <div>{domNode.data}</div>;
        }
        if ("name" in domNode && "attribs" in domNode) {
          if (domNode.name === "img") {
            const isFirstImage = imageCount++ === 0;
            return (
              <img
                {...attributesToProps(domNode.attribs)}
                loading={isFirstImage ? "eager" : "lazy"}
                decoding="async"
              />
            );
          }
          const props = attrsToProps(domNode.attribs);
          if (domNode.name === "fontdue-test-fonts-form") {
            return <TestFontsForm {...props} />;
          }
          if (domNode.name === "fontdue-newsletter-signup") {
            return <NewsletterSignup {...props} />;
          }
          if (domNode.name === "fontdue-character-viewer") {
            // @ts-ignore
            return <CharacterViewer {...props} />;
          }
          if (domNode.name === "fontdue-type-tester") {
            // @ts-ignore
            return <TypeTester {...props} />;
          }
          if (domNode.name === "fontdue-type-testers") {
            return <TypeTesters {...props} />;
          }
          if (domNode.name === "fontdue-feature-testers") {
            // @ts-ignore
            return <FeatureTesters {...props} />;
          }
          if (domNode.name === "fontdue-buy-button") {
            // @ts-ignore
            return <BuyButton {...props} />;
          }
          if (domNode.name === "fontdue-cart-button") {
            return <CartButton {...props} />;
          }
        }
      },
    });
  }, [html]);

  return <React.Fragment>{content}</React.Fragment>;
}
