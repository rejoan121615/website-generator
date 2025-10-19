import { parse } from "tldts";


export function GetProjectName(domainName: string): {
  projectName: string;
  hasSubdomain: boolean;
  rootDomain: string;
  subDomain: string ;
} {
  const { domain, domainWithoutSuffix, subdomain } = parse(domainName);
  const parseResponse = parse(domainName);

//   parsed domain object : {
    //   domain: 'plumbersbow.co.uk',
    //   domainWithoutSuffix: 'plumbersbow',
    //   hostname: 'phoenix.testing.danger.plumbersbow.co.uk',
    //   isIcann: true,
    //   isIp: false,
    //   isPrivate: false,
    //   publicSuffix: 'co.uk',
    //   subdomain: 'phoenix.testing.danger'
    // }

  const cfProjectName = `${ subdomain ? `${subdomain.replaceAll('.', '-')}---` : ''}${domainWithoutSuffix}`;

  return {
    projectName: cfProjectName,
    hasSubdomain: subdomain === "" || subdomain === null ? false : true,
    rootDomain: domain!,
    subDomain: subdomain || "",
  };
}