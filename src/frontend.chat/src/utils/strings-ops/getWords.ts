export const getWords = (search: string): string[] => search?.toLowerCase().split(' ').filter((str) => !!str)
