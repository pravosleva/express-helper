// NOTE: See also https://davidwells.io/snippets/get-difference-between-two-objects-javascript
import { inspect } from 'util'
import transform from 'lodash.transform'
import isEqual from 'lodash.isequal'
import isArray from 'lodash.isarray'
import isObject from 'lodash.isobject'

/**
 * Find difference between two objects
 * @param  {object} origObj - Source object to compare newObj against
 * @param  {object} newObj  - New object with potential changes
 * @return {object} differences
 */
function difference(origObj, newObj) {
  function changes(newObj, origObj) {
    let arrayIndexCounter = 0
    return transform(newObj, function (result, value, key) {
      if (!isEqual(value, origObj[key])) {
        let resultKey = isArray(origObj) ? arrayIndexCounter++ : key
        result[resultKey] = (isObject(value) && isObject(origObj[key])) ? changes(value, origObj[key]) : value
      }
    })
  }
  return changes(newObj, origObj)
}

type TResult = {
  ok: boolean;
  message?: string;
  namespace: string;
  diffs?: {
    [key: string]: any;
  };
  details?: {
    [key: string]: any;
  };
  expected?: {
    [key: string]: any;
  };
}

const cfg: {
  [key: string]: any;
} = {
  // NOTE: https://t.me/c/1482327140/16481
  kz2023: {
    // Required in Frontend
    t_offline_buyout_sms: true,
    partner_is_sberlike: true,
    t_sbp_payouts: false,
    t_require_iin: true,
    // Required in Backend only
    t_must_sell_samsung: false,
    t_card_payouts: false,
    t_photo_upload_wizard: true,
    t_direct_buyout_verified_via_api: true,
    t_kz_buyout_doc: true,
  },
  mtsmain2023: {
    // Required in Frontend
    // t_offline_buyout_sms: false,
    partner_is_sberlike: false,
    t_require_iin: false,
    // Required in Backend only
    // NOTE: Как настроен mtsmain (их там нет, wtf?): https://t.me/c/1482327140/17118
  },
  tstSample: {
    enabled: true,
    disabled: false,
  },
}

/**
 * Класс Одиночка предоставляет метод getInstance, который позволяет клиентам
 * получить доступ к уникальному экземпляру одиночки.
 */
export class Singleton {
  private static instance: Singleton;
   state: Map<string, { [key: string]: any }>;

  /**
   * Конструктор Одиночки всегда должен быть скрытым, чтобы предотвратить
   * создание объекта через оператор new.
   */
  private constructor() {
    this.state = new Map()
    for (const namespace in cfg) this.state.set(namespace, cfg[namespace])
  }

  /**
   * Статический метод, управляющий доступом к экземпляру одиночки.
   *
   * Эта реализация позволяет вам расширять класс Одиночки, сохраняя повсюду
   * только один экземпляр каждого подкласса.
   */
  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton();

    return Singleton.instance;
  }

  /**
   * Наконец, любой одиночка должен содержать некоторую бизнес-логику, которая
   * может быть выполнена на его экземпляре.
   */
  public hasNamespaceExists({ namespace }: { namespace: string }): boolean {
    return this.state.has(namespace)
  }
  getJSONDiffs({ obj1, obj2 }) {
    const result = {}
    if (Object.is(obj1, obj2)) return undefined

    if (!obj2 || typeof obj2 !== 'object') return obj2

    Object.keys(obj1 || {})
      .concat(Object.keys(obj2 || {}))
      .forEach((key) => {
        switch (true) {
          // NOTE: 
          case Array.isArray(obj1[key]) || Array.isArray(obj2[key]):
            if (!Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
              result[key] = obj2[key]
              return
            } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
              const arr = obj2[key].reduce((acc, item) => {
                if (!obj1[key].includes(item)) acc.push(item)
                return acc
              }, [])
              if (arr.length > 0) result[key] = arr
              return
            } else {
              // TODO:
            }
            break
          case typeof obj1[key] === 'undefined':
            // NOTE: Nothing?
            break
          case obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key]):
            result[key] = obj2[key] || (typeof obj2[key] !== 'boolean' ? `⚡ ${String(obj2[key])} (${typeof obj2[key]})` : obj2[key])
            // return
            break
          case typeof obj2[key] === 'object' && typeof obj1[key] === 'object':
            const value = this.getJSONDiffs({ obj1: obj1[key], obj2: obj2[key] })
            if (!!value) result[key] = value || `⚡ ${String(obj2[key])} (${typeof obj2[key]}) #2`
            break
          default:
            break
        }
      })
    return result
  }
  getJSONDiffs2 ({ obj1, obj2 }) {
    try {
      const diffs = difference(obj1, obj2)
      return JSON.parse(inspect(diffs, { showHidden: false, depth: null, colors: true }))
    } catch (err) {
      return {}
    }
  }
  public getAnalysis({ namespace, testedSettings }: { namespace: string; testedSettings: { [key: string]: any; } }): TResult {
    const result: TResult = {
      ok: true,
      namespace: '',
      message: 'Нет причин не доверять',
    }

    result.namespace = namespace

    if (this.hasNamespaceExists({ namespace })) {
      const targetState = this.state.get(namespace)
      result.message = 'Есть с чем сравнить переданный объект'
      result.expected = targetState

      const diffObj = this.getJSONDiffs({
        obj1: targetState,
        obj2: testedSettings,
      })
      if (!!diffObj && Object.keys(diffObj).length > 0) {
        result.ok = false
        result.diffs = diffObj
        result.message = 'В результате сравнения переданного объекта нашлись несоответствия'
        // result.details = {
        //   diffKeys: Object.keys(diffObj),
        //   diffValues: Object.values(diffObj),
        // }
      }
    }

    return result
  }

  public getState() {
    const state = {}
    
    this.state.forEach((value, key) => {
      state[key] = value
    })

    return state
  }
}

export const partnerSettings = Singleton.getInstance()
