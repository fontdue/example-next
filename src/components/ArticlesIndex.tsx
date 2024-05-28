import ActiveLink from "@/components/ActiveLink";
import { fetchGraphql } from "@/lib/graphql";
import { ArticlesQuery, ArticlesQueryVariables } from "@graphql";
import Link from "next/link";
import Image from "next/image";

interface ArticlesIndexProps {
  tag?: string | null | undefined;
}

export default async function ArticlesIndex({
  tag: tagParam,
}: ArticlesIndexProps) {
  const data = await fetchGraphql<ArticlesQuery, ArticlesQueryVariables>(
    "Articles.graphql",
    {
      tags: tagParam ? [tagParam] : null,
    },
  );
  return (
    <div className="articles">
      <div className="articles__meta">
        <h1>Articles</h1>

        <ul className="articles__tags">
          {data.viewer?.articlesTags?.map((tag, i) => (
            <li key={i}>
              <ActiveLink
                active={tag === tagParam}
                href={`/articles/tag/${tag}`}
              >
                {tag}
              </ActiveLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="articles__items">
        {data.viewer.articles?.edges?.map((edge, i) => {
          const article = edge?.node;
          if (!article) return null;
          const image = article.images?.[0];

          return (
            <Link
              key={article.id}
              href={`/article/${article.slug?.name}`}
              className="articles__item"
            >
              {image ? (
                <Image
                  className="articles__item__image"
                  src={image.url!}
                  width={image.meta?.width ?? 400}
                  height={image.meta?.height ?? 300}
                  alt={image.description ?? ""}
                  priority={i <= 9}
                />
              ) : null}
              {article.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
