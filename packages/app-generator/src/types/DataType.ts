import { EventResType } from "@repo/shared-types";

export interface JsonLdAddressType {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
}

export interface JsonLdDataType {
  "@context": string;
  "@type": string;
  "@id": string;
  name: string;
  description: string;
  slogan: string;
  url: string;
  logo: string;
  image: string[];
  address: JsonLdAddressType;
  telephone: string;
  email: string;
}

export type TerminalOperationResultType = EventResType & {
  stdout?: string;
  stderr?: string;
};

export type AstroProjectBuilderResultType = EventResType & {
  DATA: EventResType[] | string | null
};
