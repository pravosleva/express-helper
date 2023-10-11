import { TRoomTask } from '~/utils/socket/state'

export type TEnhancedTask = (TRoomTask & { room: string })

export type TCfg = {
  id: number;
  _descr: string;
  isEnabled: boolean;
  cronSetting: string;
  targetRooms: string[];
  targetHashtags: string[];
  ignoredHashTags?: string[];
  validateBeforeRequest: ({}: {
    tasks: TEnhancedTask[];
  }) => boolean;
  _specialMsgValidator?: (task: TRoomTask) => boolean;
  req: {
    url: string;
    body: {
      chat_id: number;
      message_thread_id?: number;
      eventCode: string;
      // resultId: number;
      about: ({}: {
        tasks: TEnhancedTask[];
        targetHashtags: string[];
        targetRooms: string[];
      }) => string;
      targetMD: ({}: {
        tasks: TEnhancedTask[];
        targetHashtags: string[];
        targetRooms: string[];
      }) => string;
    };
  };
}[]
