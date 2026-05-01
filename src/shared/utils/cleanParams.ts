export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | QueryParamValue[];

export function cleanParams<T extends object>(params: T): Partial<T> {
  const nextEntries = Object.entries(params).flatMap(([key, value]) => {
    if (isEmptyParamValue(value)) {
      return [];
    }

    if (typeof value === 'string') {
      return [[key, value.trim()]];
    }

    if (Array.isArray(value)) {
      const cleanedArray = value.filter((entry) => !isEmptyParamValue(entry));
      return cleanedArray.length > 0 ? [[key, cleanedArray]] : [];
    }

    return [[key, value]];
  });

  return Object.fromEntries(nextEntries) as Partial<T>;
}

function isEmptyParamValue(value: unknown): boolean {
  if (value == null) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (typeof value === 'number') {
    return Number.isNaN(value);
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}
