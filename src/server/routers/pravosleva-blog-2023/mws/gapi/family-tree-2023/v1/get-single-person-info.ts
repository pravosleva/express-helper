import { TWithBlogRequest } from '~/routers/pravosleva-blog-2023/types'
import { THelp } from '~/utils/express-validation'
import { google } from 'googleapis'

// NOTE: page 1mMA2t1i5IcOyyfMQlk2nV4GL0hYJ8Kje7Ot59qHBvsY

export const rules: THelp = {
  params: {
    body: {
      limit: {
        type: 'number',
        descr: 'Google Sheets rows limit (optional)',
        required: false,
        validate: (val: any) => ({
          ok: typeof val === 'number' && val > 0,
          reason: 'Should be number (more than 0)',
        }),
      },
      personId: {
        type: 'string',
        descr: 'Person id',
        required: true,
        validate: (val: any) => ({
          ok: typeof val === 'string' && !!val,
          reason: 'Should be not empty string',
        }),
      },
    },
  },
}

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
type TResponse = {
  ok: boolean;
  message?: string;
  data: {
    id: string;
    customService?: {
      ok: boolean;
      data: any;
    };
    googleSheets?: {
      ok: boolean;
      data: TPersonData;
    };
  };
}

enum ROW_INDEX {
  PERSON_ID = 0,
  MAIN_GALLERY_ITEM_PHOTO_URL = 1,
  MAIN_GALLERY_ITEM_PHOTO_DESCR = 2,
}

// TODO: const cache = {}

