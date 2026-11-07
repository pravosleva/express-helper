import { PushSubscription } from 'web-push';

class StateSingleton {
  private static instance: StateSingleton;
  // Ключ — строка (endpoint), значение — сам объект подписки
  private state: Map<string, { subscription: PushSubscription; nickname: string }>;

  private constructor() {
    this.state = new Map();
  }

  public static getInstance(): StateSingleton {
    if (!StateSingleton.instance) {
      StateSingleton.instance = new StateSingleton();
    }
    return StateSingleton.instance;
  }

  // Получить массив всех подписок
  public get subscriptions(): { subscription: PushSubscription; nickname: string }[] {
    return Array.from(this.state.values());
  }

  public get size(): number {
    return this.state.size;
  }

  // Добавление подписки (перезапишет старую, если endpoint совпадает)
  public add({ subscription, nickname }: { subscription: PushSubscription; nickname: string }): void {
    if (subscription && subscription.endpoint) {
      this.state.set(subscription.endpoint, { subscription, nickname });
    }
  }

  // Удаление по объекту или по endpoint
  public delete(subscription: PushSubscription | string): boolean {
    const endpoint = typeof subscription === 'string'
      ? subscription
      : subscription?.endpoint;

    return this.state.delete(endpoint);
  }

  // Проверка наличия
  public has(subscription: PushSubscription | string): boolean {
    const endpoint = typeof subscription === 'string'
      ? subscription
      : subscription?.endpoint;

    return this.state.has(endpoint);
  }

  // Очистка всех подписок (полезно при тестах)
  public clear(): void {
    this.state.clear();
  }
}

export const state = StateSingleton.getInstance();
