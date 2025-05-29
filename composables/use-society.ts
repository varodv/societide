import type { AnyEvent, BirthEvent, DeathEvent, Emitted, Individual } from './types';

const useSociety = createSharedComposable(() => {
  const { subscribe } = useEvent();

  const people = ref<Array<Individual>>([]);
  subscribe(
    event => event.type === 'BIRTH',
    (...events: Array<Emitted<AnyEvent>>) => {
      events.forEach((event) => {
        const { individual } = (event as Emitted<BirthEvent>).payload;
        people.value.push(individual);
      });
    },
    {
      immediate: true,
    },
  );
  subscribe(
    event => event.type === 'DEATH',
    (...events: Array<Emitted<AnyEvent>>) => {
      events.forEach((event) => {
        const { individual } = (event as Emitted<DeathEvent>).payload;
        const index = people.value.findIndex(
          currentIndividual => currentIndividual.id === individual.id,
        );
        people.value.splice(index, 1);
      });
    },
    {
      immediate: true,
    },
  );

  function reset() {
    people.value = [];
  }

  return {
    people,
    reset,
  };
});

export {
  useSociety,
};
