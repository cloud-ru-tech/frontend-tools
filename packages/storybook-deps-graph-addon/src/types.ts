export type LinksType = Record<string, string[]>;

export type DependenciesGraphType = {
  reversedLinks: LinksType;
  links: LinksType;
};

export type NodeElementType = {
  data: {
    id: string;
    label: string;
  };
};

export type LinkElementType = {
  data: {
    source: string;
    target: string;
  };
};

export enum GraphType {
  Children = 'children',
  Parent = 'parent',
}

export type GraphElementType = NodeElementType | LinkElementType;
