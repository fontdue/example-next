import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FontDetailFragment, FontDetailCollectionFragment } from "@graphql";
import TypeTesters from "fontdue-js/TypeTesters";
import FeatureTesters from "fontdue-js/FeatureTesters";
import CharacterViewer from "fontdue-js/CharacterViewer";
import BuyButton from "fontdue-js/BuyButton";
import NodePasswordForm from "fontdue-js/NodePasswordForm";
import { FontduePasswordProtectedError } from "fontdue-js/server";
import FontStyle from "./FontStyle";
import { notEmpty, pluralize } from "@/lib/utils";
import Carousel from "./Carousel";
import FontdueHTML from "./FontdueHTML";

type Coordinate = {
  axis: string;
  value: number;
};

type VariableInstance = {
  name: string;
  coordinates: Coordinate[];
};

function instanceCSS(instance: VariableInstance): React.CSSProperties {
  const settings = instance.coordinates.map(
    (coordinate: Coordinate) => `'${coordinate.axis}' ${coordinate.value}`,
  );

  return {
    fontVariationSettings: settings.join(", "),
  };
}

function showBuyButton(
  collection: FontDetailFragment | FontDetailCollectionFragment,
): boolean {
  if (collection.sku) return true;

  const hasFontStylesSKU = collection.fontStyles?.some(
    (style) => style.sku !== null,
  );
  if (hasFontStylesSKU) return true;

  const hasBundlesSKU = collection.bundles?.some(
    (bundle) => bundle.sku !== null,
  );
  if (hasBundlesSKU) return true;

  if ("children" in collection) {
    const hasChildrenSKU = collection.children?.some((child) =>
      showBuyButton(child),
    );
    if (hasChildrenSKU) return true;
  }

  return false;
}

interface CollectionStyles_props {
  collection: FontDetailCollectionFragment;
  isSubfamily: boolean;
}

function groupVariableInstances(
  fontInstances: VariableInstance[] | undefined | null,
): VariableInstance[][] | undefined {
  if (!fontInstances) return;
  const groupedFontInstances: { [key: string]: VariableInstance[] } = {};

  if (fontInstances.length < 2) {
    return Object.values(groupedFontInstances);
  }

  // Determine the varying axis by comparing first two instances
  const varyingAxis = fontInstances[0].coordinates.find((coordinate, index) => {
    return coordinate.value !== fontInstances[1].coordinates[index].value;
  })?.axis;

  for (const fontInstance of fontInstances) {
    // Exclude varying axis from grouping
    const sortedCoordinates = fontInstance.coordinates
      .filter((coord) => coord.axis !== varyingAxis)
      .sort((a, b) => a.axis.localeCompare(b.axis));

    // Create a string key by concatenating axis and value pairs
    const key = sortedCoordinates
      .map((coord) => `${coord.axis}:${coord.value}`)
      .join(",");

    // If the key is not in the dictionary, create a new array
    if (!(key in groupedFontInstances)) {
      groupedFontInstances[key] = [];
    }

    // Add the font instance to the group
    groupedFontInstances[key].push(fontInstance);
  }

  return Object.values(groupedFontInstances);
}

function familyStylesGrouped<
  T extends { cssFamily: string | null; cssWeight: string | null },
>(fontStyles: (T | null)[] | null): T[][] | null {
  if (!fontStyles) return null;
  const groups = fontStyles.filter(notEmpty).reduce(
    (groups, style) => {
      const key = `${style.cssFamily}-${style.cssWeight}`;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(style);

      return groups;
    },
    {} as Record<string, T[]>,
  );
  return Object.values(groups);
}

function CollectionStyles({ collection, isSubfamily }: CollectionStyles_props) {
  return (
    <div className="collection-styles">
      {isSubfamily && (
        <h3 className="collection-styles__label">{collection.name}</h3>
      )}

      {collection.isVariableFont
        ? collection.fontStyles?.map((style, i) => {
            const groups = groupVariableInstances(style.variableInstances);
            return (
              <FontStyle
                key={i}
                familyName={collection.name}
                styleName={style.name}
                webfontSources={style.webfontSources}
              >
                {groups?.map((group, i) => (
                  <span key={i} className="collection-styles__group">
                    {group?.map((instance, j) => (
                      <span
                        key={j}
                        style={instanceCSS(instance)}
                        className="collection-styles__style"
                      >
                        {style.keyCharacters}{" "}
                      </span>
                    ))}
                  </span>
                ))}
              </FontStyle>
            );
          })
        : familyStylesGrouped(collection.fontStyles)?.map((chunk, i) => (
            <span key={i} className="collection-styles__group">
              {chunk.map((style, j) => (
                <FontStyle
                  key={j}
                  familyName={collection.name}
                  styleName={style.name}
                  webfontSources={style.webfontSources}
                  className="collection-styles__style"
                >
                  {style.name}{" "}
                </FontStyle>
              ))}
            </span>
          ))}
    </div>
  );
}

