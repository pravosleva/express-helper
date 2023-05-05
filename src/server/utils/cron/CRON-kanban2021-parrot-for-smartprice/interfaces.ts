import { EMessageStatus, TMessage } from '~/utils/socket/state'

export type TCfg = {
  id: number;
  _descr: string;
  isEnabled: boolean;
  cronSetting: string;
  targetRooms: string[];
  targetHashtags: string[];
  targetStatuses: EMessageStatus[];
  validateBeforeRequest: ({}: {
    msgs: TMessage[];
  }) => boolean;
  req: {
    url: string;
    body: {
      chat_id: number;
      eventCode: string;
      // resultId: number;
      about: ({}: {
        msgs: TMessage[];
        targetHashtags: string[];
        targetStatuses: EMessageStatus[];
        targetRooms: string[];
      }) => string;
      targetMD: ({}: {
        msgs: TMessage[];
        targetHashtags: string[];
        targetStatuses: EMessageStatus[];
        targetRooms: string[];
      }) => string;
    };
  };
}[]
