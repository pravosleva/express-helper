importScripts('./utils/getCurrentPercentage.js');
importScripts('./utils/getSumLastMonths.js');

var window = self;

self.onmessage = ($event) => {
  if (!$event) return;

  const t0 = performance.now()
  const { data } = $event
  let result;

  switch (true) {
    case !!data && data.action === 'getCurrentPercentage':
      const currentPercentage = getCurrentPercentage({
        startDateTs: data.startDateTs,
        targetDateTs: data.targetDateTs,
      })

      result = {
        currentPercentage,
        actionCode: 'getCurrentPercentage',
      };
    break;
    case !!data && data.action === 'getSumLastMonths':
      const currDate = new Date();
      const sum = {};
      [1, 3, 6].forEach(m => {
        sum[`month${m}`] = getSumLastMonths({
          months: m,
          currDate,
          tasklist: data.tasklist
        });
      });

      result = {
        sum,
        actionCode: 'getSumLastMonths',
      }

      break;
    default: break;
  }

  const t02 = performance.now(); // new Date().getTime();

  result.performance = t02 - t0;
  self.postMessage(result); 
};
