export const getConfigurableUrl = ({
  relativePath, baseUrl, query
}: {
  baseUrl: string;
  relativePath: string;
  query?: {
    [key: string]: string | undefined;
  };
}): string => [
  baseUrl,
  relativePath,
  !!query && Object.keys(query).length > 0
    ? [
      '?',
      Object.keys(query).reduce((acc: string[], key) => {
        if (query[key]) {
          acc.push(`${key}=${query[key]}`);
        }
        return acc;
      }, []).join('&')
    ].join('')
    : '',
].join('');
