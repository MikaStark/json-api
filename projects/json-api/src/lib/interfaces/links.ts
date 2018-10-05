import { Link } from './link';

export interface Links {
  self?: string|Link;
  related?: string|Link;
  first?: string|Link;
  last?: string|Link;
  prev?: string|Link;
  next?: string|Link;
  profile?: string[]|Link[];
}
