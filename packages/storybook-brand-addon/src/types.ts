export type BrandConfig = {
  dark: string;
  light: string;
};

export type DefaultBrandMap = {
  [brand: string]: BrandConfig;
};
export type DefaultBrandMapColors = {
  [brand: string]: string;
};

export type StorageKeys = {
  title: string;
  color: string;
  fileName: string;
  content: string;
};

export type CustomBrandConfig = {
  key: string;
  title: string;
  color: string;
  fileName?: string;
  content: string;
  config: BrandConfig;
};

export type BrandInfo = {
  title: string;
  color: string;
  fileName: string;
  content: string;
};
