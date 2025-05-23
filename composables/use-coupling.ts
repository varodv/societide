import type { Collective, CouplingEvent, Emitted, Individual } from './types';

const COUPLING_CHANCE = 0.8;
const MIN_COUPLING_AGE = 18;
const MAX_COUPLING_AGE_DIFF = 5;

function useCoupling() {
  const { people } = useSociety();
  const { getLog, getAge, isAlive } = useIndividual();
  const { log } = useEvent();

  const singles = computed(() =>
    people.value.filter((individual) => {
      const age = getAge(individual) / MILLISECONDS_IN_A_YEAR;
      if (age < MIN_COUPLING_AGE) {
        return false;
      }
      const individualLog = getLog(individual);
      return !individualLog.some(event => event.type === 'COUPLING');
    }),
  );

  const couples = computed(() =>
    log.value.reduce<Array<Collective<2>>>((result, event) => {
      if (event.type === 'COUPLING') {
        const { collective: couple } = (event as Emitted<CouplingEvent>).payload;
        if (couple.every(isAlive)) {
          result.push(couple);
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
      const candidates = array
        .slice(index + 1)
        .filter(
          candidate => !candidate.parents.some(parent => individual.parents.includes(parent)),
        );
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
        if (ageDiff <= MAX_COUPLING_AGE_DIFF) {
          bestMatch = candidate;
        }
      }
    }
    return bestMatch;
  }

  function getDailyCouplingChance(_individual: Individual) {
    const times = ((MAX_AGE - MIN_COUPLING_AGE) * 365) / AGE_DAYS_MULTIPLIER;
    return getPartialChance(COUPLING_CHANCE, times);
  }

  return {
    singles,
    couples,
    getCouplingEvents,
  };
}

export {
  COUPLING_CHANCE,
  MAX_COUPLING_AGE_DIFF,
  MIN_COUPLING_AGE,
  useCoupling,
};
