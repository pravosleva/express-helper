export const getZero = (n: number): string => n < 10 ? `0${n}` : `${n}`

const difference2Parts = (milliseconds) => {
  const secs = Math.floor(Math.abs(milliseconds) / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const millisecs = Math.floor(Math.abs(milliseconds)) % 1000;
  const multiple = (term, n) => n !== 1 ? `${n} ${term}s` : `1 ${term}`;

  return {
    days: days,
    hours: hours % 24,
    hoursTotal: hours,
    minutesTotal: mins,
    minutes: mins % 60,
    seconds: secs % 60,
    secondsTotal: secs,
    milliSeconds: millisecs,
    get diffStr() {
      return `${multiple(`day`, this.days)}, ${
        multiple(`hour`, this.hours)}, ${
        multiple(`minute`, this.minutes)} and ${
        multiple(`second`, this.seconds)}`;
    },
    get diffStrMs() {
      return `${this.diffStr.replace(` and`, `, `)} and ${
        multiple(`ms`, this.milliSeconds)}`;
    },
    get diffStrCustomDetailed() {
      return `${!!this.days ? `${this.days}d ` : ''}${
        !!this.hours ? `${getZero(this.hours)}:` : ''}${getZero(this.minutes)}:${
          getZero(this.seconds)}.${this.milliSeconds}`;
    },
    get diffStrCustom() {
      return `${!!this.days ? `${this.days}d ` : ''}${
        !!this.hours ? `${getZero(this.hours)}:` : ''}${getZero(this.minutes)}:${
          getZero(this.seconds)}`;
    },
  };
}

type TResult = {
  d: number;
  h: number;
  min: number;
  sec: number;
  ms: number;
  message: string;
}

export const getTimeDiff = ({
  startDate,
  finishDate,
}: {
  startDate: Date;
  finishDate: Date;
}): TResult => {
  const startTs = startDate.getTime()
  const finishTs = finishDate.getTime()
  const diffMs = (finishTs - startTs)
  const diffData = difference2Parts(diffMs)

  return {
    d: diffData.days,
    h: diffData.hours,
    min: diffData.minutes,
    sec: diffData.seconds,
    ms: diffData.milliSeconds,
    message: diffData.diffStrCustom,
  }
}
