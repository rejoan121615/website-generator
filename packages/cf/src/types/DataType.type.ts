import { APIError } from 'cloudflare'
import { Zone } from 'cloudflare/resources/zones/zones.mjs';
import { DomainCreateResponse } from 'cloudflare/src/resources/pages/projects/domains.js';
import { Project } from 'cloudflare/resources/pages/projects/projects.mjs';
import { Deployment } from 'cloudflare/resources/pages.mjs';


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
  logo_url: string;
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
};

export type CFApiResTYPE = {
  SUCCESS: boolean;
  MESSAGE: string;
  ERROR?: APIError;
}

export type GetApiResTYPE = {
  SUCCESS: boolean;
  MESSAGE: string;
  DATA?: Record<string, unknown>
}

export type ServerEventResTYPE = {
  MESSAGE: string;
  CSV_DATA: WebsiteRowTYPE;
};

export type DomainDataTYPE = Zone;

export type DomainResTYPE = CFApiResTYPE & {
  DATA?: DomainDataTYPE[];
};

export type ConnectDomainResTYPE = CFApiResTYPE & {
  DATA?: DomainCreateResponse;
}

export type ProjectDataTYPE = Project;

export type ProjectsResTYPE = CFApiResTYPE & {
  DATA?: ProjectDataTYPE[];
};


export type DeleteProjectResTYPE = CFApiResTYPE & {
  DATA?: {
    deleted: boolean;
  };
};