import { google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth'
import { TGDataFromCache, TGoogleSheetCacheProps } from './types'
import { getTimeAgo } from '../getTimeAgo';
import { getTimeDiff } from '~/utils/getTimeDiff'

export class GoogleSheetCache {
  private _cache: {
    gResValues: any;
    ts: number;
  };
  private auth: GoogleAuth<JSONClient>;
  private client: any;
  private googleSheets: any;
  private spreadsheetId: string;
  private rowsLimit: number;
  private rowsOffset: number;

  constructor({ auth, spreadsheetId, rowsLimit, rowsOffset }: TGoogleSheetCacheProps) {
    this._cache = { gResValues: null, ts: 0 }
    const maxLimit = 1000
    const modifiedLimit = rowsLimit <= maxLimit ? rowsLimit : maxLimit
    this.rowsLimit = modifiedLimit
    this.rowsOffset = rowsOffset
    this.auth = auth
    this.client = (async() => await auth.getClient())()
    this.googleSheets = google.sheets({ version: 'v4', auth: this.client })
    this.spreadsheetId = spreadsheetId
  }

  public isCacheActual({ limit, ts }: {
    limit: number;
    ts: number;
  }): boolean {
    const nowTs = new Date().getTime()
    return nowTs - ts <= limit
  }
  public getGDataFromCache({ tsLimit }: {
    tsLimit: number;
  }): TGDataFromCache {
    let res: TGDataFromCache = {
      ok: false,
      gResValues: null,
      _service: {
        details: 'ok by default'
      },
    }
    const isCacheActual = !!this.cache.gResValues && this.isCacheActual({ limit: tsLimit, ts: this.cache.ts, })
    if (isCacheActual) {
      res.ok = true
      res.gResValues = this.cache.gResValues
      res._service.details = `Cache will be relevant for ${getTimeDiff({ startDate: new Date(), finishDate: new Date(this.cache.ts + tsLimit) }).details})`
    } else res._service.details = 'Cache is not relevant'
    return res
  }

  public async getValues<T>({ pageName, columns }: {
    pageName: string;
    columns: [string, string];
  }): Promise<T> {
    let gRes: T
    try {
      gRes = await this.googleSheets.spreadsheets.values.get({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        range: `${pageName}!${columns[0]}${1 + this.rowsOffset}:${columns[1]}${this.rowsOffset + this.rowsLimit}`,
      })
    } catch (err) {
      throw new Error(`Не удалось получить данные на стороне сервера: ${err.message || 'No err.message'}`)
    }
    return gRes
  }
  get cache() {
    return this._cache
  }
}
