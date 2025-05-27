import type { AnyEvent, Emitted, Subscriber } from './types';

const useEvent = createSharedComposable(() => {
  const { create } = useEntity();
  const now = useNow();

  const subscribers: Array<Subscriber> = [];

  const log = useLocalStorage<Array<Emitted<AnyEvent>>>('log', [], {
    serializer: {
      read: (raw) => {
        const value = JSON.parse(raw) as Array<
          Omit<Emitted<AnyEvent>, 'timestamp'> & { timestamp: string }
        >;
        return value.map(element => ({
          ...element,
          timestamp: new Date(element.timestamp),
        }));
      },
      write: value => JSON.stringify(value),
    },
  });

  function emit(...events: Array<AnyEvent>) {
    const timestamp = now.value;
    const emittedEvents = events.map<Emitted<AnyEvent>>(event =>
      create({
        ...event,
        timestamp,
      }),
    );
    log.value.push(...emittedEvents);
    subscribers.forEach((subscriber) => {
      const subscriberEvents = emittedEvents.filter(subscriber.filter);
      if (subscriberEvents.length > 0) {
        subscriber.callback(...subscriberEvents);
      }
    });
    return emittedEvents;
  }

  function subscribe(
    filter: Subscriber['filter'],
    callback: Subscriber['callback'],
    options: Subscriber['options'] = {},
  ) {
    const subscriber = create({
      filter,
      callback,
      options,
    });
    subscribers.push(subscriber);
    if (options.immediate) {
      const subscriberEvents = log.value.filter(filter);
      if (subscriberEvents.length > 0) {
        callback(...subscriberEvents);
      }
    }
    return subscriber.id;
  }

  function unsubscribe(id: Subscriber['id']) {
    const index = subscribers.findIndex(subscriber => subscriber.id === id);
    if (index < 0) {
      throw new Error ('The given subscriber does not exist');
    }
    subscribers.splice(index, 1);
  }

  function reset() {
    log.value = [];
  }

  return {
    log,
    emit,
    subscribe,
    unsubscribe,
    reset,
  };
});

export {
  useEvent,
};
