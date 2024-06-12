export namespace NEvent {
  // export enum ServerIncoming {
  //   SP_MX_EV = 'sp-mx:offline-tradein:c:event',
  // }

  type TPerfInfoItem = {
    name: string;
    descr: string;
    p: number;
    ts: number;
    data?: {
      __eType: string;
      input: {
        room: string;
        appVersion: string;
        metrixEventType: string;
        stateValue: string;
      };
    };
  }
  export enum EReportType {
    DEFAULT = 'default',
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success',
  }
  export type TReport = {
    room: string;
    appVersion: string;
    metrixEventType: string;
    reportType: EReportType;
    stateValue: string;
    imei: string;
    // imei: string;
    stepDetails?: {
      [key: string]: any;
    };
    specialClientKey?: string;
    ip?: string;
    userAgent?: string;

    _wService?: {
      _perfInfo: {
        tsList: TPerfInfoItem[];
      };
    };
  }
}
