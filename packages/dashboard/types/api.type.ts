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