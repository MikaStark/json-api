import * as fastDeepEqual from 'fast-deep-equal';
import { JsonApiResource } from '../classes';
import { resourcesMatch } from './resources-match';

const equal = fastDeepEqual;

export interface RessourceDifferences<R extends JsonApiResource = JsonApiResource> {
  mutation: 'UPDATED' | 'CREATED';
  node: R;
  previousValues: R;
  updatedFields: string[];
  updatedValues: Partial<R>;
}

export function resourceDifferences<R extends JsonApiResource>(
  resource: R,
  data: Partial<R>,
): RessourceDifferences<R> {
  const updatedFields = Object.keys(data).filter((property) => {
    const isNotSameValue = !equal(resource[property], data[property]);
    const isNotSameResource =
      resource[property] instanceof JsonApiResource &&
      !resourcesMatch(resource[property], data[property]);
    const isNotSameList =
      resource[property] &&
      data[property] &&
      resource[property] instanceof Array &&
      data[property] instanceof Array &&
      (resource[property].length !== data[property].length ||
        !resource[property].every((value: any, index: number) => {
          const isSameItemValue = equal(value, data[property][index]);
          const isSameItemResource =
            value instanceof JsonApiResource && resourcesMatch(value, data[property][index]);
          return isSameItemValue || isSameItemResource;
        }));
    return isNotSameValue || isNotSameResource || isNotSameList;
  });
  const updatedValues = updatedFields.reduce(
    (previous, field) => ({ ...previous, [field]: data[field] }),
    {},
  );

  return {
    mutation: resource.id ? 'UPDATED' : 'CREATED',
    node: Object.assign({ ...resource }, data),
    previousValues: { ...resource },
    updatedFields,
    updatedValues,
  };
}
