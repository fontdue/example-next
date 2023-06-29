export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  Decimal: { input: any; output: any; }
};

export type ApplyCouponInput = {
  code: InputMaybe<Scalars['String']['input']>;
};

export enum CollectionType {
  /** @deprecated This is no longer supported */
  Bundle = 'BUNDLE',
  Designer = 'DESIGNER',
  Family = 'FAMILY',
  Superfamily = 'SUPERFAMILY'
}

export type CreateOrderItemsInput = {
  licenseSelections: Array<InputMaybe<LicenseSelectionInput>>;
  skuIds: Array<InputMaybe<Scalars['ID']['input']>>;
};

export type FontCollectionOrder = {
  direction: InputMaybe<OrderDirection>;
  field: InputMaybe<FontCollectionOrderField>;
};

export enum FontCollectionOrderField {
  IsNew = 'IS_NEW',
  Position = 'POSITION'
}

export type IdentityInput = {
  administrativeArea: InputMaybe<Scalars['String']['input']>;
  country: Scalars['String']['input'];
  email: Scalars['String']['input'];
  locality: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organization: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
  sortingCode: InputMaybe<Scalars['String']['input']>;
  street: InputMaybe<Scalars['String']['input']>;
  sublocality: InputMaybe<Scalars['String']['input']>;
  vatNumber: InputMaybe<Scalars['String']['input']>;
  zip: InputMaybe<Scalars['String']['input']>;
};

