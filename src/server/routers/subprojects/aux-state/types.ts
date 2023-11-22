import { Request as IRequest } from 'express'
import { TAuditListAuxStateInstance, TCustomLoopersSet, ENamespace } from './utils'

export type TModifiedRequest = IRequest & {
  body: {
    namespace: ENamespace;
  };
  subprojects: {
    projectRootDir: string;
    auxStateFileNames: string[];
    auxState: {
      auditList: TAuditListAuxStateInstance;
    };
    loopers: TCustomLoopersSet;
  };
}

export namespace NAuditList {
  export enum ESubjobStatus {
    IN_PROGRESS = "inProgress",
    IS_DONE = "isDone",
  }
  export type TSubJob = {
    id: string;
    status: ESubjobStatus;
    name: string;
    description?: string;
    
    tsCreate: number;
    tsUpdate: number;
  }
  export enum EJobStatus {
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
  export type TAudit = {
    id: string;
    name: string;
    description?: string;
    jobs: IJob[];
    comment?: string;
  
    tsCreate: number;
    tsUpdate: number;
  } 
}
