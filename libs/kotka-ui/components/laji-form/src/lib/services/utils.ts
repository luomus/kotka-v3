export const getRequiredFields = (schema: any, path = '/'): string[] => {
  let results: string[] = [];
  if (schema.type === 'object' && schema.required) {
    results = results.concat(schema.required.map((field: string[]) => (path + field)));
  }
  if (schema.type === 'object' && schema.properties) {
    Object.keys(schema.properties).forEach((prop: string) => {
      results = results.concat(getRequiredFields(schema.properties[prop], path + prop + '/'));
    });
  } else if (schema.type === 'array' && schema.items) {
    results = results.concat(getRequiredFields(schema.items, path));
  }
  return results;
};
