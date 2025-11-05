export type CsvRowDataType = {
  template: string;
  domain: string;
  name: string;
  service_name: string;
  address: string;
  phone: string;
  email: string;
  site_title: string;
  meta_title: string;
  meta_description: string;
  logo_url: string;
};

export const CsvHeaderKey : (keyof CsvRowDataType)[] = [
  "template",
  "domain",
  "name",
  "service_name",
  "address",
  "phone",
  "email",
  "site_title",
  "meta_title",
  "meta_description",
  "logo_url"
];

export type CsvAddressType = {
  street: string;
  city: string;
  state: string;
  country: string;
};

export type EventResType = {
  SUCCESS: boolean;
  MESSAGE: string;
  ERROR?: Error | any;
};

export type WebsiteRowTYPE = CsvRowDataType & {
  build?: "unavailable" | "processing" | "complete" | "failed";
  deployed?: "unavailable" | "processing" | "complete" | "failed";
  log?: "---" | string;
  liveUrl?: string | null;
  domainConnected?: boolean;
};

export type ServerEventResTYPE = {
  MESSAGE: string;
  CSV_DATA: WebsiteRowTYPE;
};
