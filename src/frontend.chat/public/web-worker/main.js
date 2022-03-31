importScripts('./utils/getCurrentPercentage.js');
importScripts('./utils/getSumLastMonths.js');
importScripts('./utils/DateDiff.js');

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
      const nowDate = new Date()
      const targetDate = new Date(data.targetDateTs + (data.targetDateTs - data.startDateTs))
      const allResults = DateDiff.all(nowDate, targetDate)

      result = {
        info: {
          currentPercentage,
          diff: allResults
        },
        actionCode: 'getCurrentPercentage',
        taskTs: data.taskTs
      };
    break;
    case !!data && data.action === 'perf.transferToLocalRef':
      result = {
        taskTs: data.task.ts,
        fullData: data.task,
        actionCode: 'perf.transferToLocalRef',
      }
      break;
    case !!data && data.action === 'getSumLastMonths':
      const currDate = new Date();
      const sum = {};
      [
        // 1,
        // 2, 3, 6,
        0.5
      ].forEach(m => {
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
