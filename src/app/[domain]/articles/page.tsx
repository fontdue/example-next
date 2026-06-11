import { Metadata } from "next";
import ArticlesIndex from "@/components/ArticlesIndex";

export const metadata: Metadata = {
  title: "Articles",
  alternates: { canonical: "/articles" },
};

export default async function Articles({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  return <ArticlesIndex domain={domain} />;
}