const persons = {
  'den-vladimir-pol.[13-04-1986]': {
    id: 'den-vladimir-pol.[13-04-1986]',
    baseInfo: {
      firstName: 'Denis',
      middleName: 'Vladimirovich',
      lastName: 'Poltoratsky',
    },
  },
  'lidya-alex-pol.[17.10.1990]': {
    id: 'lidya-alex-pol.[17.10.1990]',
    baseInfo: {
      firstName: 'Lidia',
      middleName: 'Aleksandrovna',
      lastName: 'Poltoratskaya',
    },
  },
  'viktor-step-lyalin.[29-07-1952]': {
    id: 'viktor-step-lyalin.[29-07-1952]',
    baseInfo: {
      firstName: 'Viktor',
      middleName: 'Stepanovich',
      lastName: 'Lyalin',
    },
  },
  'elena-vladimir-der.[29-03-1964]': {
    id: 'elena-vladimir-der.[29-03-1964]',
    baseInfo: {
      firstName: 'Elena',
      middleName: 'Vladimirovna',
      lastName: 'Dereventsova',
    },
  },
  'vladimir-_-dereventsov.__-__-19__': {
    id: 'vladimir-_-dereventsov.__-__-19__',
    baseInfo: {
      firstName: 'Vladimir',
      middleName: '_',
      lastName: 'Dereventsov',
    },
  },
  'ulia-vas-garbuzova.[24-07-1941][05-12-2023]': {
    id: 'ulia-vas-garbuzova.[24-07-1941][05-12-2023]',
    baseInfo: {
      firstName: 'Ulia',
      middleName: 'Vasilievna',
      lastName: 'Garbuzova',
    },
  },
  'sveta-valentin-garbuzova.[__-__-19__]': {
    id: 'sveta-valentin-garbuzova.[__-__-19__]',
    baseInfo: {
      firstName: 'Svetlana',
      middleName: 'Valentinovna',
      lastName: 'Garbuzova',
    },
  },
  'valentin-alexey-garbuzov.[29-04-1940][10-04-2013]': {
    id: 'valentin-alexey-garbuzov.[29-04-1940][10-04-2013]',
    baseInfo: {
      firstName: 'Valentin',
      middleName: 'Alexeevich',
      lastName: 'Garbuzov',
    },
  },
  'yana-yan-garbuzova.[07-03-199_]': {
    id: 'yana-yan-garbuzova.[07-03-199_]',
    baseInfo: {
      firstName: 'Yana',
      middleName: 'Yanovna',
      lastName: 'Grishina',
    },
  },
  'yan-albert-grishin.[__-__-19__][__-__-19__]': {
    id: 'yan-albert-grishin.[__-__-19__][__-__-19__]',
    baseInfo: {
      firstName: 'Yan',
      middleName: 'Albertovich',
      lastName: 'Grishin',
    },
  },
  'albert-yakov-grishin.[__-__-19__][__-__-19__]': {
    id: 'albert-yakov-grishin.[__-__-19__][__-__-19__]',
    baseInfo: {
      firstName: 'Albert',
      middleName: 'Yakovlevich',
      lastName: 'Grishin',
    },
  },
  'alevtina-nik-grishina.[__-__-19__][__-__-____]': {
    id: 'alevtina-nik-grishina.[__-__-19__][__-__-____]',
    baseInfo: {
      firstName: 'Alevtina',
      middleName: 'Nikolaevna',
      lastName: 'Grishina',
    },
  },
  'fedor-michail-izvekov[vladimir-m-f].[__-__-1909][__-__-____]': {
    id: 'fedor-michail-izvekov[vladimir-m-f].[__-__-1909][__-__-____]',
    baseInfo: {
      firstName: 'Izvekov',
      middleName: 'Fedor',
      lastName: 'Mikhailovich',
    },
  },
  'lubov-fedor-pol.[__-__-1936]': {
    id: 'lubov-fedor-pol.[__-__-1936]',
    baseInfo: {
      firstName: 'Lubov',
      middleName: 'Fedorovna',
      lastName: 'Poltoratskaya',
    },
  },
  'vladimir-vladimir-pol.[10-11-1961][27-12-2014]': {
    id: 'vladimir-vladimir-pol.[10-11-1961][27-12-2014]',
    baseInfo: {
      firstName: 'Vladimir',
      middleName: 'Vladimirovich',
      lastName: 'Poltoratsky',
    },
  },
  // 'vladimir-vladimir-pol.[__-__-19__]': {
  //   id: 'vladimir-vladimir-pol.[__-__-19__]',
  //   baseInfo: {
  //     firstName: 'Vladimir',
  //     middleName: 'Vladimirovich',
  //     lastName: 'Poltoratsky',
  //   },
  // },
  'nina-nik-veselova.[30-07-1955]': {
    id: 'nina-nik-veselova.[30-07-1955]',
    baseInfo: {
      firstName: 'Nina',
      middleName: 'Nikolaevna',
      lastName: 'Veselova',
    },
  },
  'alexander-ivan-ves.[04-03-1950]': {
    id: 'alexander-ivan-ves.[04-03-1950]',
    baseInfo: {
      firstName: 'Alexandr',
      middleName: 'Ivanovich',
      lastName: 'Veselov',
    },
  },
  'dmitry-alex-veselov.[12-07-1983]': {
    id: 'dmitry-alex-veselov.[12-07-1983]',
    baseInfo: {
      firstName: 'Dmitry',
      middleName: 'Alexandrovich',
      lastName: 'Veselov',
    },
  },
  'lidya-vas-malysheva.[26-12-1921]': {
    id: 'lidya-vas-malysheva.[26-12-1921]',
    baseInfo: {
      firstName: 'Lidia',
      middleName: 'Vasilievna',
      lastName: 'Malysheva',
    },
  },
  'nikolay-ivan-malyshev.[02-10-1920]': {
    id: 'nikolay-ivan-malyshev.[02-10-1920]',
    baseInfo: {
      firstName: 'Nikolay',
      middleName: 'Ivanovich',
      lastName: 'Malyshev',
    },
  },
  'alevtina-vas-krupina.[16-07-1918]': {
    id: 'alevtina-vas-krupina.[16-07-1918]',
    baseInfo: {
      firstName: 'Alevtina',
      middleName: 'Vasilievna',
      lastName: 'Krupina',
    },
  },
  'ivan-fedor-veselov.[__-12-1911]': {
    id: 'ivan-fedor-veselov.[__-12-1911]',
    baseInfo: {
      firstName: 'Ivan',
      middleName: 'Fedorovich',
      lastName: 'Veselov',
    },
  },
  'elena-nik-solovieva.[01-02-1953]': {
    id: 'elena-nik-solovieva.[01-02-1953]',
    baseInfo: {
      firstName: 'Elena',
      middleName: 'Nikolaevna',
      lastName: 'Solovieva',
    },
  },
  'nikolay-nik-malyshev.[19-11-1948]': {
    id: 'nikolay-nik-malyshev.[19-11-1948]',
    baseInfo: {
      firstName: 'Nikolay',
      middleName: 'Nikolaevich',
      lastName: 'Malishev',
    },
  },
  'sekleteya-alekseevna-kyzmina.[__-__-1___]': {
    id: 'sekleteya-alekseevna-kyzmina.[__-__-1___]',
    baseInfo: {
      firstName: 'Sekleteya',
      middleName: 'Alekseenva',
      lastName: 'Kyzmina',
    },
  },
  'vasily-ivan-kyzmin.[__-__-1___]': {
    id: 'vasily-ivan-kyzmin.[__-__-1___]',
    baseInfo: {
      firstName: 'Vasily',
      middleName: 'Ivanovich',
      lastName: 'Kyzmin',
    },
  },
  'maria-efim-malysheva.[__-__-1___]': {
    id: 'maria-efim-malysheva.[__-__-1___]',
    baseInfo: {
      firstName: 'Maria',
      middleName: 'Efimovna',
      lastName: 'Malysheva',
    },
  },
  'ivan-fedor-malyshev.[__-__-1___]': {
    id: 'ivan-fedor-malyshev.[__-__-1___]',
    baseInfo: {
      firstName: 'Ivan',
      middleName: 'Fedorovich',
      lastName: 'Malyshev',
    },
  },
  'pelageya-porfiry-krupina.[__-__-18__]': {
    id: 'pelageya-porfiry-krupina.[__-__-18__]',
    baseInfo: {
      firstName: 'Pelageya',
      middleName: 'Porfirievna',
      lastName: 'Krupina',
    },
  },
  'vas-archip-krupin.[__-__-18__]': {
    id: 'vas-archip-krupin.[__-__-18__]',
    baseInfo: {
      firstName: 'Vasily',
      middleName: 'Archipovich',
      lastName: 'Krupin',
    },
  },
  'alexandra-_-kuzmina.[17-02-1916]': {
    id: 'alexandra-_-kuzmina.[17-02-1916]',
    baseInfo: {
      firstName: 'Alexandra',
      middleName: '_',
      lastName: 'Kuzmina',
    },
  },
  'nikolay-anatoly-soloviev.[22-05-1956]': {
    id: 'nikolay-anatoly-soloviev.[22-05-1956]',
    baseInfo: {
      firstName: 'Nikolay',
      middleName: 'Anatolievich',
      lastName: 'Soloviev',
    },
  },
  'oleg-nik-soloviev.[10-04-1977]': {
    id: 'oleg-nik-soloviev.[10-04-1977]',
    baseInfo: {
      firstName: 'Oleg',
      middleName: 'Nikolaevich',
      lastName: 'Soloviev',
    },
  },
  'nikolay-ivan-dereventsov.[__-__-1909][__-__-1978]': {
    id: 'nikolay-ivan-dereventsov.[__-__-1909][__-__-1978]',
    baseInfo: {
      firstName: 'Nikolay',
      middleName: 'Ivanovich',
      lastName: 'Dereventsov',
    },
  },
  'vasily-ivan-dereventsov[elena-f-fs].[__-__-19__][__-__-1984]': {
    id: 'vasily-ivan-dereventsov[elena-f-fs].[__-__-19__][__-__-1984]',
    baseInfo: {
      firstName: 'Vasily',
      middleName: 'Ivanovich',
      lastName: 'Dereventsov',
    },
  },
  'ivan-vas-smirnov.[__-__-19__]': {
    id: 'ivan-vas-smirnov.[__-__-19__]',
    baseInfo: {
      firstName: 'Ivan',
      middleName: 'Vasilievich',
      lastName: 'Smirnov',
    },
  },
  'praskoviya-ivan-smirnova.[__-__-19__]': {
    id: 'praskoviya-ivan-smirnova.[__-__-19__]',
    baseInfo: {
      firstName: 'Praskoviya',
      middleName: 'Ivanovna',
      lastName: 'Smirnova',
    },
  },
  'nina-ivan-balykina.[14-11-1951]': {
    id: 'nina-ivan-balykina.[14-11-1951]',
    baseInfo: {
      firstName: 'Nina',
      middleName: 'Ivanovna',
      lastName: 'Balykina',
    },
  },
  'nikolay-ivan-smirnov[nina-fsc].[__-__-19__]': {
    id: 'nikolay-ivan-smirnov[nina-fsc].[__-__-19__]',
    baseInfo: {
      firstName: 'Nikolay',
      middleName: 'Ivanovich',
      lastName: 'Smirnov',
    },
  },
  'irina-kirill-dereventsova[elena-f-m].[__-__-1___]': {
    id: 'irina-kirill-dereventsova[elena-f-m].[__-__-1___]',
    baseInfo: {
      firstName: 'Irina',
      middleName: 'Kirillovna',
      lastName: 'Dereventsova',
    },
  },
  'vladimir-nik-dereventsov.[01-09-1940][__-__-____]': {
    id: 'vladimir-nik-dereventsov.[01-09-1940][__-__-____]',
    baseInfo: {
      firstName: 'Vladimir',
      middleName: 'Nikolaevich',
      lastName: 'Dereventsov',
    },
  },
  'tatyana-ignat-dereventsova.[05-10-1947]': {
    id: 'tatyana-ignat-dereventsova.[05-10-1947]',
    baseInfo: {
      firstName: 'Tatyana',
      middleName: 'Ignatievna',
      lastName: 'Dereventsova',
    },
  },
  'ury-nik-dereventsov.[06-07-1947]': {
    id: 'ury-nik-dereventsov.[06-07-1947]',
    baseInfo: {
      firstName: 'Ury',
      middleName: 'Nikolaevich',
      lastName: 'Dereventsov',
    },
  },
  'andrey-ury-dereventsov.[__-__-19__]': {
    id: 'andrey-ury-dereventsov.[__-__-19__]',
    baseInfo: {
      firstName: 'Andrey',
      middleName: 'Urievich',
      lastName: 'Dereventsov',
    },
  },
  'nikolay-ury-dereventsov.[__-__-19__]': {
    id: 'nikolay-ury-dereventsov.[__-__-19__]',
    baseInfo: {
      firstName: 'Nikolay',
      middleName: 'Urievich',
      lastName: 'Dereventsov',
    },
  },
  'michail-ury-dereventsov.[__-__-19__][__-__-19__]': {
    id: 'michail-ury-dereventsov.[__-__-19__][__-__-19__]',
    baseInfo: {
      firstName: 'Michail',
      middleName: 'Urievich',
      lastName: 'Dereventsov',
    },
  },
  'lyuba-vladimir-garbuzova.[28-04-1976]': {
    id: 'lyuba-vladimir-garbuzova.[28-04-1976]',
    baseInfo: {
      firstName: 'Lubov',
      middleName: 'Vladimirovna',
      lastName: 'Garbuzova',
    },
  },
  'marya-roman-chigrina.[06-03-1997]': {
    id: 'marya-roman-chigrina.[06-03-1997]',
    baseInfo: {
      firstName: 'Maria',
      middleName: 'Romanovna',
      lastName: 'Chigrina',
    },
  },
  'bogdan-sergey-chigrin.[07-08-2019]': {
    id: 'bogdan-sergey-chigrin.[07-08-2019]',
    baseInfo: {
      firstName: 'Bogdan',
      middleName: 'Sergeevich',
      lastName: 'Chigrin',
    },
  },
  'eva-sergey-chigrina.[05-10-2023]': {
    id: 'eva-sergey-chigrina.[05-10-2023]',
    baseInfo: {
      firstName: 'Eva',
      middleName: 'Sergeevna',
      lastName: 'Chigrina',
    },
  },
}

