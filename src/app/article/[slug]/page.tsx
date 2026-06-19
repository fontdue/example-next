import Carousel from "@/components/Carousel";
import { fetchGraphql } from "@/lib/graphql";
import { ArticleQuery, ArticleQueryVariables } from "@graphql";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import FontdueHTML from "@/components/FontdueHTML";
import { Metadata } from "next";

interface ArticleProps {
  params: Promise<{ slug: string }>;
}

async function getData(slug: string) {
  return fetchGraphql<ArticleQuery, ArticleQueryVariables>("Article.graphql", {
    slug,
  });
}

export async function generateMetadata(props: ArticleProps): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getData(slug);
  const article = data.viewer.slug?.article;
  if (!article) notFound();

  return {
    ...article.pageMetadata,
    title: article.pageMetadata?.title ?? article.title,
    alternates: { canonical: `/article/${slug}` },
  };
}

export default async function Article(props: ArticleProps) {
  const { slug } = await props.params;
  const data = await getData(slug);
  const article = data.viewer.slug?.article;
  if (!article) notFound();

  return (
    <div className="article">
      <div>
        <Link href="/articles">Articles</Link>
      </div>

      <div className="article__header">
        <h1>{article.title}</h1>

        {article.tags ? (
          <div className="article__tags">
            {article.tags.map((tag, i) => (
              <Fragment key={i}>
                <Link href={`/articles/tag/${tag}`}>{tag}</Link>{" "}
              </Fragment>
            ))}
          </div>
        ) : null}

        {article.images?.length ? (
          <Carousel>
            {article.images.map((image, i) => (
              <Image
                key={image.id}
                src={image.url!}
                className="article__image"
                width={image.meta?.width ?? 1200}
                height={image.meta?.height ?? 768}
                alt={image.description ?? ""}
                priority={i === 0}
              />
            ))}
          </Carousel>
        ) : null}
      </div>

      <div className="article__body markdown">
        <FontdueHTML html={article.body} />
      </div>
    </div>
  );
}

export { articleParams as generateStaticParams } from "@/lib/static-params";