export type LicenseOptionsSpec = {
  licenseId: Scalars['ID']['input'];
  licenseOptionIds: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type LicenseSelectionInput = {
  licenseId: Scalars['ID']['input'];
  licenseOptionId: InputMaybe<Scalars['ID']['input']>;
  licenseVariableId: InputMaybe<Scalars['ID']['input']>;
  variableText: InputMaybe<Scalars['String']['input']>;
};

export enum LicenseType {
  Retail = 'RETAIL',
  Special = 'SPECIAL',
  Test = 'TEST'
}

export type LoginInput = {
  email: InputMaybe<Scalars['String']['input']>;
};

export enum NameFormat {
  Default = 'DEFAULT',
  Localized = 'LOCALIZED'
}

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type OrderItemInput = {
  id: Scalars['ID']['input'];
  licenseSelections: Array<InputMaybe<LicenseSelectionInput>>;
};

export enum Separator {
  Comma = 'COMMA',
  Newline = 'NEWLINE',
  Whitespace = 'WHITESPACE'
}

export enum TextFormat {
  Html = 'HTML',
  Markdown = 'MARKDOWN'
}

export type UpdateCustomerInput = {
  email: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  newsletterOptIn: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateOrderInput = {
  billingIdentity: InputMaybe<IdentityInput>;
  licenseeIdentity: InputMaybe<IdentityInput>;
  licenseeIsBillingIdentity: InputMaybe<Scalars['Boolean']['input']>;
  orderItems: InputMaybe<Array<InputMaybe<OrderItemInput>>>;
  stripePaymentMethodId: InputMaybe<Scalars['String']['input']>;
  stripeTokenId: InputMaybe<Scalars['String']['input']>;
};

export type ArticleQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type ArticleQuery = { viewer: { articlesTags: Array<string> | null, slug: { article: { title: string | null, tags: Array<string> | null, body: string | null, images: Array<{ id: string, url: string | null, description: string | null, meta: { width: number | null, height: number | null } | null }> | null, pageMetadata: { title: string | null, description: string | null, keywords: string | null } | null } | null } | null } };

export type ArticlePathsQueryVariables = Exact<{ [key: string]: never; }>;


export type ArticlePathsQuery = { viewer: { articles: { edges: Array<{ node: { slug: { name: string | null } | null } | null } | null> | null } | null } };

export type ArticlesQueryVariables = Exact<{
  tags: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type ArticlesQuery = { viewer: { articlesTags: Array<string> | null, articles: { edges: Array<{ node: { id: string, title: string | null, path: string | null, tags: Array<string> | null, slug: { name: string | null } | null, images: Array<{ url: string | null, description: string | null, meta: { width: number | null, height: number | null } | null }> | null } | null } | null> | null } | null } };

export type FontDetailCollectionFragment = { id: string, name: string, collectionType: string, isVariableFont: boolean, cssUrl: string | null, sku: { id: string } | null, bundles: Array<{ sku: { id: string } | null }> | null, fontStyles: Array<{ name: string, cssFamily: string | null, cssWeight: string | null, cssStyle: string | null, sku: { id: string } | null, variableInstances: Array<{ name: string, coordinates: Array<{ axis: string, value: number }> }> | null }> | null };

export type FontDetailFragment = { shortDescription: string | null, description: string | null, minisiteLink: string | null, id: string, name: string, collectionType: string, isVariableFont: boolean, cssUrl: string | null, pdfs: Array<{ url: string | null, thumbnailUrl: string | null, name: string | null } | null> | null, featureStyle: { cssFamily: string | null, name: string, family: { cssUrl: string | null } | null } | null, children: Array<{ id: string, name: string, collectionType: string, isVariableFont: boolean, cssUrl: string | null, sku: { id: string } | null, bundles: Array<{ sku: { id: string } | null }> | null, fontStyles: Array<{ name: string, cssFamily: string | null, cssWeight: string | null, cssStyle: string | null, sku: { id: string } | null, variableInstances: Array<{ name: string, coordinates: Array<{ axis: string, value: number }> }> | null }> | null }> | null, images: Array<{ url: string | null, description: string | null, meta: { mimeType: string | null, width: number | null, height: number | null } | null }> | null, sku: { id: string } | null, bundles: Array<{ sku: { id: string } | null }> | null, fontStyles: Array<{ name: string, cssFamily: string | null, cssWeight: string | null, cssStyle: string | null, sku: { id: string } | null, variableInstances: Array<{ name: string, coordinates: Array<{ axis: string, value: number }> }> | null }> | null };

export type FontQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type FontQuery = { viewer: { slug: { fontCollection: { shortDescription: string | null, description: string | null, minisiteLink: string | null, id: string, name: string, collectionType: string, isVariableFont: boolean, cssUrl: string | null, pageMetadata: { title: string | null, description: string | null, keywords: string | null } | null, pdfs: Array<{ url: string | null, thumbnailUrl: string | null, name: string | null } | null> | null, featureStyle: { cssFamily: string | null, name: string, family: { cssUrl: string | null } | null } | null, children: Array<{ id: string, name: string, collectionType: string, isVariableFont: boolean, cssUrl: string | null, sku: { id: string } | null, bundles: Array<{ sku: { id: string } | null }> | null, fontStyles: Array<{ name: string, cssFamily: string | null, cssWeight: string | null, cssStyle: string | null, sku: { id: string } | null, variableInstances: Array<{ name: string, coordinates: Array<{ axis: string, value: number }> }> | null }> | null }> | null, images: Array<{ url: string | null, description: string | null, meta: { mimeType: string | null, width: number | null, height: number | null } | null }> | null, sku: { id: string } | null, bundles: Array<{ sku: { id: string } | null }> | null, fontStyles: Array<{ name: string, cssFamily: string | null, cssWeight: string | null, cssStyle: string | null, sku: { id: string } | null, variableInstances: Array<{ name: string, coordinates: Array<{ axis: string, value: number }> }> | null }> | null } | null } | null } };

export type FontPathsQueryVariables = Exact<{ [key: string]: never; }>;


export type FontPathsQuery = { viewer: { fontCollections: { edges: Array<{ node: { slug: { name: string | null } | null } | null } | null> | null } | null } };

export type FontCollectionCssFragment = { featureStyle: { cssFamily: string | null, name: string, webfontSources: Array<{ format: string | null, url: string | null } | null> | null, family: { cssUrl: string | null } | null } | null };

export type IndexQueryVariables = Exact<{ [key: string]: never; }>;


export type IndexQuery = { viewer: { firstCollection: { edges: Array<{ node: { shortDescription: string | null, description: string | null, minisiteLink: string | null, id: string, name: string, collectionType: string, isVariableFont: boolean, cssUrl: string | null, pdfs: Array<{ url: string | null, thumbnailUrl: string | null, name: string | null } | null> | null, featureStyle: { cssFamily: string | null, name: string, family: { cssUrl: string | null } | null } | null, children: Array<{ id: string, name: string, collectionType: string, isVariableFont: boolean, cssUrl: string | null, sku: { id: string } | null, bundles: Array<{ sku: { id: string } | null }> | null, fontStyles: Array<{ name: string, cssFamily: string | null, cssWeight: string | null, cssStyle: string | null, sku: { id: string } | null, variableInstances: Array<{ name: string, coordinates: Array<{ axis: string, value: number }> }> | null }> | null }> | null, images: Array<{ url: string | null, description: string | null, meta: { mimeType: string | null, width: number | null, height: number | null } | null }> | null, sku: { id: string } | null, bundles: Array<{ sku: { id: string } | null }> | null, fontStyles: Array<{ name: string, cssFamily: string | null, cssWeight: string | null, cssStyle: string | null, sku: { id: string } | null, variableInstances: Array<{ name: string, coordinates: Array<{ axis: string, value: number }> }> | null }> | null } | null } | null> | null } | null, fontCollections: { edges: Array<{ node: { id: string, name: string, collectionType: string, url: string | null, isNew: boolean | null, opticalAdjustment: any | null, slug: { name: string | null } | null, featureStyle: { cssFamily: string | null, name: string, webfontSources: Array<{ format: string | null, url: string | null } | null> | null, family: { cssUrl: string | null } | null } | null } | null } | null> | null } | null } };

export type LicenseQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type LicenseQuery = { viewer: { slug: { license: { id: string, name: string | null, text: string | null } | null } | null } };

export type LicensePathsQueryVariables = Exact<{ [key: string]: never; }>;


export type LicensePathsQuery = { viewer: { licenses: Array<{ slug: { name: string | null } | null }> | null } };

export type LicensesQueryVariables = Exact<{ [key: string]: never; }>;


export type LicensesQuery = { viewer: { licenses: Array<{ id: string, name: string | null, slug: { name: string | null } | null }> | null } };

export type PageQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type PageQuery = { viewer: { slug: { page: { title: string | null, text: string | null, pageMetadata: { title: string | null, description: string | null, keywords: string | null } | null } | null } | null } };

export type PagePathsQueryVariables = Exact<{ [key: string]: never; }>;


export type PagePathsQuery = { viewer: { pages: { edges: Array<{ node: { slug: { name: string | null } | null } | null } | null> | null } | null } };

export type RootLayoutQueryVariables = Exact<{ [key: string]: never; }>;


export type RootLayoutQuery = { viewer: { fontCollections: { edges: Array<{ node: { id: string } | null } | null> | null } | null, pages: { edges: Array<{ node: { id: string, title: string | null, slug: { name: string | null } | null } | null } | null> | null } | null, settings: { title: string | null, footerText: string | null, htmlHead: string | null, faviconMarkup: string | null, uiFontStyle: { name: string, cssFamily: string | null, webfontSources: Array<{ url: string | null, format: string | null } | null> | null } | null } | null, logo: { url: string, meta: { width: number | null, height: number | null } } | null } };

export type SitemapQueryVariables = Exact<{ [key: string]: never; }>;


export type SitemapQuery = { viewer: { fontCollections: { edges: Array<{ node: { slug: { name: string | null } | null } | null } | null> | null } | null, articles: { edges: Array<{ node: { slug: { name: string | null } | null } | null } | null> | null } | null, pages: { edges: Array<{ node: { slug: { name: string | null } | null } | null } | null> | null } | null, licenses: Array<{ slug: { name: string | null } | null }> | null } };
