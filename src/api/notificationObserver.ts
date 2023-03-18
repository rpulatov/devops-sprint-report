type ObserverFn = (notificationText: string) => void;

class NotificationObserver {
  observers: ObserverFn[];
  constructor() {
    this.observers = [];
  }

  subscribe(fn: ObserverFn) {
    this.observers.push(fn);
  }

  unsubscribe(fn: ObserverFn) {
    this.observers = this.observers.filter((subscriber) => subscriber !== fn);
  }

  broadcast(notificationText: string) {
    this.observers.forEach((subscriber) => subscriber(notificationText));
  }
}

export const notificationObserver = new NotificationObserver();

export function errorNotification(e: unknown) {
  if (e instanceof Error) {
    notificationObserver.broadcast(e.message);
  } else if (typeof e === 'string') {
    notificationObserver.broadcast(e);
  } else {
    notificationObserver.broadcast('Api error');
  }
  throw e;
}
