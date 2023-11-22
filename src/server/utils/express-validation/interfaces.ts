export type TValidationResult = {
  ok: boolean;
  reason?: string;
  _reponseDetails?: {
    status: number;
    _addProps?: {
      [key: string]: any;
    }
  }
}

export type THelp = {
  params: {
    body?: {
      [key: string]: {
        type: string;
        descr: string;
        required: boolean;
        validate: (val: any) => TValidationResult;
      }
    }
    query?: {
      [key: string]: {
        type: string;
        descr: string;
        required: boolean;
        validate: (val: any) => TValidationResult;
      }
    }
  }
  res?: {
    [key: string]: any;
  }
}
