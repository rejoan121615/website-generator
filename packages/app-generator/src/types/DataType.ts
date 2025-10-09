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

export type CsvAddressType = {
  street: string;
  city: string;
  state: string;
  country: string;
};

export type CsvRowDataType = {
  domain: string;
  name: string;
  service_name: string;
  address: string;
  phone: string;
  email: string;
  site_title: string;
  meta_title: string;
  meta_description: string;
  logo: string;
  hero_image: string;
  gallery_1: string;
  gallery_2: string;
};


export type PromiseResultType= {
  success: boolean;
  message: string;
};

export type TerminalOperationResultType = {
  success: boolean;
  message: string;
  stdout?: string;
  stderr?: string;
};

export type AstroProjectBuilderResultType = {
  success: boolean;
  message: string;
  data: PromiseResultType [] | null
};