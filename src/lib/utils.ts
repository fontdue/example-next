export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

export function pluralize(singular: string, plural: string, count: number): string {
  return count === 1 ? singular : plural;
}

export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
}
