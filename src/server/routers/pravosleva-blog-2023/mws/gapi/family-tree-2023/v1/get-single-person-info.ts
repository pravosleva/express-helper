import { TWithBlogRequest } from '~/routers/pravosleva-blog-2023/types'
import { THelp } from '~/utils/express-validation'

export const rules: THelp = {
  params: {
    body: {
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

const persons = {
  'leonty-egorovich-dereventsov[elena-f-f-f-f].[__-__-1820]': {
    id: 'leonty-egorovich-dereventsov[elena-f-f-f-f].[__-__-1820]',
    baseInfo: {
      firstName: 'Leonty',
      middleName: 'Egorovich',
      lastName: 'Dereventsov',
    },
  },
  'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1875]': {
    id: 'ivan-leonty-dereventsov[elena-f-f-f].[__-__-1875]',
    baseInfo: {
      firstName: 'Ivan',
      middleName: 'Leontievich',
      lastName: 'Dereventsov',
    },
  },
  'marfa-stepan-dereventsova[elena-f-f-m].[__-__-1875]': {
    id: 'marfa-stepan-dereventsova[elena-f-f-m].[__-__-1875]',
    baseInfo: {
      firstName: 'Marfa',
      middleName: 'Stepanovna',
      lastName: 'Dereventsova',
    },
  },
  'den-vladimir-pol.[13-04-1986]': {
    id: 'den-vladimir-pol.[13-04-1986]',
    baseInfo: {
      firstName: 'Denis',
      middleName: 'Vladimirovich',
      lastName: 'Poltoratsky',
    },
  },
  'lidya-alex-pol.[17-10-1990]': {
    id: 'lidya-alex-pol.[17-10-1990]',
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
  'fedor-michail-izvekov.[__-__-1909][__-__-____]': {
    id: 'fedor-michail-izvekov.[__-__-1909][__-__-____]',
    baseInfo: {
      firstName: 'Izvekov',
      middleName: 'Fedor',
      lastName: 'Michailovich',
    },
  },
  'lubov-fedor-poltoratskaya.[19-06-1936][29-01-2022]': {
    id: 'lubov-fedor-poltoratskaya.[19-06-1936][29-01-2022]',
    baseInfo: {
      firstName: 'Lubov',
      middleName: 'Fedorovna',
      lastName: 'Poltoratskaya',
    },
  },
  'vladimir-vladimir-poltoratsky.[10-11-1961][27-12-2014]': {
    id: 'vladimir-vladimir-poltoratsky.[10-11-1961][27-12-2014]',
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
  'nikolay-ivan-dereventsov.[30-12-1909][__-__-1978]': {
    id: 'nikolay-ivan-dereventsov.[30-12-1909][__-__-1978]',
    baseInfo: {
      firstName: 'Nikolay',
      middleName: 'Ivanovich',
      lastName: 'Dereventsov',
    },
  },
  'vasily-ivan-dereventsov[elena-f-fs].[10-08-1913][__-__-1984]': {
    id: 'vasily-ivan-dereventsov[elena-f-fs].[10-08-1913][__-__-1984]',
    baseInfo: {
      firstName: 'Vasily',
      middleName: 'Ivanovich',
      lastName: 'Dereventsov (Derevenets)',
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
  'irina-kirill-dereventsova.[22-04-1910]': {
    id: 'irina-kirill-dereventsova.[22-04-1910]',
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
  'andrey-ury-dereventsov.[02-08-1973]': {
    id: 'andrey-ury-dereventsov.[02-08-1973]',
    baseInfo: {
      firstName: 'Andrey',
      middleName: 'Urievich',
      lastName: 'Dereventsov',
    },
  },
  'tatyana-vik-dereventsova.[26-02-1973]': {
    id: 'tatyana-vik-dereventsova.[26-02-1973]',
    baseInfo: {
      firstName: 'Tatyana',
      middleName: 'Viktorovna',
      lastName: 'Dereventsova',
    },
  },
  'anastasia-andrey-dereventsova.[06-07-1998]': {
    id: 'anastasia-andrey-dereventsova.[06-07-1998]',
    baseInfo: {
      firstName: 'Anastasia',
      middleName: 'Andreevna',
      lastName: 'Dereventsova',
    },
  },
  'demid-andrey-dereventsova.[28-10-2005]': {
    id: 'demid-andrey-dereventsova.[28-10-2005]',
    baseInfo: {
      firstName: 'Demid',
      middleName: 'Andreevich',
      lastName: 'Dereventsov',
    },
  },
  'nikolay-ury-dereventsov.[11-06-1979]': {
    id: 'nikolay-ury-dereventsov.[11-06-1979]',
    baseInfo: {
      firstName: 'Nikolay',
      middleName: 'Urievich',
      lastName: 'Dereventsov',
    },
  },
  'svetlana-ivan-dereventsova.[08-12-1978]': {
    id: 'svetlana-ivan-dereventsova.[08-12-1978]',
    baseInfo: {
      firstName: 'Svetlana',
      middleName: 'Ivanovna',
      lastName: 'Dereventsova',
    },
  },
  'pavel-nik-dereventsov.[21-03-2005]': {
    id: 'pavel-nik-dereventsov.[21-03-2005]',
    baseInfo: {
      firstName: 'Pavel',
      middleName: 'Nikolaevich',
      lastName: 'Dereventsov',
    },
  },
  'polina-nik-dereventsova.[15-01-2008]': {
    id: 'polina-nik-dereventsova.[15-01-2008]',
    baseInfo: {
      firstName: 'Polina',
      middleName: 'Nikolaevna',
      lastName: 'Dereventsova',
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
  'roman-nik-garbuzov.[26-08-1976]': {
    id: 'roman-nik-garbuzov.[26-08-1976]',
    baseInfo: {
      firstName: 'Roman',
      middleName: 'Nikolaevich',
      lastName: 'Garbuzov',
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
  'ivan-roman-garbuzov.[16-05-2012]': {
    id: 'ivan-roman-garbuzov.[16-05-2012]',
    baseInfo: {
      firstName: 'Ivan',
      middleName: 'Romanovich',
      lastName: 'Garbuzov',
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

export const getSinglePersonInfo = async (req: TWithBlogRequest, res, _next) => {
  const { personId } = req.body
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

  const gPersonData = await req.familyTreeGoogleSheetCache.getPersonData({ personId, pageName: '/family-tree-2023', columns: ['A', 'E'] })

  result.data.googleSheets = {
    ok: true,
    data: gPersonData,
  }

  if (!gPersonData.ok) result.message = gPersonData.message || 'Не удалось ничего найти в Google Sheets'

  return res.status(200).send(result)
}
