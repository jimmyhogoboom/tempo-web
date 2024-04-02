export const empty = (val?: unknown) => val === undefined || `${val}`.length < 1;
export const isNumber = (val?: unknown) =>
  val && (typeof val === 'number' || (!isNaN(val as number) && !isNaN(parseFloat(val as string))));