const cache: {
  gResValues: any;
  ts: number;
} = { gResValues: null, ts: 0 }
const isTsActual = ({ limit, ts }) => {
  const nowTs = new Date().getTime()
  return nowTs - ts <= limit
}
type TGDataFromCache = { ok: boolean; gResValues: any }
const getGDataFromCache = ({ tsLimit = 30 * 1000 }: { tsLimit?: number }): TGDataFromCache => {
  let res: TGDataFromCache = {
    ok: false,
    gResValues: null,
  }
  const isCacheActual = !!cache.gResValues && isTsActual({ limit: tsLimit, ts: cache.ts })
  if (isCacheActual) {
    res.ok = true
    res.gResValues = cache.gResValues
  }
  return res
}

const _getPersonData = ({ sheetData: rows, personId }: {
  sheetData: any;
  personId: string;
}): TPersonData => {
  const res: TPersonData = {
    id: personId,
    mainGallery: [],
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
      if (!!row[1]) res.mainGallery.push({
        url: row[ROW_INDEX.MAIN_GALLERY_ITEM_PHOTO_URL],
        descr: row[ROW_INDEX.MAIN_GALLERY_ITEM_PHOTO_DESCR],
      })
    }
  }
  if (!_isPersonDetected) res.message = 'Нет данных'
  return res
}

