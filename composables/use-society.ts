import type { BirthEvent, Emitted, Individual } from './types';

function useSociety() {
  const { log } = useEvent();
  const { isAlive } = useIndividual();

  const people = computed(() =>
    log.value.reduce<Array<Individual>>((result, event) => {
      if (event.type === 'BIRTH') {
        const { individual } = (event as Emitted<BirthEvent>).payload;
        if (isAlive(individual)) {
          result.push(individual);
        }
      }
      return result;
    }, []),
  );

  return {
    people,
  };
}

export {
  useSociety,
};
