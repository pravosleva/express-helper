export const getIsExistsAndNumber = (val: unknown) => typeof val !== 'undefined' && !Number.isNaN(Number(val))
