import { DomainDataTYPE } from '@repo/cf'
import { CsvRowDataType, EventResType } from '@repo/shared-types'

export type WebsitesResTYPE = EventResType & {
    DATA?: CsvRowDataType[]
}

export type ReadyToBuildResTYPE = EventResType & {
    DATA?: string[]
}

export type WebsiteRowTYPE = CsvRowDataType & {
  build: "unavailable" | "processing" | "complete" | "failed";
  deployed: "unavailable" | "processing" | "complete" | "failed";
  log?: "---" | string;
  liveUrl?: string | null;
};


export type WebsiteFuncResTYPE = EventResType & {
  DATA?: WebsiteRowTYPE[];
  ERROR?: Error
};

export type DomainTableDataTYPE = {
  domain: string;
  domainStatus: 'active' | 'inactive';
  readyToConnect: "Deploy First" | "Ready" | "Processing" | "Connected" | "Failed";
}

export type CsvParseApiResponse = EventResType & {
  DATA?: CsvRowDataType[];
};

export type CsvReplaceApiResponse = EventResType & {
  DATA?: {
    totalRecords: number;
    replacedRecords: number;
  };
};

export type CsvMergeApiResponse = EventResType & {
  DATA?: {
    totalRecords: number;
    newRecords: number;
    existingRecords: number;
  };
};