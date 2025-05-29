import type { AnyEvent, Emitted, Subscription } from './types';

const useEvent = createSharedComposable(() => {
  const { create } = useEntity();
  const now = useNow();

  const subscriptions: Array<Subscription> = [];

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
    subscriptions.forEach((subscription) => {
      const subscriptionEvents = emittedEvents.filter(subscription.filter);
      if (subscriptionEvents.length > 0) {
        subscription.callback(...subscriptionEvents);
      }
    });
    return emittedEvents;
  }

  function subscribe(
    filter: Subscription['filter'],
    callback: Subscription['callback'],
    options: Subscription['options'] = {},
  ) {
    const subscription = create({
      filter,
      callback,
      options,
    });
    subscriptions.push(subscription);
    if (options.immediate) {
      const subscriptionEvents = log.value.filter(filter);
      if (subscriptionEvents.length > 0) {
        callback(...subscriptionEvents);
      }
    }
    return subscription.id;
  }

  function unsubscribe(id: Subscription['id']) {
    const index = subscriptions.findIndex(subscription => subscription.id === id);
    if (index < 0) {
      throw new Error ('The given subscription does not exist');
    }
    subscriptions.splice(index, 1);
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
