import { APIError } from 'cloudflare'
import { Zone } from 'cloudflare/resources/zones/zones.mjs';
import { DomainCreateResponse } from 'cloudflare/src/resources/pages/projects/domains.js';
import { Project } from 'cloudflare/resources/pages/projects/projects.mjs';
import { Deployment } from 'cloudflare/resources/pages.mjs';
import { CsvRowDataType, EventResType } from '@repo/shared-types'
import { DomainGetResponse } from 'cloudflare/resources/pages/projects.mjs';




export type WebsitesResTYPE = EventResType & {
    DATA?: CsvRowDataType[]
}

export type ReadyToBuildResTYPE = EventResType & {
    DATA?: string[]
}

export type CFApiResTYPE = EventResType & {
  ERROR?: APIError;
}

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
  ERROR?: APIError;
};

export type ProjectDomainDataTYPE = DomainGetResponse;

export type CheckDomainStatusResTYPE = EventResType & {
  DATA?: ProjectDomainDataTYPE
  ERROR?: APIError;
};


export type DeployApiResTYPE = EventResType & {
  DATA?: ProjectDataTYPE
};


export type DeployResTYPE = EventResType & {
  DATA?: Deployment;
};