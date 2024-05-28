import { Metadata } from "next";
import ArticlesIndex from "@/components/ArticlesIndex";

export const metadata: Metadata = {
  title: "Articles",
};

export default async function Articles() {
  return <ArticlesIndex />;
}
