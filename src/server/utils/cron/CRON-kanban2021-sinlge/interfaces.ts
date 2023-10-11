export type TCfg = {
  id: number;
  _descr: string;
  isEnabled: boolean;
  cronSetting: string;
  req: {
    url: string;
    body: {
      chat_id: number;
      message_thread_id?: number;
      eventCode: string;
      // resultId: number;
      about: () => string;
      targetMD: () => string;
    };
  };
}[]
