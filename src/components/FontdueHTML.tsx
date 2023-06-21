import React, { useMemo } from "react";
import parse from "html-react-parser";
import { kebabToCamel } from "../lib/utils";
import TestFontsForm from "fontdue-js/TestFontsForm";
import NewsletterSignup from "fontdue-js/NewsletterSignup";
import CharacterViewer from "fontdue-js/CharacterViewer";
import TypeTesters from "fontdue-js/TypeTesters";
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
    return parse(html ?? "", {
      replace: (domNode) => {
        if ("name" in domNode && "attribs" in domNode) {
          const props = attrsToProps(domNode.attribs);
          if (domNode.name === "fontdue-test-fonts-form") {
            return <TestFontsForm {...props} />;
          }
          if (domNode.name === "fontdue-newsletter-signup") {
            return <NewsletterSignup {...props} />;
          }
          if (domNode.name === "fontdue-character-viewer") {
            return <CharacterViewer {...props} />;
          }
          if (domNode.name === "fontdue-type-tester") {
            // @ts-ignore
            return <TypeTester {...props} />;
          }
          if (domNode.name === "fontdue-type-testers") {
            return <TypeTesters {...props} />;
          }
          if (domNode.name === "fontdue-buy-button") {
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
