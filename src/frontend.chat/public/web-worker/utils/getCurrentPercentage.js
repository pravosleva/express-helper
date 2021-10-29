const linear = ({
  x,
  x1, y1,
  x2, y2,
}) => {
  if (x1 === x2) return ((y1 + y2) / 2);
  return ((((x - x1) * (y2 - y1)) / (x2 - x1)) + y1);
};

/* INPUT:
{
  data: {
    action: 'getCurrentPercentage'
    startDateTs: number
    targetDateTs: number
  }
}
*/

var getCurrentPercentage = ({ startDateTs: t0, targetDateTs: t100 }) => {
  const nowDate = Date.now();
  const xDate = t100 + (t100 - t0);

  return linear({
    x1: t0,
    y1: 0,
    x2: xDate,
    y2: 100,
    x: nowDate,
  });
};