// The `.collection-info` header: name, imagery, style listing and buy button.
// Split out as its own async component so it can await the collection query
// while the embedded testers below start fetching in parallel (see FontDetail).
async function CollectionHeader({
  collection: collectionInput,
  collectionSlug,
}: {
  collection: FontDetailFragment | Promise<FontDetailFragment>;
  collectionSlug: string;
}) {
  let collection;
  try {
    collection = await collectionInput;
  } catch (error) {
    // The collection is password-protected and the visitor hasn't unlocked it.
    // Render the password form instead of a 404: it exists, it's just gated.
    // NodePasswordForm submits the password, remembers the returned token,
    // POSTs it to /api/unlock (which enables the draft-mode bypass, taking
    // this visitor off the static full-route cache), and reloads so the
    // collection then resolves. This locked render happens during a static
    // fill, so the form itself is what gets cached for the public. The
    // sibling testers render nothing on a locked collection (their queries
    // resolve to no collection), so this block is the whole page.
    if (error instanceof FontduePasswordProtectedError) {
      return (
        <main className="page">
          <div className="page__body">
            <article className="markdown">
              <h1>Password required</h1>
              <p>
                This collection is password-protected. Enter the password to
                view it.
              </p>
            </article>
            <NodePasswordForm
              collectionSlug={collectionSlug}
              unlockEndpoint="/api/unlock"
            />
          </div>
        </main>
      );
    }
    throw error;
  }
  return (
    <div className={`collection-info ${collection.collectionType}`}>
      <div className="collection-info__name">
        <h1>
          {collection.name}
          {collection.collectionType === "superfamily" && " Collection"}
        </h1>
      </div>

      {collection.images?.length ? (
        <div className="collection-info__images">
          <Carousel>
            {collection.images.map((image, i) => (
              <div key={i} className="collection-info__image">
                {image.meta && image.meta.mimeType === "video/mp4" ? (
                  <video src={image.url!} playsInline muted autoPlay loop />
                ) : (
                  <Image
                    src={image.url!}
                    width={image.meta?.width ?? 1000}
                    height={image.meta?.height ?? 768}
                    alt={image.description ?? ""}
                    priority={i === 0}
                  />
                )}
              </div>
            ))}
          </Carousel>
        </div>
      ) : null}

      <div className="collection-info__styles">
        {collection.collectionType === "family" &&
        (collection.fontStyles?.length ?? 0) > 1 ? (
          <CollectionStyles collection={collection} isSubfamily={false} />
        ) : null}
        {collection.collectionType === "superfamily" &&
          collection.children?.map((child, i) => (
            <CollectionStyles key={i} collection={child} isSubfamily={true} />
          ))}
      </div>

      <div className="collection-info__buy">
        {showBuyButton(collection) && (
          <BuyButton
            collectionId={collection.id}
            collectionName={collection.name}
          />
        )}
        {collection.minisiteLink && (
          <a
            href={collection.minisiteLink}
            className="collection-info__minisite-link"
            target="_blank"
            rel="noopener"
          >
            {`${collection.name} Minisite`}
          </a>
        )}
      </div>
    </div>
  );
}

// The `.collection-more-info` block: description, PDF specimens and supported
// languages. Split out for the same reason as CollectionHeader.
async function CollectionExtras({
  collection: collectionInput,
}: {
  collection: FontDetailFragment | Promise<FontDetailFragment>;
}) {
  let collection;
  try {
    collection = await collectionInput;
  } catch (error) {
    // Locked collection: CollectionHeader renders the password form as the
    // whole page, so there is nothing more to add here.
    if (error instanceof FontduePasswordProtectedError) return null;
    throw error;
  }
  const languages = collection.languages?.filter(notEmpty) ?? [];
  return (
    <div className="collection-more-info">
      {collection.description ? (
        <div className="collection-more-info__description markdown">
          <FontdueHTML html={collection.description} />
        </div>
      ) : null}
      <div className="collection-more-info__group">
        {collection.pdfs?.length ? (
          <div className="collection-more-info__specimens">
            <h3 className="specimen-more-info__specimens__label">
              {pluralize("PDF Specimen", "PDFs", collection.pdfs.length)}
            </h3>
            <div className="collection-more-info__specimens__images">
              {collection.pdfs.map((pdf, i) => (
                <Link
                  key={i}
                  href={pdf!.url!}
                  target="_blank"
                  className="collection-more-info__specimens__link"
                >
                  <div className="collection-more-info__specimens__image">
                    {pdf!.thumbnailUrl && (
                      <img src={pdf!.thumbnailUrl} alt="" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        {languages.length ? (
          <div className="collection-more-info__languages">
            <h3>
              {pluralize(
                "Supported language",
                "Supported languages",
                languages.length,
              )}
            </h3>
            <div className="collection-more-info__languages__list">
              {languages.map((language, i) => (
                <div key={i}>{language}</div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface FontDetailProps {
  // Either a resolved collection (e.g. the single-collection home page, which
  // has already fetched it) or a promise for one. When a promise is passed, the
  // collection query is still in flight — the header/extras below await it while
  // the embedded testers fetch alongside it rather than after it.
  collection: FontDetailFragment | Promise<FontDetailFragment>;
  // The collection's slug. The embedded testers preload by it — on the font
  // page it comes straight from the route params, so their queries start
  // without waiting for the collection query to resolve.
  collectionSlug: string;
}

// Renders synchronously (nothing awaited here), so React begins rendering
// every child at once: CollectionHeader/CollectionExtras await the collection
// query while the sibling testers issue their own slug-keyed queries in
// parallel — the two levels of the old fetch waterfall now run concurrently.
function FontDetail({ collection, collectionSlug }: FontDetailProps) {
  return (
    <>
      <CollectionHeader
        collection={collection}
        collectionSlug={collectionSlug}
      />
      <TypeTesters collectionSlug={collectionSlug} defaultMode="local" />
      <CollectionExtras collection={collection} />
      <FeatureTesters collectionSlug={collectionSlug} />
      <CharacterViewer collectionSlug={collectionSlug} />
    </>
  );
}

export default FontDetail;
