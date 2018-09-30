export interface Parameters {
  include?: string[];
  fields?: {[name: string]: string[]};
  sort?: string[];
  page?: {[name: string]: number};
  filter?: string[];
}
