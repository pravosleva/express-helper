/**
 * Класс Одиночка предоставляет метод getInstance, который позволяет клиентам
 * получить доступ к уникальному экземпляру одиночки.
 */
export class Singleton {
  private static instance: Singleton;
   state: Map<string, { id: number, [key: string]: any }>;

  /**
   * Конструктор Одиночки всегда должен быть скрытым, чтобы предотвратить
   * создание объекта через оператор new.
   */
  private constructor() {
    this.state = new Map()
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
  public addUser({ userName, chatData }: { userName: string, chatData: any }) {
    const uniqueKey = userName || chatData?.id || 'no-data'
    const oldData = this.state.get(uniqueKey)
    const ts = new Date().getTime()

    if (!!oldData) {
      const count = oldData?.count || 1

      this.state.set(uniqueKey, { ...chatData, count: count + 1, ts })
    } else {
      this.state.set(uniqueKey, { ...chatData, count: 1, ts })
    }
  }
  public getState() {
    const state = {}
    
    this.state.forEach((value, key) => {
      state[key] = value
    })

    return state
  }
}

export const gcsUsersMap = Singleton.getInstance()
