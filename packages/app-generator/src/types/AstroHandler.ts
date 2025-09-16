
export type ComponentOptionsTYPE = {
    name: string;
    props: Record<string, string>;
}

export type PageOptionsTYPE = {
    imports: string[];
    components: ComponentOptionsTYPE[];
}