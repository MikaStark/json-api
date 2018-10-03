import { Links } from './links';
import { Meta } from './meta';

export interface Error {
  id?: string;
  links?: Links;
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
  meta?: Meta;
}
