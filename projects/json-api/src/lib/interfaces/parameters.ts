export interface Parameters {
  langs?: string[];
  include?: string[];
  fields?: {[name: string]: string[]};
  sort?: string[];
  page?: {[name: string]: number};
  filter?: {[name: string]: string[]};
}
