import type { Collective, CouplingEvent, Emitted, Individual } from './types';

function useCoupling() {
  const { people } = useSociety();
  const { getLog, getAge, isAlive } = useIndividual();
  const { log } = useEvent();

  const singles = computed(() =>
    people.value.filter((individual) => {
      const individualLog = getLog(individual);
      return !individualLog.some(event => event.type === 'COUPLING');
    }),
  );

  const couples = computed(() =>
    log.value.reduce<Array<Collective<2>>>((result, event) => {
      if (event.type === 'COUPLING') {
        const { collective } = (event as Emitted<CouplingEvent>).payload;
        if (collective.every(isAlive)) {
          result.push(collective);
        }
      }
      return result;
    }, []),
  );

  function getCouplingEvents(day = 0) {
    if (day === 0) {
      return [];
    }
    return singles.value.reduce<Array<CouplingEvent>>((result, individual, index, array) => {
      const candidates = array.slice(index + 1);
      const bestMatch = findBestMatch(individual, candidates);
      if (bestMatch) {
        const roll = Math.random();
        if (roll < getDailyCouplingChance(individual)) {
          result.push({
            type: 'COUPLING',
            payload: {
              collective: [individual, bestMatch],
            },
          });
        }
      }
      return result;
    }, []);
  }

  function findBestMatch(individual: Individual, candidates: Array<Individual>) {
    let bestMatch: Individual | undefined;
    const individualAge = getAge(individual) / MILLISECONDS_IN_A_YEAR;
    let minAgeDiff = Infinity;
    for (const candidate of candidates) {
      const candidateAge = getAge(candidate) / MILLISECONDS_IN_A_YEAR;
      const ageDiff = Math.abs(individualAge - candidateAge);
      if (ageDiff < minAgeDiff) {
        minAgeDiff = ageDiff;
        if (ageDiff < 5) {
          bestMatch = candidate;
        }
      }
    }
    return bestMatch;
  }

  function getDailyCouplingChance(individual: Individual) {
    const age = getAge(individual) / MILLISECONDS_IN_A_YEAR;
    if (age < 18) {
      return 0;
    }
    const times = ((100 - 18) * 365) / AGE_DAYS_MULTIPLIER;
    return getPartialChance(0.8, times);
  }

  return {
    singles,
    couples,
    getCouplingEvents,
  };
}

export {
  useCoupling,
};
