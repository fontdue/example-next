import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FontDetailFragment, FontDetailCollectionFragment } from "@graphql";
import TypeTesters from "fontdue-js/TypeTesters";
import CharacterViewer from "fontdue-js/CharacterViewer";
import BuyButton from "fontdue-js/BuyButton";
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
    (coordinate: Coordinate) => `'${coordinate.axis}' ${coordinate.value}`
  );

  return {
    fontVariationSettings: settings.join(", "),
  };
}

function showBuyButton(
  collection: FontDetailFragment | FontDetailCollectionFragment
): boolean {
  if (collection.sku) return true;

  const hasFontStylesSKU = collection.fontStyles?.some(
    (style) => style.sku !== null
  );
  if (hasFontStylesSKU) return true;

  const hasBundlesSKU = collection.bundles?.some(
    (bundle) => bundle.sku !== null
  );
  if (hasBundlesSKU) return true;

  if ("children" in collection) {
    const hasChildrenSKU = collection.children?.some((child) =>
      showBuyButton(child)
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
  fontInstances: VariableInstance[] | undefined | null
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
  T extends { cssFamily: string | null; cssWeight: string | null }
>(fontStyles: (T | null)[] | null): T[][] | null {
  if (!fontStyles) return null;
  const groups = fontStyles.filter(notEmpty).reduce((groups, style) => {
    const key = `${style.cssFamily}-${style.cssWeight}`;

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(style);

    return groups;
  }, {} as Record<string, T[]>);
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
              >
                {groups?.map((group, i) => (
                  <span key={i} className="collection-styles__group">
                    {group?.map((instance, j) => (
                      <span
                        key={j}
                        style={instanceCSS(instance)}
                        className="collection-styles__style"
                      >
                        {"Aa "}
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

interface FontDetailProps {
  collection: FontDetailFragment;
}

function FontDetail({ collection }: FontDetailProps) {
  return (
    <>
      <div className={`collection-info ${collection.collectionType}`}>
        {collection.fontStyles?.length === 1 ? (
          <FontStyle
            familyName={collection.featureStyle?.cssFamily}
            styleName={collection.featureStyle?.name}
          >
            <h1 className="collection-info__single-style-name">
              {collection.name}
            </h1>
          </FontStyle>
        ) : (
          <div className="collection-info__name">
            <h1>
              {collection.name}
              {collection.collectionType === "superfamily" && " Collection"}
            </h1>
          </div>
        )}

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
          !collection.isVariableFont &&
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

      <TypeTesters collectionId={collection.id} defaultMode="local" />

      <div className="collection-more-info">
        {collection.description ? (
          <div className="collection-more-info__description">
            <FontdueHTML html={collection.description} />
          </div>
        ) : null}
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
      </div>

      <CharacterViewer collectionId={collection.id} />
    </>
  );
}

export default FontDetail;
