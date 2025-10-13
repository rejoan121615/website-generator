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



export type WebsitesResTYPE = {
    SUCCESS: boolean,
    MESSAGE: string,
    DATA?: CsvRowDataType[]
}

export type ReadyToBuildResTYPE = {
    SUCCESS: boolean,
    MESSAGE: string,
    DATA?: string[]
}

export type WebsiteRowTYPE = CsvRowDataType & {
  build: "unavailable" | "processing" | "complete" | "failed";
  deployed: "unavailable" | "processing" | "complete" | "failed";
  log: "---" | string;
  liveUrl: string | null;
};

export type GetApiResTYPE = {
  SUCCESS: boolean;
  MESSAGE: string;
  DATA?: WebsiteRowTYPE[] | Record<string, unknown>;
}

export type ServerEventResTYPE = {
  MESSAGE: string;
  CSV_DATA: WebsiteRowTYPE;
};
