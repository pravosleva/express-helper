import { Request as IRequest } from 'express'
import { GoogleAuth } from 'google-auth-library'
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth'

export enum EInsertDataOption {
  INSERT_ROWS = 'INSERT_ROWS', // Будет дописывать в первый свободный "пробел" в таблице и добавлять пустую строку под ней
  OVERWRITE = 'OVERWRITE', // Будет заполнять свободные строки (если их удалить)
}

export type TSPRequest = IRequest & {
  smartprice: {
    googleSheetsAuth: GoogleAuth<JSONClient>;
    spreadsheetId: string;
    report?: {
      rowValues?: any[];
      resultId?: number;
    }
  };
}

export enum ENamespaces {
  OFFLINE_TRADEIN_UPLOAD_WIZARD = 'offline-tradein/upload-wizard'
}
