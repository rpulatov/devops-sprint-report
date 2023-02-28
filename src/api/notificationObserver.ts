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