export const getSinglePersonInfo = async (req: TWithBlogRequest, res, _next) => {
  const { limit = 1000, personId } = req.body
  const maxLimit = 1000
  const modifiedLimit = limit <= maxLimit ? limit : maxLimit
  const result: TResponse = {
    ok: false,
    data: { id: personId },
  }

  // -- NOTE: Base data
  if (!!persons[personId]) {
    result.ok = true
    result.data.customService = { ok: true, data: persons[personId] }
  } else {
    result.message = 'Пока нет данных'
    return res.status(200).send(result)
  }
  // --

  const gDataFromCache = getGDataFromCache({})

  if (gDataFromCache.ok && !!gDataFromCache.gResValues) {
    const _res = _getPersonData({ sheetData: gDataFromCache.gResValues, personId })

    // result.ok = _res.ok
    if (!_res.ok) result.message = _res.message || 'Не удалось ничего найти в Google Sheets'
    // result.gRes = gRes
    result.data.id = personId
    result.data.googleSheets = {
      ok: true,
      data: _res,
    }
  } else {
    let auth: any
    try {
      auth = req.pravoslevaBlog2023.googleSheetsAuth
    } catch (err) {
      return res.status(200).send({ ok: false, message: err.message || 'No err.message' })
    }

    // Create client instance for auth
    const client = await auth.getClient()
    // Instance of Google Sheets API
    const googleSheets = google.sheets({ version: 'v4', auth: client })
    const spreadsheetId = '1mMA2t1i5IcOyyfMQlk2nV4GL0hYJ8Kje7Ot59qHBvsY'

    let gRes: any
    try {
      gRes = await googleSheets.spreadsheets.values.get({ auth, spreadsheetId, range: `/family-tree-v1!A1:E${2 + modifiedLimit}` })
    } catch (err) {
      return res.status(500).send({ ok: false, message: `By Google: ${err.message || 'No err.message'}` })
    }
    
    if (!!gRes?.data?.values) {
      const _res = _getPersonData({ sheetData: gRes.data.values, personId })

      // NOTE: Put new data to cache
      if (_res.ok) {
        cache.gResValues = gRes.data.values
        cache.ts = new Date().getTime()
      }

      if (!_res.ok) result.message = _res.message || 'Не удалось ничего найти в Google Sheets'
      // result.gRes = gRes
      result.data.googleSheets = {
        ok: true,
        data: _res,
      }
    } else result.message = 'No gRes?.data?.values'
  }

  return res.status(200).send(result)
}
