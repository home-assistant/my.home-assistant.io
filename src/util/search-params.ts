export const extractSearchParamsObject = (): Record<string, string> => {
  const query = {};
  const searchParams = new URLSearchParams(location.search);
  for (const [key, value] of searchParams.entries()) {
    query[key] = value;
  }
  return query;
};

export const createSearchParam = (params: Record<string, string>): string => {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    urlParams.append(key, value);
  });
  return urlParams.toString();
};
