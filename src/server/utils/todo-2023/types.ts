enum ESubjobStatus {
  IN_PROGRESS = "inProgress",
  IS_DONE = "isDone",
}
type TSubJob = {
  id: string;
  status: ESubjobStatus;
  name: string;
  description?: string;
  
  tsCreate: number;
  tsUpdate: number;
}
enum EJobStatus {
  IN_PROGRESS = "inProgress",
  IS_DONE = "isDone",
  IS_NOT_AVAILABLE = "isNotAvailable",
}
export interface IJob {
  id: string;
  status: EJobStatus;
  name: string;
  description?: string;
  subjobs: TSubJob[];

  tsCreate: number;
  tsUpdate: number;
}
