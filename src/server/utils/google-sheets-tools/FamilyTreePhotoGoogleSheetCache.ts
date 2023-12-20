import { GoogleSheetCache } from './GoogleSheetCache'
import { TGoogleSheetCacheProps } from './types'

type TMainGalleryItem = {
  url: string;
  descr?: string;
}
type TPersonData = {
  ok: boolean;
  message?: string;
  id: string;
  mainGallery: TMainGalleryItem[];
}

enum ROW_INDEX {
  PERSON_ID = 0,
  MAIN_GALLERY_ITEM_PHOTO_URL = 1,
  MAIN_GALLERY_ITEM_PHOTO_DESCR = 2,
}

export class FamilyTreePhotoGoogleSheetCache extends GoogleSheetCache {
  constructor(ps: TGoogleSheetCacheProps) {
    super(ps)
  }
  public _getPersonData({ sheetData: rows, personId }: {
    sheetData: [string, string, string];
    personId: string;
  }): TPersonData {
    const res: TPersonData = {
      id: personId,
      mainGallery: [],
      // NOTE: etc.
      ok: false,
    }
    let _isPersonDetected = false
    let _isTargetPersonBlockIteration= false
  
    for (const row of rows) {
      if (!!row[0]) {
        if (_isPersonDetected && _isTargetPersonBlockIteration) break
  
        if (row[ROW_INDEX.PERSON_ID] === personId) {
          _isPersonDetected = true
          _isTargetPersonBlockIteration = true

          // NOTE: First row for the person
          res.mainGallery.push({
            url: row[ROW_INDEX.MAIN_GALLERY_ITEM_PHOTO_URL],
            descr: row[ROW_INDEX.MAIN_GALLERY_ITEM_PHOTO_DESCR],
          })
          res.ok = true // NOTE: Как минимум, одно фото уже есть
        } else {
          _isTargetPersonBlockIteration = false
        }
      }
      else if (!row[0] && _isTargetPersonBlockIteration) {

        // NOTE: Next row for the person
        if (!!row[1]) {
          res.mainGallery.push({
            url: row[ROW_INDEX.MAIN_GALLERY_ITEM_PHOTO_URL],
            descr: row[ROW_INDEX.MAIN_GALLERY_ITEM_PHOTO_DESCR],
          })
        }
      }
    }
    if (!_isPersonDetected) {
      res.message = 'Нет данных'
    }
    return res
  }

  public async getPersonData({ personId, pageName, columns }: {
    // sheetData: any;
    personId: string;
    columns: [string, string];
    pageName: string;
  }): Promise<TPersonData & { _service?: { details: string; } }> {
    const gDataFromCache = this.getGDataFromCache({ tsLimit: 30 * 1000 })

    if (gDataFromCache.ok && !!gDataFromCache.gResValues)
      return { ...this._getPersonData({ sheetData: gDataFromCache.gResValues, personId }), _service: gDataFromCache._service }
    else {
      type TGRes = {
        data?: {
          values: [string, string, string];
        };
      }
      let gRes: TGRes
      try {
        gRes = await this.getValues<TGRes>({ pageName, columns })
      } catch (err) {
        return {
          id: personId,
          mainGallery: [],
          ok: false,
          message: err?.message || 'SERVER ERR#0 Не удалось получить gRes (no err.message, check FamilyTreePhotoGoogleSheetCache.getValues method)',
          _service: gDataFromCache._service,
        }
      }
      if (!!gRes?.data?.values) {
        const _res = this._getPersonData({ sheetData: gRes.data.values, personId })
  
        // NOTE: Put new data to cache
        if (_res.ok) {
          this.cache.gResValues = gRes.data.values
          this.cache.ts = new Date().getTime()
        }
  
        return {
          ..._res,
          _service: gDataFromCache._service,
        }
      } else return {
        id: personId,
        mainGallery: [],
        ok: false,
        message: 'No gRes?.data?.values (no error)',
        _service: gDataFromCache._service,
      }
    }
  }
}
