import type { AnyEvent, Emitted } from './types';

const useEvent = createSharedComposable(() => {
  const { create } = useEntity();

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
    const timestamp = new Date();
    const emittedEvents = events.map<Emitted<AnyEvent>>(event =>
      create({
        ...event,
        timestamp,
      }),
    );
    log.value.push(...emittedEvents);
    return emittedEvents;
  }

  function reset() {
    log.value = [];
  }

  return {
    log,
    emit,
    reset,
  };
});

export {
  useEvent,
};
