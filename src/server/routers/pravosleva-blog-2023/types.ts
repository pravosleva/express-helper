import { Request as IRequest } from 'express'
import { GoogleAuth } from 'google-auth-library'
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth'
import { FamilyTreePhotoGoogleSheetCache } from '~/utils/google-sheets-tools/FamilyTreePhotoGoogleSheetCache';

export enum EInsertDataOption {
  INSERT_ROWS = 'INSERT_ROWS', // Будет дописывать в первый свободный "пробел" в таблице и добавлять пустую строку под ней
  OVERWRITE = 'OVERWRITE', // Будет заполнять свободные строки (если их удалить)
}

export type TWithBlogRequest = IRequest & {
  pravoslevaBlog2023: {
    googleSheetsAuth: GoogleAuth<JSONClient>;
    // spreadsheetId: string;
    report?: {
      rowValues?: any[];
      resultId?: number;
      ts?: number;
    };
    partnerSettingsAnalysis?: {
      ok: boolean;
      diffs?: {
        [key: string]: any;
      };
      details?: {
        [key: string]: any;
      };
      expected?: {
        [key: string]: any;
      };
      message?: string;
    }
  };
  // - NOTE: GoogleSheets 3/3 FamilyTree page
  familyTreeGoogleSheetCache: FamilyTreePhotoGoogleSheetCache;
  // -
}

export enum ENamespaces {
  BLOG_FEEDBACK = 'blog/feedback'
}
