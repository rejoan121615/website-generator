import type { CsvRowDataType, JsonLdDataType } from "../types/DataType.js";
import fs from "fs-extra";

export async function jsonLdBuilder({
  csvRowData,
  destPath,
  srcPath,
}: {
  csvRowData: CsvRowDataType;
  destPath: string;
  srcPath: string;
}): Promise<void> {
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

  const [street, city, state, country] = address
    .split(",")
    .map((part) => part.trim());

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

    console.log('Writing new SEO component to:', destPath);

    await fs.writeFile(destPath, newSeoComponent, 'utf-8');
  } catch (error) {

  }

  //   if (!ldSchemaData) {
  //     console.log("Failed to generate JSON-LD schema data.");
  //     process.exit(1);
  //   } else {
  //     console.log(ldSchemaData);
  //   }
}

function generateJsonLd(
  csvRowData: CsvRowDataType
): JsonLdDataType | undefined {
  if (!csvRowData) {
    console.log("CSV row data not found, it's required to build JSON-LD");
    process.exit(1);
    return;
  }

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

  const [street, city, state, country] = address
    .split(",")
    .map((part) => part.trim());

  //   generate schema and return
  const generatedLdSchema: JsonLdDataType = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://austindetailing.com/#localbusiness",
    name: name,
    description: meta_description,
    slogan: meta_title,
    url: "https://austindetailing.com",
    logo: logo,
    image: [hero_image, gallery_1, gallery_2],
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: city,
      addressRegion: state,
      addressCountry: country,
    },
    telephone: phone.startsWith("+1") ? phone : `+1-${phone}`,
    email: email,
  };

  return generatedLdSchema;
}
