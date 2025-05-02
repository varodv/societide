import type { AnyEvent, Emitted } from './types';
import { createSharedComposable, useStorage } from '@vueuse/core';
import { useEntity } from './use-entity';

const useEvent = createSharedComposable(() => {
  const { create } = useEntity();

  const log = useStorage<Array<Emitted<AnyEvent>>>('log', [], undefined, {
    serializer: {
      read: (raw) => {
        const value = JSON.parse(raw) as Array<Omit<Emitted<AnyEvent>, 'timestamp'> & { timestamp: string }>;
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
    const emittedEvents = events.map<Emitted<AnyEvent>>(event => create({
      ...event,
      timestamp,
    }));
    log.value.push(...emittedEvents);
    return emittedEvents;
  }

  return {
    log,
    emit,
  };
});

export {
  useEvent,
};
