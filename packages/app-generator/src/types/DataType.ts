

export interface JsonLdAddressType {
	"@type": "PostalAddress";
	streetAddress: string;
	addressLocality: string;
	addressRegion: string;
	addressCountry: string;
}

export interface JsonLdDataType {
	"@context": string;
	"@type": string;
	"@id": string;
	name: string;
	description: string;
	slogan: string;
	url: string;
	logo: string;
	image: string[];
	address: JsonLdAddressType;
	telephone: string;
	email: string;
}

export type CsvRowDataType = {
	domain: string;
	name: string;
	address: string;
	phone: string;
	email: string;
	meta_title: string;
	meta_description: string;
	logo: string;
	hero_image: string;
	gallery_1: string;
	gallery_2: string;
};


