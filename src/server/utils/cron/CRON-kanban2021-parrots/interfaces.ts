import { EMessageStatus, TMessage } from '~/utils/socket/state'

export type TCfg = {
  id: number;
  _descr: string;
  isEnabled: boolean;
  cronSetting: string;
  targetRooms: string[];
  targetHashtags: string[];
  ignoredHashTags?: string[];
  targetStatuses: EMessageStatus[];
  validateBeforeRequest: ({}: {
    msgs: TMessage[];
  }) => boolean;
  _specialMsgValidator?: (msg: TMessage) => boolean;
  _useSprintOnly?: boolean;
  req: {
    url: string;
    body: {
      chat_id: number;
      message_thread_id?: number;
      eventCode: string;
      // resultId: number;
      about: ({}: {
        msgs: TMessage[];
        targetHashtags: string[];
        targetStatuses: EMessageStatus[];
        targetRooms: string[];
        _descr: string;
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
