import { parse } from "tldts";


export function GetProjectName(domainName: string): {
  projectName: string;
  hasSubdomain: boolean;
  rootDomain: string;
  subDomain: string ;
} {
  const { domain, domainWithoutSuffix, subdomain } = parse(domainName);
  const cfProjectName = `${ subdomain ? `${subdomain.replaceAll('.', '-')}---` : ''}${domainWithoutSuffix}`;

  return {
    projectName: cfProjectName,
    hasSubdomain: subdomain === "" || subdomain === null ? false : true,
    rootDomain: domain!,
    subDomain: subdomain || "",
  };
}