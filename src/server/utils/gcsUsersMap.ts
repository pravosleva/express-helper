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
    this.state.set(userName, chatData)
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
