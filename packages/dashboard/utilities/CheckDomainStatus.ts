import { DomainDataTYPE } from "@repo/cf";

export function CheckDomainStatus({
  domainsList,
  rootDomain,
}: {
  domainsList: DomainDataTYPE[];
  rootDomain: string;
}): "active" | "inactive" {
    const matchingDomain = domainsList.find(
      (domainData) => {
        return domainData.name === rootDomain;
      }
    );

    return matchingDomain ? "active" : "inactive";
}
