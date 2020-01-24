export interface JsonApiAttributeMetadata {
  propertyName: string;
  key: string;
  convert: (value: any) => any;
  revert: (value: any) => any;
}
