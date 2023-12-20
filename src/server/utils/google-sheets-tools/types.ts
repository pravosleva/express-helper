import { GoogleAuth } from 'google-auth-library'
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth'

export type TGDataFromCache = {
  ok: boolean;
  gResValues: any;
  _service: {
    details: string;
  };
}
export type TGoogleSheetCacheProps = {
  auth: GoogleAuth<JSONClient>;
  spreadsheetId: string;
  rowsLimit: number;
  rowsOffset: number;
}
