import type { CsvAddressType, CsvRowDataType, JsonLdDataType, PromiseResultType } from "../types/DataType.js";
import fs from "fs-extra";
import { LogBuilder } from "@repo/log-helper";

export async function SeoComponentHandler({
  csvRowData,
  destPath,
  srcPath,
}: {
  csvRowData: CsvRowDataType;
  destPath: string;
  srcPath: string;
}): Promise<PromiseResultType> {
  // get generated ld data
  //   const ldSchemaData = generateJsonLd(csvRowData);
  const {
    domain,
    name,
    address,
    phone,
    email,
    meta_title,
    meta_description,
    logo,
    hero_image,
    gallery_1,
    gallery_2,
  } = csvRowData;


  // parse address
  const { street, city, country, state } = JSON.parse(address) as CsvAddressType;


  const LdSchemaData = `
    <script type="application/ld+json">
    {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://${domain}/#localbusiness",
    "name": "${name}",
    "description": "${meta_description}",
    "slogan": "${meta_title}",
    "url": "https://${domain}",
    "logo": "https://${domain}/${logo}",
    "image": ["https://${domain}/${hero_image}", "https://${domain}/${gallery_1}", "https://${domain}/${gallery_2}"],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "${street}",
      "addressLocality": "${city}",
      "addressRegion": "${state}",
      "addressCountry": "${country}"
    },
    "telephone": "${phone.startsWith("+1") ? phone : `+1-${phone}`}",
    "email": "${email}"
    }
    </script>
  `;

  try {
    // read the source file 
    const fileContent = await fs.readFile(srcPath, "utf-8");

    // replace fileContent with ldSchemaData 
    const newSeoComponent =  fileContent.replace(`{"{{ ldSchemaData }}"}`, LdSchemaData);

    // Replace default title and description if present
    const titleDescRegex = /const title: string = "";\s*const description: string = "";/g;
    const replacement = `const title: string = "${csvRowData.meta_title}";
  const description: string = "${csvRowData.meta_description}";`;
    const updatedSeoComponent = newSeoComponent.replace(titleDescRegex, replacement);

    await fs.writeFile(destPath, updatedSeoComponent, 'utf-8');
    return {
      success: true,
      message: `SEO component processed and written to ${destPath}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error processing SEO component: ${error?.message || error}`,
    };
  }

}


